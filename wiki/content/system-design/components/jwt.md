# JWT (JSON Web Token)

## Prerequisites

- **[Authentication](./authentication.md)** [Must read] - JWTs are a mechanism within token-based authentication; understanding stateful vs stateless auth, session-based alternatives, and the revocation trade-off is required context.
- **Asymmetric Cryptography** [Must read] - RS256 and ES256 signing rely on public/private key pairs; understanding why the private key signs and the public key verifies is required before the signing algorithm section makes sense. <!-- link: ../algorithms/cryptography.md -->

---

## Table of Contents

<!-- Partial article — seeded from authentication.md. Sections to be completed. -->

- [Structure — Header, Payload, Signature](#structure--header-payload-signature)
- [Claims — Registered, Public, Private](#claims--registered-public-private)
- [Signing Algorithms — HS256 vs RS256 vs ES256](#signing-algorithms--hs256-vs-rs256-vs-es256)
- [Key Distribution — JWKS Endpoint](#key-distribution--jwks-endpoint)
- [Verification Gotchas](#verification-gotchas)

---

## TLDR

<!-- To be written when this article is fully developed. -->

---

## Structure — Header, Payload, Signature

A JWT is three base64url-encoded segments joined by dots: `header.payload.signature`

```text
eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImtleS0xIn0   ← header
.
eyJzdWIiOiI0MiIsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsInJvbGVzIjpbInVzZXIiXSwiaXNzIjoiYXV0aC5leGFtcGxlLmNvbSIsImF1ZCI6ImFwaS5leGFtcGxlLmNvbSIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoxNzAwMDAzNjAwfQ   ← payload
.
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c   ← signature
```

**Header** (decoded):

```json
{
  "alg": "RS256",
  "typ": "JWT",
  "kid": "key-1"
}
```

**Payload** (decoded):

```json
{
  "sub": "42",
  "email": "user@example.com",
  "roles": ["user"],
  "iss": "auth.example.com",
  "aud": "api.example.com",
  "iat": 1700000000,
  "exp": 1700003600
}
```

**Signature:**

```
Base64Url(sign(algorithm, header + "." + payload, secret_or_private_key))
```

The signature covers both header and payload. Modifying either byte invalidates it. The payload is base64url-encoded, not encrypted — anyone who intercepts the token can decode and read the claims. JWE (JSON Web Encryption) is the encrypted variant; standard JWTs (JWS) are signed-only.

---

## Claims — Registered, Public, Private

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
> Always validate `aud`. A token issued for `api.example.com` should be rejected by `admin.example.com`. Many libraries skip audience validation unless explicitly configured. An attacker who obtains a token for a low-privilege service can replay it against a higher-privilege one if `aud` is not checked.

---

## Signing Algorithms — HS256 vs RS256 vs ES256

### HS256 (HMAC-SHA256) — Symmetric

One shared secret is used to both sign and verify. Fast, simple, no key distribution infrastructure.

**Critical problem:** Any service that can _verify_ a token can also _forge_ one. In a microservices architecture where all services share the HS256 secret, a compromised service can mint tokens for any user.

Use HS256 only when a single service both issues and verifies tokens.

### RS256 (RSA-SHA256) — Asymmetric

The auth server signs with a private key. All other services verify with the corresponding public key, published at a JWKS endpoint.

```
Auth server:   sign(payload, private_key)   → token
API service:   verify(token, public_key)    → claims
```

Public key is safe to distribute. A compromised API service cannot forge tokens — it only has the public key. This is the correct choice for any multi-service architecture.

**Downsides:** RSA keys are large (2048+ bits), signing is slower than HMAC, and key rotation requires updating the JWKS endpoint and waiting for caches to expire.

### ES256 (ECDSA P-256 with SHA-256) — Asymmetric

Same trust model as RS256 (private sign, public verify) but uses elliptic curve cryptography. Smaller keys (~32 bytes vs ~256 bytes for RSA-2048), faster signing and verification. Preferred over RS256 for new systems.

| Algorithm | Type       | Key Size   | Sign Speed | Verify Speed | Use Case                             |
| --------- | ---------- | ---------- | ---------- | ------------ | ------------------------------------ |
| HS256     | Symmetric  | 32 bytes   | Very fast  | Very fast    | Single-service, internal tokens      |
| RS256     | Asymmetric | 2048+ bits | Slow       | Fast         | Multi-service, established ecosystem |
| ES256     | Asymmetric | 32 bytes   | Fast       | Fast         | Multi-service, new systems           |

---

## Key Distribution — JWKS Endpoint

For asymmetric algorithms, the verifier needs the public key. The standard mechanism is a JWKS (JSON Web Key Set) endpoint:

```
GET https://auth.example.com/.well-known/jwks.json

{
  "keys": [
    { "kty": "RSA", "kid": "key-1", "use": "sig", "n": "...", "e": "AQAB" }
  ]
}
```

The `kid` (key ID) in the token header tells the verifier which key to use. Services cache the JWKS and re-fetch only when they encounter an unknown `kid`.

### Zero-Downtime Key Rotation

1. Generate new key pair
2. Publish new key at JWKS endpoint alongside the old one
3. Switch signing to the new key (new tokens carry `kid: key-2`)
4. Wait for all tokens signed with `kid: key-1` to expire (one `exp` window)
5. Remove `kid: key-1` from JWKS

Services encountering an unknown `kid` attempt a single JWKS cache refresh — this handles the transition window where a new key appears before the cache has been updated. Do not retry aggressively during an AS outage.

---

## Verification Gotchas

<!-- To be expanded — security-critical section. Content seeded below, to be deepened. -->

### `alg:none` Attack

The JWT header specifies the algorithm. Some libraries, if not explicitly configured, accept `alg: "none"` — meaning no signature is required. An attacker changes the header to `{"alg":"none"}`, strips the signature, and the library accepts the forged token.

**Fix:** Always explicitly specify the allowed algorithm(s) in the verifier. Never accept `alg: "none"`.

```python
# WRONG — trusts the token's own alg header
jwt.decode(token, key)

# RIGHT — caller dictates allowed algorithms
jwt.decode(token, key, algorithms=["RS256"])
```

### Algorithm Confusion Attack

Attacker changes `alg` from `RS256` to `HS256` in the token header and re-signs using the server's _public key_ as the HMAC secret (the public key is known — it's at the JWKS endpoint). If the library reads the algorithm from the token header and switches to symmetric verification, the signature validates.

**Fix:** Same as above — always hardcode the allowed algorithm(s) in the verifier. Never allow the token to dictate its own verification algorithm.

### Clock Skew

JWT expiry is compared against the verifying server's clock. Clocks in a distributed system diverge by tens to hundreds of milliseconds. A token with `exp` exactly at the current time may be accepted by one instance and rejected by another.

Standard practice: configure a small `leeway` (30–60 seconds) in JWT verification. All major JWT libraries support this parameter. Monitor clock drift across service instances — NTP sync failures manifest as intermittent 401s that are difficult to diagnose.
