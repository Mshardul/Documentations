- [Foundations and Context](#foundations-and-context)
  - [Observability Basics](#observability-basics)
  - [Datadog at a Glance](#datadog-at-a-glance)
  - [Prerequisites and Setup Mindset](#prerequisites-and-setup-mindset)
- [Datadog Architecture and Core Concepts](#datadog-architecture-and-core-concepts)
  - [Platform Architecture](#platform-architecture)
  - [Core Data Types](#core-data-types)
  - [Tagging and Metadata](#tagging-and-metadata)
  - [UI Tour](#ui-tour)
- [Organizations, Accounts, and Access Control](#organizations-accounts-and-access-control)
  - [Organizations and Accounts](#organizations-and-accounts)
  - [Users, Roles, and Permissions](#users-roles-and-permissions)
  - [Keys and Authentication](#keys-and-authentication)
- [Datadog Agent and Integrations](#datadog-agent-and-integrations)
  - [Agent Fundamentals](#agent-fundamentals)
  - [Installing the Agent](#installing-the-agent)
  - [Containers and Kubernetes](#containers-and-kubernetes)
  - [Integrations](#integrations)
- [Metrics and Infrastructure Monitoring](#metrics-and-infrastructure-monitoring)
  - [Metric Types and Semantics](#metric-types-and-semantics)
  - [Host and Container Monitoring](#host-and-container-monitoring)
  - [Kubernetes Monitoring](#kubernetes-monitoring)
  - [Custom Metrics](#custom-metrics)
  - [Metric Query Language](#metric-query-language)
- [Dashboards and Visualization](#dashboards-and-visualization)
  - [Dashboard Concepts](#dashboard-concepts)
  - [Widgets](#widgets)
  - [Dashboard Design Patterns](#dashboard-design-patterns)
  - [Collaboration and Governance](#collaboration-and-governance)
- [Monitors, Alerting, and SLOs](#monitors-alerting-and-slos)
  - [Monitor Types](#monitor-types)
  - [Monitor Conditions](#monitor-conditions)
  - [Notifications and Routing](#notifications-and-routing)
  - [Downtimes and Maintenance](#downtimes-and-maintenance)
  - [SLOs and Error Budgets](#slos-and-error-budgets)
- [7. Log Management and Analytics](#7-log-management-and-analytics)
  - [Log Collection](#log-collection)
  - [Pipelines and Parsing](#pipelines-and-parsing)
  - [Indexing, Routing, and Retention](#indexing-routing-and-retention)
  - [Log Explorer and Analytics](#log-explorer-and-analytics)
- [APM and Distributed Tracing](#apm-and-distributed-tracing)
  - [APM Fundamentals](#apm-fundamentals)
  - [Instrumentation Setup](#instrumentation-setup)
  - [Trace Analysis](#trace-analysis)
  - [Trace Search and Analytics](#trace-search-and-analytics)
  - [Continuous Profiling (if available)](#continuous-profiling-if-available)
- [Real User Monitoring (RUM) and Synthetics](#real-user-monitoring-rum-and-synthetics)
  - [Browser RUM](#browser-rum)
  - [Mobile RUM (Conceptual)](#mobile-rum-conceptual)
  - [Synthetic Monitoring](#synthetic-monitoring)
  - [Using RUM and Synthetics Together](#using-rum-and-synthetics-together)
- [Network, Database, and Host‑Level Deep Dives](#network-database-and-hostlevel-deep-dives)
  - [Network Monitoring](#network-monitoring)
  - [Database Monitoring](#database-monitoring)
  - [Host and Process Analytics](#host-and-process-analytics)
- [Collaboration, Notebooks, Incidents, and Runbooks](#collaboration-notebooks-incidents-and-runbooks)
  - [Notebooks](#notebooks)
  - [Incident Management (Conceptual)](#incident-management-conceptual)
  - [Runbooks and Documentation](#runbooks-and-documentation)
- [Security Monitoring and Compliance (Conceptual Track)](#security-monitoring-and-compliance-conceptual-track)
  - [Security Products Overview](#security-products-overview)
  - [Signals and Rules](#signals-and-rules)
  - [Security Dashboards](#security-dashboards)
- [Automation, API, and “Datadog as Code”](#automation-api-and-datadog-as-code)
  - [API Fundamentals](#api-fundamentals)
  - [Scripting and Automation](#scripting-and-automation)
  - [Infrastructure as Code (Conceptual)](#infrastructure-as-code-conceptual)
  - [CI/CD Integration](#cicd-integration)
- [Governance, Cost Management, and Best Practices](#governance-cost-management-and-best-practices)
  - [Pricing Dimensions (Conceptual)](#pricing-dimensions-conceptual)
  - [Cost Drivers and Pitfalls](#cost-drivers-and-pitfalls)
  - [Cost Optimization Techniques](#cost-optimization-techniques)
  - [Organization‑wide Best Practices](#organizationwide-best-practices)
- [Capstone and Real‑World Scenarios](#capstone-and-realworld-scenarios)
  - [Capstone 1 – Monolith Service](#capstone-1--monolith-service)
  - [Capstone 2 – Microservices System](#capstone-2--microservices-system)
  - [Capstone 3 – SRE Runbook and Incident](#capstone-3--sre-runbook-and-incident)
  - [Cost \& Governance Exercise](#cost--governance-exercise)

## Foundations and Context

### Observability Basics

- describes how you "see" a system from outside.
- "monitoring" is narrower (known checks), observability is broader (answer unknown questions from telemetry)
- Datadog is essentially a commercial implementation of observability that operationalizes metrics, logs, traces, and related signals across typical modern architectures like 3-tier apps and microservices.

#### What is monitoring vs observability

##### Monitoring

- is continuously checking predefined conditions and thresholds to see if a system is "healthy enough" according to known expectations.
- Typical artifacts example
    - CPU > 90% for 5 minutes
    - HTTP 5xx error rate > 2% in prod
    - Disk Usage > 80%
- In Datadog terms, 
    - **monitoring** = monitors on metrics/logs/traces/synthetics firing to paging tools, dashboards showing red/green states, and SLO error-budget burn alerts.

##### Observability

- how easily you can understand the internal state of a system purely from its external outputs (telemetry)
- Example questions that can be answered
    - Why did latency spike only for users in ap-south-1 on checkout between 18:00 - 18:10?
    - Which downstream dependency is causing retries in the payment service?
- In Datadog terms,
    - **observability** = rich, high-quality metrics, logs, traces, events, RUM, synthetics, and profiles with good tags, plus tools to correlate and query them flexibly.

##### How they relate?

- Monitoring is an application of observability - you observe first, then define rules and SLOs out of those observations.
- In practice,
    - Observability data -> dashboards + ad-hoc queries (exploration).
    - Monitoring rules -> alerts and SLOs built on top of that data.
- **Monitoring checks known failure conditions. Observability gives you enough rich signals to debug unknown failure modes without code changes.**

#### The three pillars: metrics, logs, traces

##### Metrics

- Numeric time-series, aggregated over time window (eg every 10s)
- Examples: `system.cpu.user`, `nginx.net.request_per_s`, `checkout.request.count`, `checkout.error.rate`, `checkout.latency.p95`
- Compact and cheap to store; Great for dashboards and monitors. Often aggregated (per service, per region, per endpoint)
- **In Datadog:**
    - Collected by the `Agent (infra metrics)` + `libraries (DogStatsD, client libraries)`.
    - Visualized on Dashboards and used in metric monitors / SLOs.

##### Logs

- discrete records of events, usually text + structured fields
- Examples: Access log line for each HTTP req; Application error with Stack Trace; Audit Log
- Very detailed (includes context). High Volume and more expensive to retain.
- **In Datadog:**
    - Collected by Agent or directly via APIs.
    - Processed through `log pipelines (parse, enrich, route, archive`.
    - Queried in `Log Explorer`, used for log monitors and security detection.

##### Traces (APM)

- end-to-end record of a single request as it flows through services.
- A `Trace` is made of `spans`, each representing a unit of work.
- Example: User hits `/checkout` -> `web` service -> `order` service -> `payment` service -> DB
    - one trace with spans: `web.handle_request`, `order.create_order`, `payment.charge_code`, `db.query.orders`
- Things to take care
    - Show **casual chain** and **per-span timings**.
    - Reveal exactly where latency or errors are introduced.
    - Bridge infra and app: you can go from a metric spike to a specific slow trace.
- **In Datadog:**
    - Collected by language-specific APM agents (auto-instrumentation).
    - Correlated with metrics/logs via tags like `env`, `service`, `version`, `trace_id`.

##### How they work together in Datadog

- Metrics tell you that something is wrong, traces show where, logs show why.
- Imagine your checkout API experiences a latency spike
    - Dashboard shows p95 latency is high for `service:checkout` metric.
    - Click into traces: See slow traces, each with spans showing `payment-service` calls are slow.
    - Jump to logs: For those `trace_ids`, log search reveal DB connection timeouts in `payment-service`.

#### Events, RUM, synthetics, profiles

- additional signals that complete the picture.

##### Events

- What: Discrete noteworth happenings.
- Examples
    - Deployment of checkout-service v2.3.1 to prod
- **In Datadog**,
    - appears as event stream adn markers on timeseries graphs.
    - very useful in correlating "metric spike started exactly at deploy X"

##### RUM (Real User Monitoring)

- What: Telemetry from real users’ browsers or mobile apps
    - page loads, resources, JS errors, user actions, performance metrics.
- It answers questions like,
    - What are users actually experiencing?
    - Is frontend performance bad only in certain regions/devices?
- **In Datadog**,
    - JS/mobile SDKs send user‑side metrics and events;
    - tied to backend traces when configured.

##### Synthetics

- What: Scripted, scheduled tests that hit your API or web UI from various locations, even when no real users are active.
- Types:
    - Uptime (simple HTTP/ICMP).
    - API tests (assert status, body, latency).
    - Browser tests (simulate full user journeys).
- Role:
    - Early detection before real users complain.
    - External perspective, including DNS/CDN/routing issues.

##### Profiles (Continuous Profiling)

- What: Fine‑grained samples of CPU, memory, etc., tied to code (which functions, which lines).
- Deep performance tuning and cost optimization.
    - E.g., “90% of CPU time is in JSON serialization function X.”

#### Typical production architecture (3‑tier, microservices) and where Datadog fits

##### Architecture 1: 3-tier web application

- Tiers
    - Web UI (browser + maybe mobile app).
    - Application server (monolith or a couple of services).
    - Database (and maybe a cache like Redis).
- Where Datadog plugs in:
    - Frontend:
        - RUM SDK in browser/mobile.
        - Synthetics hitting key pages (login, checkout).
    - App servers:
        - Datadog Agent on host/VM or as sidecar in containers.
        - APM tracer for the application language.
        - Application logs forwarded via Agent or logging library.
    - DB and cache:
        - DB integration (Postgres/MySQL/Mongo, Redis) via Agent or dedicated integration
- Data flow:
    - Metrics: Host metrics (CPU, memory, network) + DB/cache metrics + custom app metrics.
    - Logs: Access logs, application logs, DB logs.
    - Traces: One trace per request, spanning app → DB/cache calls.
    - Events: Deployments, migrations, incidents.
    - RUM/synthetics: User experience + uptime.

##### Architecture 2: Microservice Architecture

- Components:
    - Many services (checkout, cart, catalog, payments, notification, etc.).
    - Message queues, multiple data stores, API gateway, service mesh.
- Where Datadog plugs in:
    - Each node/Kubernetes worker runs an Agent for infra metrics, logs, Autodiscovery.
    - Each service has:
        - APM tracer.
        - Logs shipped with `env`, `service`, `version`, `team` tags.
    - Service mesh / ingress / gateway also integrated (e.g., Envoy, NGINX, AWS ALB).
    - RUM and synthetics cover the edge experience.
- Resulting capabilities:
    - Service Map: auto‑generated graph of which services call which others.
    - RUM → trace linking: see which backend trace served a given user action.
    - Infra views: pod/node health, cluster overview, autoscaling effects.

##### How Datadog becomes the central pane

- Infra, app, network, DB, and user experience signals converge.
- You move fluidly from symptoms (metric spike) → path (trace graph) → root cause (logs, events, profiles).

### Datadog at a Glance
  
- SaaS nature, regions, organizations, accounts
- High‑level feature map: Infra, APM, Logs, RUM, Synthetics, Security, Network, DB
- Typical personas: backend engineer, SRE, DevOps, security, product

### Prerequisites and Setup Mindset
  
- Basic Linux, networking, HTTP knowledge
- Understanding of containers, Docker, and Kubernetes (at least conceptually)
- Git/CI basics for later automation modules

## Datadog Architecture and Core Concepts

### Platform Architecture

- Datadog control plane vs your infra
- Data flow: agent / SDK → intake endpoints → storage → query and UI
- Limits, quotas, and high‑level retention ideas

### Core Data Types

- Metrics: gauges, counts, rates, distribution metrics
- Logs: events with message + attributes
- Traces: spans, services, resources
- Events: deployments, incidents, custom events
- RUM sessions and synthetic tests (as special data types)

### Tagging and Metadata
  
- Tag format: key:value
- Mandatory tags: env, service, version, region, team
- Tag cardinality and performance/cost implications
- Naming conventions for services, dashboards, monitors

### UI Tour

- Global navigation (metrics, logs, APM, infra, dashboards, security, etc.)
- Search, service catalog / software catalog concepts
- Dark mode, time ranges, global filters

## Organizations, Accounts, and Access Control

### Organizations and Accounts

- Single vs multi‑org
- When multi‑org is used (acquisitions, strict isolation, etc.)

### Users, Roles, and Permissions

- Built‑in roles (read‑only, standard, admin, etc.)
- Custom roles and scoping to tags/environments
- Least‑privilege thinking

### Keys and Authentication

- API keys vs application keys
- Key rotation practices
- High‑level SSO/SCIM concepts (no deep dive)

## Datadog Agent and Integrations

### Agent Fundamentals

- What the agent does (metrics, logs, traces, checks)
- Agent architecture and main processes
- Configuration files, environment variables

### Installing the Agent

- Linux, Windows, macOS installation patterns
- Package managers and one‑line install scripts
- Validating installation and connectivity

### Containers and Kubernetes

- Agent on Docker: host mode vs sidecar
- Kubernetes DaemonSet and Helm chart basics
- Autodiscovery basics (labels/annotations‑based configs)

### Integrations

- Agent‑based vs API‑based integrations
- Common infra integrations: AWS, GCP, Azure, Docker, K8s, NGINX, Redis, Postgres, Kafka
- Integration‑provided default dashboards and service checks

## Metrics and Infrastructure Monitoring

### Metric Types and Semantics

- Gauge, count, rate, distribution – when to use which
- Host‑level metrics: CPU, memory, disk IO, network
- Service‑level metrics: req/s, latency, error rate (RED metrics)

### Host and Container Monitoring

- Infrastructure list, host map
- Live containers and container resource usage
- Cluster overview, availability zones, regions

### Kubernetes Monitoring

- Node, pod, container, namespace, and cluster metrics
- Kube events and health checks
- Workload‑oriented dashboards (deployments, DaemonSets, etc.)

### Custom Metrics

- StatsD and DogStatsD basics
- Metric naming conventions and units
- Tagging custom metrics and cardinality pitfalls

### Metric Query Language

- Basic metric queries (avg, sum, max, min)
- Time aggregation and space aggregation
- Functions (rate, rollup, moving average, anomaly functions)

## Dashboards and Visualization

### Dashboard Concepts

- Dashboard types and use‑cases (overview vs drill‑down)
- Time ranges, global filters, and template variables

### Widgets

- Timeseries, query value, toplist, heatmap, table, host map, geomap
- Status widgets, notes and links, images
- Best practices for widget configuration

### Dashboard Design Patterns

- Service dashboards (RED metrics, dependencies, errors)
- Infra dashboards (nodes, clusters)
- Feature‑specific dashboards (e.g., one per bounded context or team)

### Collaboration and Governance

- Sharing dashboards (read‑only vs editable)
- Tagging dashboards per team/service
- Versioning patterns (Git + API / “as code” overview)

## Monitors, Alerting, and SLOs

### Monitor Types

- Metric monitors
- Log monitors
- APM/trace monitors
- RUM and synthetics monitors
- Process, integration, and custom checks

### Monitor Conditions

- Threshold‑based alerts (static and dynamic)
- Anomaly detection and outlier detection (high level)
- Evaluation windows, alerting on absence of data

### Notifications and Routing

- Notification channels: email, chat, on‑call tools, webhooks
- Using tags for alert routing (env/team/service‑based routing)
- Multi‑alert vs grouped alerts

### Downtimes and Maintenance

- Scheduled downtimes
- Tag‑scoped downtimes
- Release/maintenance window handling

### SLOs and Error Budgets

- SLI vs SLO vs SLA
- Request‑based and timeslice‑based SLOs
- Burn rate, multi‑window, multi‑burn‑rate alert concepts

## 7. Log Management and Analytics

### Log Collection

- File tailing and container log collection
- Logging from applications via libraries/SDKs
- Cloud service log forwarding patterns

### Pipelines and Parsing

- Pipeline structure and ordering
- Parsers: JSON, Grok, rules
- Enrichment: remapping fields, adding tags
- Redaction of sensitive data

### Indexing, Routing, and Retention

- Log indexes and retention per index
- Sampling and routing (index vs archive)
- Archive storage and rehydration concepts

### Log Explorer and Analytics

- Search syntax (free‑text, attribute‑based, boolean)
- Facets, measures, group‑by, and visualizations
- Patterns view and Live Tail
- Typical workflows for debugging issues

## APM and Distributed Tracing

### APM Fundamentals

- Service, resource, trace, span concepts
- RED metrics from traces
- Service health views and service map

### Instrumentation Setup

- Auto‑instrumentation for common languages (Java, Node.js, Python, etc.)
- Configuring env, service, version tags
- Propagation headers for cross‑service tracing
- Sampling strategies (head‑based, tail‑based – conceptual)

### Trace Analysis

- Viewing traces and spans
- Flame graphs and trace waterfall
- Identifying hot paths, N+1 issues, slow dependencies

### Trace Search and Analytics

- Filtering by service, endpoint, error type, user attributes
- Latency distribution analysis
- Correlation of traces with logs and metrics

### Continuous Profiling (if available)

- CPU and memory profiling concepts
- Linking profiles with traces and code

## Real User Monitoring (RUM) and Synthetics

### Browser RUM

- RUM SDK setup basics
- Page views, resources, errors, user actions
- Core performance metrics and web vitals

### Mobile RUM (Conceptual)

- Mobile SDKs and session concepts
- Crash reporting high‑level ideas

### Synthetic Monitoring

- Uptime checks / HTTP checks
- Multi‑step API tests
- Browser tests and user‑journey tests
- Locations, frequency, assertions, variables

### Using RUM and Synthetics Together

- Coverage vs real‑user behavior
- Alerting from synthetics vs RUM signals

## Network, Database, and Host‑Level Deep Dives

### Network Monitoring

- Flow data concepts (source/destination, ports, latency)
- Visualizing service and dependency network
- Identifying noisy neighbors and hotspots

### Database Monitoring

- DB agents and connection concepts
- Query performance metrics (latency, rows, locks)
- Resource usage (connections, buffer/cache use)
- Typical DB troubleshooting flows

### Host and Process Analytics

- Process‑level metrics
- Per‑process CPU/memory graphs
- Detecting runaway processes, memory leaks

## Collaboration, Notebooks, Incidents, and Runbooks

### Notebooks

- Structure: text cells + graphs/queries
- Use cases: ad‑hoc analysis, postmortems, runbooks
- Exporting, sharing, and linking from dashboards

### Incident Management (Conceptual)

- Declaring incidents and severity
- Timelines and annotations
- Linking incidents to graphs, logs, and notebooks

### Runbooks and Documentation

- Using notebooks and dashboards as runbooks
- Linking monitors → runbooks → owners

## Security Monitoring and Compliance (Conceptual Track)

### Security Products Overview

- Runtime security / SIEM‑like capabilities (high level)
- Cloud security posture (misconfigurations, policies)
- Application security monitoring concepts

### Signals and Rules

- Security signals vs raw logs
- Detection rules, rule tuning, and false‑positive handling

### Security Dashboards

- High‑level posture dashboards
- Integration with incident management

## Automation, API, and “Datadog as Code”

### API Fundamentals

- Auth: API key vs app key
- Common endpoints: dashboards, monitors, SLOs, metrics, logs intake

### Scripting and Automation

- Simple scripts to create/update dashboards and monitors
- Bulk operations (e.g., mass‑update thresholds)

### Infrastructure as Code (Conceptual)

- Idea of managing Datadog resources through IaC tools
- Version control, review, and promotion patterns

### CI/CD Integration

- Using Datadog data in pipelines (pre/post‑deployment checks)
- Deployment markers and linking to traces/logs/metrics

## Governance, Cost Management, and Best Practices

### Pricing Dimensions (Conceptual)

- Infra units (hosts/containers)
- APM units
- Log ingestion/indexing/retention
- RUM sessions, synthetic test runs
- Security and network modules at a high level

### Cost Drivers and Pitfalls

- High‑cardinality custom metrics
- Excessive log volume and unbounded debug logs
- Very high tag cardinality on critical metrics

### Cost Optimization Techniques

- Log sampling, routing, and tiered retention
- Dropping/aggregating tags on metrics
- Thoughtful trace sampling
- Guardrails: patterns, reviews, and dashboards for spend

### Organization‑wide Best Practices

- Tagging conventions and enforcement
- Standard monitor and dashboard templates
- Ownership (who owns which monitors/dashboards)

## Capstone and Real‑World Scenarios

### Capstone 1 – Monolith Service

- Instrument a monolith with metrics, logs, and traces
- Build infra + service dashboards
- Set core monitors and one SLO

### Capstone 2 – Microservices System

- Multi‑service sample app (API, worker, DB)
- Infra monitoring, APM, logs, RUM/synthetics for critical flows
- Service map analysis and bottleneck identification

### Capstone 3 – SRE Runbook and Incident

- Simulated failures: slow DB, error spike, network issue
- Use dashboards, logs, traces to debug
- Document end‑to‑end incident analysis in a notebook as a runbook

### Cost & Governance Exercise

- Given a “too‑expensive” setup, design:
  - Logging pipelines with sampling/routing
  - Metric/tag hygiene plan
  - Governance rules and templates
