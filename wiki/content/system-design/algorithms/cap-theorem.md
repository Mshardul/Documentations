# CAP Theorem

## Prerequisites

- **[Consistency Models](./consistency-models.md)** [Must read] — CAP's "C" maps directly to linearizability; without this, the theorem's guarantees will be misread as weaker than they are.
- **[Replication Strategies](./replication-strategies.md)** [Recommended] — CAP trade-offs play out through replication; understanding sync vs async replication clarifies why CP and AP behave the way they do.

## Table of Contents

- [Mental Model & Intuition](#mental-model--intuition)
- [The Three Properties](#the-three-properties)
- [Formal Definition](#formal-definition)
- [Assumptions & Preconditions](#assumptions--preconditions)
- [Core Mechanics](#core-mechanics)
- [Often Confused With](#often-confused-with)
- [Variants & Extensions](#variants--extensions)
- [When This Applies](#when-this-applies)
- [Real-World Applications](#real-world-applications)
- [Common Misapplications & Gotchas](#common-misapplications--gotchas)
- [Appendices](#appendices)

## TLDR

CAP states a distributed system can guarantee at most two of Consistency, Availability, and Partition Tolerance. Since partitions are unavoidable in any real network, the choice is always C vs A during a partition — not a free pick of two from three. CP systems reject requests to stay consistent; AP systems serve stale data to stay available. Both labels apply per operation, not per system.

---

## Mental Model & Intuition

**Interviewer TL;DR:** CAP says a distributed system can't simultaneously guarantee consistency, availability, and partition tolerance. Since partitions happen in any real network, the choice is always: during a partition, do you return an error or stale data?

**Mental model:** CAP is a forcing function — it doesn't tell you what to build, it tells you what you cannot avoid choosing when your network fails.

### The Bank Branch Analogy

_A partition forces every distributed system to make the same choice a bank branch makes during a network outage._

Imagine a chain of bank branches sharing a central ledger over a network. During normal operation every branch reads and writes the same ledger — balances are always current, every branch agrees.

Now the network goes down. Each branch faces exactly two options:

- **Stop accepting transactions** until the network recovers. Customers get an error or are turned away. Balances are never wrong — but the service is down. This is **CP**.
- **Keep accepting transactions** using the last known balance. Customers can still withdraw cash. But if two branches simultaneously approve transactions against the same account, balances diverge. This is **AP**.

There is no third option. A branch cannot simultaneously guarantee its balance is current (C) and keep serving customers (A) when it has lost contact with the rest of the system (P).

### Why Only Two of Three

_The constraint is mathematical, not an engineering failure._

To tolerate a partition, nodes must operate independently. But independent operation means nodes can diverge — that is the definition of inconsistency. The only escape is to block all writes until the partition heals, which sacrifices availability.

```
          C (Consistency)
               △
              / \
             /   \
           CP     CA*
           /       \
          △----AP---△
  P (Partition          A (Availability)
    Tolerance)

  * CA: theoretical only — partitions always occur in practice
```

> 🧠 **Thought Process**
> A senior engineer doesn't ask "which two do we pick?" The moment you're building a distributed system, P is not a choice — it's a given. Networks fail, switches reboot, packets drop. The real question is: _when a partition happens, do we return an error or stale data?_ That answer is what CP and AP actually mean.

> 🎯 **Interview Lens** > **Q:** "Explain the CAP theorem."
> **Ideal answer:** "CAP says you can't have consistency, availability, and partition tolerance simultaneously. Since partitions are unavoidable, the real trade-off is C vs A during a partition — reject requests to stay consistent, or serve stale data to stay available."
> **Common trap:** Treating it as a free "pick any two" — candidates say "we'd choose CA" without realising that claims their network never partitions.
> **Next question:** "Can a single system be both CP and AP depending on the operation?"

**Key Takeaway:** CAP's value isn't the three-way trade-off — it's the forced question: "what does your system do during a partition?" Every distributed system answers this whether it intends to or not.

---

## The Three Properties

**Interviewer TL;DR:** C means every read sees the latest write (linearizability). A means every non-failing node always responds. P means the system keeps running despite dropped or delayed messages. All three are non-trivial — and C is routinely confused with the C in ACID.

**Mental model:** Three independent guarantees, each with a precise formal meaning — and all three conflict the moment nodes can't communicate.

### Consistency

_CAP's C is linearizability — not "data is correct", not ACID's C._

A system is consistent (in CAP terms) if every read returns the most recent write — or an error. Formally: operations appear to execute atomically and in a single, globally agreed order, as if the system had one node.

This is linearizability <!-- link: consistency-models.md -->. After a write completes on any node, any subsequent read from any node must reflect that write. There is no window in which an old value is returned.

What this demands in practice: before acknowledging a write, the system must ensure all (or a quorum of) nodes have applied it. Before serving a read, the system must confirm it has the latest value — which under a partition may be impossible.

### Availability

_Every non-failing node must respond — but the response doesn't have to be current._

A system is available (in CAP terms) if every request received by a non-failing node gets a response. Not necessarily the latest response — just a response. No timeouts, no errors, no "try again later."

This is a stronger claim than it sounds. It rules out a system that returns errors during a partition. Returning stale data is fine; returning nothing is not.

> ⚠️ **Warning / Gotcha**
> CAP's "availability" is not the same as high availability (HA) in SRE/ops usage. HA means "system is up most of the time" (99.9%, 99.99%). CAP availability means "every request to a non-failing node gets a non-error response." A system can be highly available in the SRE sense while being unavailable in the CAP sense during a partition.

### Partition Tolerance

_Tolerance of network partitions — not hardware failures, not node crashes._

A partition is a network failure that splits the cluster: some nodes can no longer communicate with others. Messages may be dropped, delayed indefinitely, or reordered. Partition Tolerance means the system continues operating correctly despite this.

Critically: partition tolerance does not mean partitions don't happen. It means the system has a defined, correct behaviour when they do.

### Why P Is Non-Negotiable in Practice

_Partitions are not edge cases — they are routine events in any distributed system._

Even within a single data centre: NIC failures, misconfigured switches, GC pauses that cause missed heartbeats, rolling restarts, asymmetric routing. Across data centres or regions: the failure rate is higher still.

A system that doesn't tolerate partitions must guarantee the network never partitions. That guarantee is impossible to make over any real network. The only system that avoids partitions entirely is a single node — which is not a distributed system.

This is why "CA" is a theoretical category, not a real design choice. Claiming CA means claiming your network is perfect. The moment you have two nodes, you must decide what happens when they can't talk.

> 🧠 **Thought Process**
> When a candidate says "we'll pick CA for our database", the right follow-up is: "what happens when a network switch between your two nodes fails for 30 seconds?" If the answer is "we block all writes" — that's CP. If the answer is "we serve stale reads" — that's AP. There is no third answer.

> 🎯 **Interview Lens** > **Q:** "What does consistency mean in CAP?"
> **Ideal answer:** "In CAP, consistency means linearizability — after any write, every subsequent read from any node returns that value. It's not the same as ACID consistency, which is about constraint satisfaction."
> **Common trap:** Conflating CAP's C with ACID's C, or describing it vaguely as "all nodes have the same data" without specifying the timing guarantee.
> **Next question:** "If consistency in CAP means linearizability, what weaker consistency model do AP systems typically offer instead?"

**Key Takeaway:** P is always chosen by default in any real distributed system — the meaningful decision is C vs A. Understanding what CAP's C actually means (linearizability) is what separates a precise answer from a vague one.

---

## Formal Definition

**Interviewer TL;DR:** CAP started as Brewer's 2000 conjecture and was proven by Gilbert and Lynch in 2002. The proof formalises C as linearizability, A as guaranteed termination, and P as arbitrary message loss — and shows all three cannot hold simultaneously in an asynchronous network.

**Mental model:** The theorem is a proof, not a guideline — it says certain combinations are mathematically impossible, not just hard to engineer.

### Brewer's Conjecture

_The original claim: an informal engineering observation that preceded the proof by two years._

Eric Brewer presented CAP as a conjecture at PODC 2000:

> "You can have at most two of these three properties for any shared-data system: consistency, availability, and tolerance to network partitions."

This was an observation from building large-scale systems at Inktomi, not a formal theorem. It framed the design tension engineers had been navigating for years, but offered no proof.

### Gilbert & Lynch Formalization

_The 2002 proof that turned Brewer's conjecture into a theorem._

Seth Gilbert and Nancy Lynch formalised each property and proved the impossibility:

- **Consistency** = Atomic consistency (linearizability): the result of any execution must be equivalent to some sequential execution of all operations, with each individual operation appearing atomic.
- **Availability** = Every request to a non-failing node eventually receives a response.
- **Partition Tolerance** = The network may lose arbitrarily many messages between any two nodes.

The proof constructs a minimal scenario: two nodes, one partition, one write to node 1, one read from node 2. In an asynchronous network with no bound on message delay, node 2 cannot distinguish "the write hasn't arrived yet" from "the write is lost." It must either wait indefinitely (sacrificing A) or respond with a potentially stale value (sacrificing C). No algorithm resolves this.

> ⚠️ **Warning / Gotcha**
> The proof applies specifically to asynchronous networks — systems with no upper bound on message delay. This is a key assumption. In a synchronous network (bounded delays), the result does not hold in the same form. [Assumptions & Preconditions](#assumptions--preconditions) covers this in full.

**Key Takeaway:** The formal proof doesn't change the engineering intuition — it validates it. The value is knowing CAP isn't a heuristic you can engineer around: the impossibility is provable for asynchronous networks.

---

## Assumptions & Preconditions

**Interviewer TL;DR:** CAP's proof assumes an asynchronous network with no message delivery guarantees. It also treats C and A as binary properties. Both assumptions bound where the theorem applies — and both are routinely ignored when people misapply CAP in practice.

**Mental model:** CAP is a proof about a specific model of distributed systems — violate the model's assumptions and the theorem's guarantees no longer hold in the same form.

### Asynchronous Network Model

_The proof only holds when message delay has no upper bound — which describes every real production network._

The Gilbert-Lynch proof operates in the asynchronous distributed systems model: nodes communicate by passing messages, and there is no bound on how long a message may take to arrive — or whether it arrives at all. A node receiving no response cannot distinguish "message in transit" from "message lost."

This assumption is realistic. In production systems, you cannot guarantee message delivery within any fixed time window. Garbage collection pauses, network congestion, and hardware faults make bounded delays impossible to guarantee end-to-end.

**What breaks when the assumption is relaxed:** In a synchronous model — one with a known, finite bound on message delay — a node that receives no response within the deadline can declare a partition with certainty. This removes the ambiguity the proof exploits. In a perfectly synchronous network, CA is theoretically achievable: every node can always know whether others are reachable. But no real distributed system operates under a synchronous network model. The assumption that makes CA possible is the assumption you cannot make in practice.

> 🧠 **Thought Process**
> When a team says "our data centre network is reliable enough that we don't worry about partitions," they are implicitly claiming synchronous network behaviour. The right challenge: "what happens during a rolling restart, a switch firmware upgrade, or a 10-second GC pause on the leader?" Those events create transient partitions even in a single data centre. The asynchronous model isn't pessimistic — it's accurate.

### Binary Property Framing and Its Limits

_CAP treats consistency and availability as on/off switches. Real systems exist on a spectrum._

The proof formalises C and A as binary: a system either provides linearizability or it doesn't; either every request gets a response or it doesn't. This framing is necessary for a clean proof, but it maps poorly onto engineering decisions.

In practice:

- **Consistency is a spectrum.** A system may offer strong consistency, causal consistency, read-your-writes, or eventual consistency — not just "linearizable or not."
- **Availability is a spectrum.** A system may return errors for 0.1% of requests during a partition while serving the other 99.9% — it is neither fully available nor fully unavailable.

Binary framing leads to a false dichotomy: labelling a system "CP" or "AP" as if it makes a single global choice. Real systems make this choice per-operation, per-region, or per-consistency-level. Cassandra, for example, can be configured for CP behaviour on one table and AP behaviour on another.

This limitation of CAP is exactly what the [PACELC model](#pacelc) addresses — extending the framework to treat latency and consistency as a continuous trade-off, even when no partition is occurring.

**Key Takeaway:** CAP holds precisely within its assumptions: asynchronous network, binary properties. Outside those assumptions — synchronous networks, spectrum consistency — the theorem still informs design but should not be applied mechanically.

---

## Core Mechanics

**Interviewer TL;DR:** During a partition, a node that can't reach its peers must choose: reject the request (CP) or respond with potentially stale data (AP). There is no third option — this is not a design limitation but a provable impossibility.

**Mental model:** A partition creates an information gap — one side of the cluster doesn't know what the other has written — and every request arriving during that gap forces a binary choice.

### The Partition Scenario

_The concrete situation that makes the C vs A trade-off unavoidable._

A network partition splits the cluster into two groups that cannot communicate. Consider the minimal case: two nodes, N1 and N2.

```
  Normal operation:
  ┌────┐    sync    ┌────┐
  │ N1 │◄──────────►│ N2 │
  └────┘            └────┘

  During partition:
  ┌────┐      ✗     ┌────┐
  │ N1 │  ~~~~~~~~  │ N2 │
  └────┘            └────┘
  write: v=100  last known: v=50
    ▲                 ▲
  Client A         Client B
  (writes)         (reads)
```

Client A writes `v=100` to N1. The write is acknowledged — N1 has the new value. Client B then reads from N2. N2 has `v=50` — its last known value before the partition. N2 has no way to know whether N1 has received a new write: it cannot distinguish "no writes have happened" from "a write happened but the message was lost."

### The Proof Sketch

_Why N2 is forced to choose — and why no algorithm resolves this._

N2 must respond to Client B. It has two options:

1. **Respond with `v=50`** — the last known value. If a write happened on N1, this response is stale. Consistency is violated.
2. **Block or return an error** — wait until it can confirm the current value from N1. If the partition never heals, this request never completes. Availability is violated.

No third option exists. N2 cannot conjure the value N1 holds without communicating with N1. An algorithm that somehow returned `v=100` without receiving it would be guessing, not guaranteeing. This is why the impossibility is not an engineering problem — it is an information-theoretic one.

### CP Behavior

_Consistency preserved at the cost of availability: reject or block rather than risk a stale response._

A CP system prioritises returning correct data over returning any data. During a partition, requests that cannot be served with guaranteed consistency are rejected outright or blocked until the partition heals.

In practice: writes require acknowledgment from a quorum of nodes before succeeding; reads go to a quorum or to the leader only. If quorum cannot be reached, the operation fails with an error.

**What the client experiences:** errors or timeouts during partition events. The data returned is always correct — but the service may be temporarily degraded.

**When CP is the right choice:** any domain where stale or conflicting data causes direct harm — financial transactions, inventory management, distributed locking, leader election. A wrong answer is worse than no answer.

### AP Behavior

_Availability preserved at the cost of consistency: respond with best-known data, reconcile later._

An AP system prioritises responding over being correct. During a partition, every node continues serving requests using its local state. Divergent writes on both sides of the partition are accepted and queued for reconciliation when connectivity restores.

In practice: nodes accept writes locally and propagate them asynchronously; reads return local state without quorum. After the partition heals, a conflict resolution strategy (last-write-wins, vector clocks, application-level merge) reconciles diverged state.

**What the client experiences:** responses always arrive, but reads may return stale data and concurrent writes to the same key may produce conflicts that require resolution.

**When AP is the right choice:** domains where availability matters more than precision — shopping carts, social feeds, analytics counters, DNS. A stale answer is better than no answer.

| Criteria               | CP                             | AP                           |
| ---------------------- | ------------------------------ | ---------------------------- |
| During partition       | Returns error or blocks        | Returns stale data           |
| After partition heals  | Already consistent             | Requires conflict resolution |
| Write latency (normal) | Higher — quorum required       | Lower — local write          |
| Read latency (normal)  | Higher — quorum or leader read | Lower — nearest replica      |
| Failure mode           | Unavailable under partition    | Inconsistent under partition |

### Why CA Doesn't Exist at Scale

_CA is a theoretical category — not a design option._

CA means: consistent, available, and with no partition tolerance. A CA system has a defined correct behaviour only when the network is fully connected. The moment a partition occurs, all bets are off — the system may behave incorrectly, lose writes, or corrupt state.

At any meaningful scale, partitions occur. A CA label is therefore a claim that the system will never experience a partition — a guarantee no real distributed system can make.

What architects sometimes mean when they say "CA" is a single-node system, or a system where all components are co-located with no network hop between them. Those are not distributed systems in the CAP sense. The moment you have two nodes communicating over a network, you are operating under the asynchronous model, and CA is not available to you.

> ⚖️ **Decision Framework**
> CP vs AP is not a system-wide binary choice. Design at the operation level:
>
> - Operations that mutate shared critical state (payments, reservations, locks) → CP
> - Operations where staleness is tolerable and availability is user-visible (feeds, caches, counters) → AP
> - Many production systems run CP for writes and AP for reads, with explicit consistency level configuration per query (e.g., Cassandra's `QUORUM` vs `ONE`).

> 🎯 **Interview Lens** > **Q:** "Your database is a CP system. What happens to write requests during a network partition?"
> **Ideal answer:** "Writes that can't reach quorum are rejected with an error. The client must retry. The trade-off is explicit: we return errors rather than risk inconsistent state."
> **Common trap:** Saying "writes queue up and retry automatically" — that describes an AP system with client-side buffering, not CP behaviour.
> **Next question:** "How does a CP system know when the partition has healed and it's safe to resume writes?"

**Key Takeaway:** CP and AP describe what a system does when it must choose — reject or respond. The choice should be made per-operation based on whether a wrong answer is worse than no answer.

---

## Often Confused With

**Interviewer TL;DR:** Two conflations trip most candidates: CAP's C (linearizability) is not ACID's C (constraint satisfaction), and CAP only describes partition behaviour — PACELC covers the latency/consistency trade-off that governs normal operation.

**Mental model:** Same letters, different theorems — confusing them produces wrong system classifications and wrong design decisions.

### CAP's C vs ACID's C

_Two properties that share a letter and nothing else._

[ACID](./acid-vs-base.md) uses C to mean that a transaction takes the database from one valid state to another — foreign key constraints hold, NOT NULL fields are populated, application invariants are preserved. This is enforced by the database engine and the application.

CAP uses C to mean linearizability — every read returns the most recent write, and all operations appear to execute atomically in a globally consistent order across all nodes. This is enforced by the distributed protocol.

|                    | CAP's C                          | ACID's C                                 |
| ------------------ | -------------------------------- | ---------------------------------------- |
| Formal name        | Linearizability                  | Integrity / constraint satisfaction      |
| What it guarantees | Every read sees the latest write | DB moves between constraint-valid states |
| Who enforces it    | Distributed replication protocol | DB engine + application logic            |
| Scope              | Cross-node operation ordering    | Within-transaction correctness           |

A system can satisfy ACID's C while violating CAP's C: a relational database with eventual replication has consistent constraints but may return stale reads. A system can satisfy CAP's C while having no ACID guarantees: a linearizable key-value store with no transaction support.

> ⚠️ **Warning / Gotcha**
> This is the single most common CAP misconception in interviews. When a candidate says "we need a consistent database, so we'll use Postgres" — they are invoking ACID's C. When the question is about distributed system design across multiple nodes, CAP's C is what's at stake. These require entirely different engineering decisions.

### CAP vs PACELC

_CAP describes partition behaviour. PACELC describes what your system trades off the other 99.9% of the time._

CAP only asks one question: what do you do during a partition? It says nothing about normal operation. But in production, partitions are rare. The design decisions that affect everyday performance — how synchronously do we replicate? do we require quorum for every read? — are not covered by CAP at all.

PACELC <!-- link: pacelc.md --> extends CAP: if there is a Partition (P), choose between Availability (A) and Consistency (C) — else (E), choose between Latency (L) and Consistency (C). The ELC branch is where most day-to-day system design decisions live — DynamoDB is PA/EL (AP during partition, low latency over consistency normally), HBase is PC/EC (CP during partition, consistency over latency normally). Full treatment in [Variants & Extensions](#variants--extensions).

**Key Takeaway:** When discussing CAP in an interview, name both confusions proactively — distinguishing CAP's C from ACID's C and noting PACELC as the more complete model signals genuine depth.

---

## Variants & Extensions

**Interviewer TL;DR:** CAP has two important extensions: PACELC adds the latency/consistency trade-off for normal (non-partition) operation — which is where most real design decisions live. Harvest and Yield reframes availability as a spectrum, enabling graceful degradation instead of binary success/failure.

**Mental model:** CAP draws the boundary condition; PACELC and Harvest/Yield describe what happens inside it.

### PACELC

_CAP only asks what you do during a partition. PACELC asks what you trade off every single request._

Proposed by Daniel Abadi in 2012, PACELC extends CAP with a second trade-off that applies during normal operation:

> **If P** (partition): choose between **A** (availability) and **C** (consistency)
> **Else E** (no partition): choose between **L** (latency) and **C** (consistency)

The ELC branch is the one that governs most production traffic. Partitions are rare; every request is subject to the latency/consistency trade-off.

| System              | Partition behaviour                | Normal behaviour                       |
| ------------------- | ---------------------------------- | -------------------------------------- |
| DynamoDB            | PA — serves stale, stays available | EL — low latency, eventual consistency |
| Cassandra (default) | PA                                 | EL                                     |
| HBase / BigTable    | PC — blocks on partition           | EC — quorum reads, higher latency      |
| Spanner             | PC                                 | EC                                     |
| ZooKeeper           | PC                                 | EC                                     |

Systems can also be configured along this spectrum. Cassandra's consistency levels allow `QUORUM` reads (EC behaviour) or `ONE` reads (EL behaviour) per query — the same cluster operates at different points on the PACELC spectrum depending on the operation.

#### ELC Trade-off

_The latency cost of consistency is always present — PACELC makes it explicit._

To return a consistent read in a replicated system, the serving node must confirm it holds the latest value — by contacting the leader, by achieving read quorum, or by waiting for replication to complete. Each of these adds latency.

To return a fast read, the node serves its local replica directly. If replication is asynchronous, that replica may be milliseconds or seconds behind the leader.

This is the fundamental tension in [replication strategies](./replication-strategies.md): synchronous replication guarantees consistency at the cost of write latency; asynchronous replication minimises latency at the cost of consistency. Every replicated system makes this trade-off. PACELC names it.

### Harvest and Yield

_A more nuanced model: degrade result completeness before degrading availability._

Proposed by Fox and Brewer in 1999 (predating the CAP theorem itself), Harvest and Yield reframes availability as two separable properties:

- **Yield** — the probability that a request completes successfully (traditional availability).
- **Harvest** — the fraction of complete data returned in a successful response.

The insight: during a partition, a system can return a partial but useful result (reduced harvest) rather than failing the entire request (reduced yield). This is a middle ground CAP's binary framing doesn't capture.

**Example:** A search engine backed by 100 index shards loses contact with 5 during a partition. Instead of returning a 500 error (yield = 0), it returns results from the 95 reachable shards (harvest = 0.95, yield = 1). The response is incomplete but useful.

This model maps directly to fault-tolerant system design: prioritise yield (never fail a request) by accepting reduced harvest (return what you have). The trade-off between yield and harvest is tunable at runtime based on shard availability.

> 🧠 **Thought Process**
> In a system design interview, mentioning Harvest and Yield when discussing search, recommendations, or analytics signals a sophisticated understanding of availability. Instead of "we make it highly available," say: "we accept reduced harvest — partial results — rather than reducing yield. Users see slightly incomplete data during a partition, not an error page."

**Key Takeaway:** PACELC is the practical extension — every production system lives somewhere on the latency/consistency spectrum even without a partition. Harvest and Yield is the design pattern — degrade completeness before degrading availability.

---

## When This Applies

**Interviewer TL;DR:** Choose CP when a wrong answer causes direct harm — financial loss, double-booking, split-brain. Choose AP when availability is user-visible and staleness is tolerable. Most production systems apply both, per operation.

**Mental model:** The question is not "what kind of system are we building?" — it is "for this specific operation, is a wrong answer worse than no answer?"

### Choosing CP

_Use CP when the cost of returning stale or conflicting data exceeds the cost of returning an error._

CP is the right choice when consistency violations have direct, concrete consequences:

- **Financial transactions** — double-spend, overdraft, incorrect balance. A wrong response causes money to appear or disappear.
- **Distributed locking** — two nodes believing they hold the same lock causes concurrent writes to a resource that must be mutually exclusive.
- **Leader election** — two nodes believing they are the leader (split-brain) causes conflicting decisions and potential data corruption.
- **Inventory reservation** — overselling a limited resource is a real-world commitment that must be honoured.
- **Coordination services** — systems like ZooKeeper are explicitly CP: all cluster members must see the same configuration or the cluster is unsafe.

The user-facing consequence of CP is an error or timeout during a partition. This is acceptable in these domains because the alternative — returning a wrong answer — is worse.

### Choosing AP

_Use AP when availability is directly user-visible and the cost of staleness is low._

AP is the right choice when users would rather see a slightly stale result than an error:

- **Social media feeds** — a post appearing 500ms late is imperceptible. An error page is not.
- **Shopping carts** — Amazon's original Dynamo paper was built specifically around this trade-off: cart availability over strict consistency.
- **DNS** — the canonical AP system. Records propagate eventually; brief staleness is an accepted property of the protocol.
- **Product catalogues and pricing** — showing last-synced prices is acceptable; an unavailable storefront is not.
- **Analytics counters and metrics** — approximate counts are fine; exact precision is not worth sacrificing availability.
- **Recommendation systems** — slightly stale recommendations are indistinguishable from fresh ones to the user.

### Per-Operation Trade-offs

_CP and AP are not system-wide labels — they are per-operation decisions._

The most important insight for production system design: a single system can apply CP and AP to different operations simultaneously.

**Cassandra** makes this explicit through consistency levels configured per query:

- `QUORUM` reads and writes → CP behaviour for that operation
- `ONE` reads → AP behaviour for that operation
- The same cluster serves both, depending on what the operation requires

**Common pattern — strong writes, eventual reads:**

- Writes go through a quorum (CP) to ensure durability and avoid write conflicts
- Reads serve from the nearest replica (AP) for low latency, accepting brief staleness

**Common pattern — multi-region:**

- Strong consistency within a region (CP) for user-facing mutations
- Eventual consistency across regions (AP) for replication, accepting cross-region lag

> ⚖️ **Decision Framework**
> For each critical operation, ask two questions:
>
> 1. **"If this operation returns stale data, what breaks?"** — if the answer is "money, safety, or correctness of downstream operations," choose CP.
> 2. **"If this operation returns an error, what breaks?"** — if the answer is "the user sees a degraded experience," consider AP.
>
> If both answers are "something bad," that is a signal to redesign the operation or accept a specific trade-off explicitly rather than implicitly.

> 🎯 **Interview Lens** > **Q:** "You're designing a ride-sharing app. Should your system be CP or AP?"
> **Ideal answer:** "Neither globally. Driver location updates are AP — slightly stale positions are fine, and availability matters. Ride assignment is CP — two drivers cannot be assigned to the same rider. Payment is CP — consistency failures have direct financial consequences."
> **Common trap:** Labelling the whole system CP or AP instead of reasoning per-operation.
> **Next question:** "How would you implement per-operation consistency levels in practice?"

**Key Takeaway:** CP vs AP is an operation-level decision, not a system-level label. Correctly identifying which operations require CP and which tolerate AP is the practical skill CAP is testing.

---

## Real-World Applications

**Interviewer TL;DR:** CP systems — ZooKeeper, HBase, Spanner, etcd — sacrifice availability to guarantee linearizability, typically for coordination and financial workloads. AP systems — Cassandra, DynamoDB, DNS — stay available at the cost of potential staleness, typically for user-facing high-throughput workloads.

**Mental model:** Every major distributed data system is a materialised opinion on the CP/AP trade-off — understanding why they chose what they chose is more useful than memorising the labels.

### CP Systems

| System    | PACELC | Primary use case                          | Why CP                                                                                                    |
| --------- | ------ | ----------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| ZooKeeper | PC/EC  | Distributed coordination, leader election | Two nodes believing they hold a lock or are the leader causes split-brain — wrong answer is catastrophic  |
| etcd      | PC/EC  | Kubernetes cluster state                  | Config and state changes must be globally consistent; a node acting on stale config corrupts the cluster  |
| HBase     | PC/EC  | Strong-consistency analytics              | Built on HDFS with a single region server per key range — consistency is architectural, not optional      |
| Spanner   | PC/EC  | Global relational transactions            | TrueTime gives bounded clock uncertainty, enabling external consistency across globally distributed nodes |

**ZooKeeper** is the canonical CP coordination service. Every write goes through a leader and is replicated to a quorum before acknowledgment. During a partition, the minority partition stops serving writes entirely. This is the correct behaviour for leader election: a minority cannot safely elect a leader without risking split-brain.

**Spanner** is the most ambitious CP system in production — it achieves global strong consistency by using GPS and atomic clocks (TrueTime) to bound clock skew, enabling commit-wait that guarantees external consistency. The latency cost is explicit: global transactions take 10–100ms.

### AP Systems

| System    | PACELC | Primary use case                       | Why AP                                                                              |
| --------- | ------ | -------------------------------------- | ----------------------------------------------------------------------------------- |
| Cassandra | PA/EL  | High-throughput write workloads        | Availability and write throughput over consistency; tunable per operation           |
| DynamoDB  | PA/EL  | User-facing always-on applications     | Amazon's design principle: shopping cart must never fail, even with stale data      |
| DNS       | PA/EL  | Name resolution                        | Propagation delay is an accepted protocol property; unavailable DNS is catastrophic |
| CouchDB   | PA/EL  | Occasionally-connected / offline-first | Designed for conflict resolution via revision history; local writes always succeed  |

**Cassandra** was designed at Facebook, inspired by Amazon's Dynamo paper (partitioning and replication model) and Google's BigTable (data model). Every node accepts writes locally; replication is asynchronous. Conflicts are resolved by last-write-wins (by default) or custom merge functions — the trade-off is deliberate: a lost item in a cart is a better user experience than a cart error page.

**DNS** is the oldest and most widely used AP system in existence. TTL-based caching means every client may hold a stale record for minutes after an update. This is not a bug — it is the design. The alternative (strongly consistent DNS) would make name resolution a coordination bottleneck for the entire internet.

### Mixed Strategies in Production

_No production system at scale applies a single consistency level globally._

Real systems configure consistency per operation, per table, or per region:

**Cassandra consistency levels** — the same cluster can serve:

- `ALL` — all replicas must respond (strong consistency, highest latency)
- `QUORUM` — majority must respond (CP-like for most replication factors)
- `LOCAL_QUORUM` — majority within local data centre (CP within region, AP across)
- `ONE` — single replica responds (maximum availability, eventual consistency)

**DynamoDB strongly consistent reads** — by default, DynamoDB reads are eventually consistent (AP). For operations that require the latest value, strongly consistent reads contact the leader directly — trading latency for consistency, per request.

**Multi-region pattern** — the most common production architecture:

- Strong consistency within a region (CP) — quorum is local, latency is low
- Eventual consistency across regions (AP) — replication is asynchronous, cross-region latency is amortised

> 🧠 **Thought Process**
> When an interviewer asks "is Cassandra CP or AP?", the right answer is: "AP by default, but it's configurable per operation. At `QUORUM` with a replication factor of 3, it behaves CP-like. The point is that Cassandra explicitly exposes the trade-off — you choose per query rather than accepting a system-wide default."

**Key Takeaway:** The most production-mature systems don't make a global CP/AP choice — they expose the trade-off as a configurable parameter and let the application decide per operation.

---

## Common Misapplications & Gotchas

**Interviewer TL;DR:** The five most common CAP mistakes: claiming CA is possible, labelling entire systems as CP or AP, using CAP to reason about normal-operation latency, conflating AP with "eventual consistency only", and treating the C in CAP as the same C in ACID.

**Mental model:** Most CAP mistakes come from treating the theorem as broader than it is — it is a narrow impossibility result for partition behaviour in asynchronous systems, not a general framework for all distributed system trade-offs.

### The CA Myth

_Claiming CA is a claim that your network never partitions. No production network can make that claim._

Teams arrive at "CA" by reasoning: "our infrastructure is reliable, we use a single data centre, partitions are edge cases." This reasoning fails at multiple levels:

- Partitions within a single data centre happen routinely: NIC failures, switch reboots, GC pauses long enough to miss heartbeats, asymmetric routing after config changes, rolling restarts.
- "Reliable infrastructure" reduces partition frequency — it does not eliminate it.
- A system with undefined behaviour during a partition is not CA — it is a system with an unhandled failure mode.

**What to do instead:** Acknowledge P is always present. Define CP or AP behaviour explicitly. A system that panics, corrupts data, or produces split-brain during a partition has not chosen CA — it has failed to make a choice.

### Binary CP/AP Labeling

_Labelling an entire system CP or AP obscures the only decision that matters: what each operation does under partition._

"Cassandra is AP" and "ZooKeeper is CP" are useful shorthand for default behaviour, not architectural absolutes. Cassandra at `QUORUM` behaves CP-like. ZooKeeper's read-from-follower mode relaxes consistency. Most production systems have operations that fall on both sides.

Treating the label as fixed leads to: designing all operations with the same consistency level (overkill for some, insufficient for others), and misclassifying systems during architecture reviews.

**What to do instead:** Reason per operation. "For writes to the reservation table, we need CP. For reads to the product feed, AP is fine." The label follows the operation, not the system.

### Ignoring PACELC

_CAP says nothing about what your system trades off when there is no partition — which is most of the time._

A common misapplication: using CP to justify high-latency reads. "We're CP, so reads must go through quorum." True under a partition. But CAP does not prescribe quorum reads during normal operation — that is an ELC decision (PACELC's E branch), and it is a separate trade-off.

Systems often pay consistency latency costs they do not need because they conflate "we chose CP for partition behaviour" with "we must maximise consistency at all times."

**What to do instead:** Use PACELC for normal-operation design. Define partition behaviour with CAP (C vs A), then separately define steady-state behaviour with ELC (L vs C). These are independent decisions.

### Per-System vs Per-Operation Categorization

_CAP trade-offs are most precise — and most useful — at the operation level, not the system level._

Designing a system with a single global consistency level is the most common way to either over-engineer (CP everywhere when only 20% of operations require it) or under-engineer (AP everywhere when financial operations need CP).

**What to do instead:** Enumerate operations by their consistency requirement at design time. Group them: operations where wrong data causes harm → CP; operations where unavailability is user-visible and staleness is tolerable → AP. Use systems that expose per-operation consistency knobs (Cassandra, DynamoDB) rather than committing to a global mode.

### Eventual Consistency as AP Catch-All

_AP does not mean "accept maximum staleness." AP systems offer a spectrum of consistency models, all weaker than linearizability but stronger than pure eventual consistency._

A common wrong assumption: choosing AP means choosing eventual consistency and nothing more. In practice, AP systems routinely offer:

- **Read-your-writes** — a client always reads what it has written, even if other clients see stale data.
- **Monotonic reads** — a client never reads a value older than one it has previously read.
- **Causal consistency** — operations that are causally related appear in order to all nodes.

These are all weaker than linearizability (CAP's C) but significantly stronger than pure eventual consistency. Building with "AP = anything goes" leads to applications that are harder to reason about than necessary.

**What to do instead:** Choose the weakest consistency model that your application correctness requires — not the weakest available. Read-your-writes is often sufficient and much cheaper than quorum consistency.

> 🎯 **Interview Lens** > **Q:** "Walk me through the most common CAP misconceptions."
> **Ideal answer:** "Three main ones: CA is not a real option at scale since partitions always happen; CP/AP labels belong to operations, not systems; and CAP only covers partition behaviour — PACELC is the right framework for reasoning about normal-operation latency/consistency trade-offs."
> **Common trap:** Only naming one misconception — usually the CA myth — without the PACELC gap or the per-operation nuance.
> **Next question:** "Given those misconceptions, how would you actually document the consistency guarantees of a new system you're designing?"

**Key Takeaway:** The most dangerous CAP mistake is treating it as a complete framework for distributed system design — it is a narrow impossibility result. Combine it with PACELC for latency reasoning, per-operation consistency classification for design, and explicit partition behaviour documentation for production.

---

## Appendices

### Acronyms & Abbreviations

| Acronym | Full Form                                      | One-line meaning                                                              |
| ------- | ---------------------------------------------- | ----------------------------------------------------------------------------- |
| CAP     | Consistency, Availability, Partition Tolerance | The three properties at the centre of the theorem                             |
| CP      | Consistent + Partition Tolerant                | Rejects requests rather than serve stale data during a partition              |
| AP      | Available + Partition Tolerant                 | Serves stale data rather than reject requests during a partition              |
| CA      | Consistent + Available                         | Theoretical only — assumes partitions never occur                             |
| PACELC  | Partition → A vs C; Else → L vs C              | Extension of CAP covering normal-operation latency/consistency trade-off      |
| ELC     | Else Latency Consistency                       | The normal-operation branch of PACELC                                         |
| PA/EL   | PACELC shorthand                               | AP during partition, low latency over consistency normally (e.g., Cassandra)  |
| PC/EC   | PACELC shorthand                               | CP during partition, consistency over latency normally (e.g., HBase, Spanner) |

---

### Anti-patterns

- **The CA claim** — asserting the system is CA because the network is "reliable"; fails because partitions occur in all real distributed networks including single-DC; define explicit CP or AP partition behaviour instead.
- **Global consistency level** — applying a single consistency setting to all operations; fails because critical operations (payments, locks) and non-critical operations (feeds, counters) have different consistency requirements; classify per operation and configure accordingly.
- **CAP as complete framework** — using CAP alone to reason about all distributed trade-offs; fails because CAP ignores latency and normal-operation behaviour; combine with PACELC for steady-state design decisions.
- **AP means no consistency guarantees** — building AP systems with maximum staleness for all reads; fails because most applications need at least read-your-writes or monotonic reads; choose the weakest consistency model sufficient for correctness, not the weakest available.
- **Conflating CAP's C with ACID's C** — designing for constraint satisfaction when linearizability is needed, or vice versa; fails because they are orthogonal properties addressing different failure modes; identify which C each operation requires before choosing a storage system.

---

### Selection Matrix

| Criteria               | CP                                                          | AP                                                            |
| ---------------------- | ----------------------------------------------------------- | ------------------------------------------------------------- |
| During partition       | Rejects or blocks requests                                  | Serves stale data                                             |
| After partition heals  | Already consistent                                          | Requires conflict reconciliation                              |
| Write latency (normal) | Higher — quorum acknowledgment required                     | Lower — local write accepted immediately                      |
| Read latency (normal)  | Higher — quorum or leader read                              | Lower — nearest replica                                       |
| Conflict handling      | Prevented by serialisation                                  | Required at application or storage layer                      |
| Failure mode           | Unavailable under partition                                 | Inconsistent under partition                                  |
| Typical use cases      | Transactions, distributed locks, leader election, inventory | Social feeds, shopping carts, DNS, analytics, recommendations |
| Example systems        | ZooKeeper, etcd, HBase, Spanner                             | Cassandra, DynamoDB, CouchDB, DNS                             |
