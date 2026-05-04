# Mutual TLS (mTLS)

## Prerequisites

- **[Authentication](./authentication.md)** [Must read] - mTLS is a transport-layer authentication mechanism; understanding the service-to-service auth landscape (API keys, JWT with service accounts, SPIFFE) is required to know when mTLS is the right choice.
- **TLS/HTTPS** [Must read] - mTLS extends standard TLS; understanding the standard TLS handshake (server certificate, CA trust chain) is required before the mutual extension makes sense. <!-- link: ../components/tls.md -->
- **Asymmetric Cryptography** [Recommended] - mTLS client certificates rely on public/private key pairs and a CA trust chain; understanding certificate signing is needed to reason about PKI design. <!-- link: ../algorithms/cryptography.md -->

---

## Table of Contents

<!-- Partial article — seeded from authentication.md. Sections to be completed. -->

- [How mTLS Works](#how-mtls-works)
- [PKI Management](#pki-management)
- [Certificate Lifecycle — Issuance, Rotation, Revocation](#certificate-lifecycle--issuance-rotation-revocation)
- [Service Mesh Integration](#service-mesh-integration)

---

## TLDR

<!-- To be written when this article is fully developed. -->

---

## How mTLS Works

Standard TLS authenticates the server to the client — the server presents a certificate and the client verifies it against a trusted CA. mTLS adds the reverse: the client also presents a certificate, and the server verifies it. Both sides prove their identity during the handshake, before any application data is exchanged.

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

The server validates the client certificate against its trusted CA. The certificate encodes the client's identity in the Common Name or Subject Alternative Name field. No API keys, no application-layer tokens — identity is established at the connection layer before any application code runs.

---

## PKI Management

PKI (Public Key Infrastructure) is the operational challenge of mTLS. Someone must run and maintain it:

- **Certificate Authority (CA):** An internal CA issues certificates to services. Options: run your own (step-ca, cfssl, HashiCorp Vault PKI), use a managed CA (AWS Private CA), or delegate to a service mesh.
- **Certificate issuance:** Each service needs a certificate with its identity encoded in the SAN. Short TTL (hours to days, not years) limits the exposure window of a compromised certificate.
- **Certificate rotation:** Certs must be rotated before expiry without downtime. This requires the service to load the new cert and the CA to issue it ahead of expiry. Manual rotation does not scale.
- **Revocation:** When a service is decommissioned or compromised, its certificate must be revoked. Two mechanisms:
  - **CRL (Certificate Revocation List):** CA publishes a list of revoked serial numbers. Verifiers download periodically — revocation is not instant.
  - **OCSP (Online Certificate Status Protocol):** Verifier queries the CA in real-time for each cert. Instant revocation but adds latency and a dependency on the CA being reachable.

Without automation, PKI becomes a toil-intensive, error-prone operation. Manual cert rotation across hundreds of services is where mTLS deployments fail in practice.

---

## Service Mesh Integration

_Service meshes handle PKI automatically — the correct production approach for mTLS at scale._

**Istio:** The control plane's Citadel (now merged into istiod) acts as the internal CA. It issues short-lived X.509 certificates to each Envoy sidecar proxy. Certs are automatically rotated before expiry. The application process never handles TLS directly — the sidecar intercepts all traffic and handles the mTLS handshake transparently.

```
Pod A (App + Envoy sidecar)   →   mTLS   →   Pod B (App + Envoy sidecar)
        ↑                                              ↑
  cert issued by Istio CA                   cert issued by Istio CA
  auto-rotated every 24h                    auto-rotated every 24h
```

**Linkerd:** Similar model. The control plane issues short-lived certs (default: 24h) via its own CA. Linkerd's proxy is lighter-weight than Envoy; trade-off is less configurability.

**cert-manager (Kubernetes):** Manages certificate issuance and rotation for workloads that handle TLS themselves (not via sidecar). Integrates with Let's Encrypt, HashiCorp Vault, AWS Private CA. Suitable when you want cert management without a full service mesh.

**When NOT to use a service mesh for mTLS:**

- Heterogeneous infrastructure (VMs + containers + Lambda) — sidecar model doesn't apply. Use SPIFFE/SPIRE instead.
- Simple two-service system where the operational overhead of a mesh is not justified — use JWT with service accounts or API keys.
