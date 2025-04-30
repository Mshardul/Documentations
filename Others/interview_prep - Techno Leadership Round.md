- [Technical Challenges Faced and Overcame](#technical-challenges-faced-and-overcame)
  - [What key Technical challenges have you faced?](#what-key-technical-challenges-have-you-faced)
    - [Architecture](#architecture)
    - [Stakeholders](#stakeholders)
    - [Team Lead](#team-lead)
  - [How did you validate the effectiveness of project?](#how-did-you-validate-the-effectiveness-of-project)
    - [Metrics](#metrics)
    - [Prompt Engineering](#prompt-engineering)
    - [Stakeholders](#stakeholders-1)
  - [A failure or something you would do differently if given another chance.](#a-failure-or-something-you-would-do-differently-if-given-another-chance)
    - [Standardization when different teams working on different modeules](#standardization-when-different-teams-working-on-different-modeules)
    - [Decoupling Payments Module into 2 Microservices](#decoupling-payments-module-into-2-microservices)
- [Technology Decision Making](#technology-decision-making)
  - [When did you have to choose a Technology Stack (X over Y), and explain the trade-offs you had to consider?](#when-did-you-have-to-choose-a-technology-stack-x-over-y-and-explain-the-trade-offs-you-had-to-consider)
    - [Golang over Python for high-throughtput microservice](#golang-over-python-for-high-throughtput-microservice)
    - [Flask over Django](#flask-over-django)
    - [FastAPI over Flask or Django](#fastapi-over-flask-or-django)
    - [React over Angular](#react-over-angular)
- [Influencing team to adopt a new Engineering Solution](#influencing-team-to-adopt-a-new-engineering-solution)
  - [Ever had to Lead or Influence your team to adopt a new Engineering Approach or Best Practice. How did you convince them?](#ever-had-to-lead-or-influence-your-team-to-adopt-a-new-engineering-approach-or-best-practice-how-did-you-convince-them)
    - [Moving from Monolithic to Microservices](#moving-from-monolithic-to-microservices)
    - [Adopting CI/CD practices using GitLab CI/CD](#adopting-cicd-practices-using-gitlab-cicd)
    - [Instilling a culture of Detailed PRs and Strict Code Reviews](#instilling-a-culture-of-detailed-prs-and-strict-code-reviews)
- [Scalability](#scalability)
  - [How did you Build Scalable Solution for thousands of people to join Online Video Conference at once?](#how-did-you-build-scalable-solution-for-thousands-of-people-to-join-online-video-conference-at-once)
    - [focus on a microservices-based architecture and leveraging cloud scalability](#focus-on-a-microservices-based-architecture-and-leveraging-cloud-scalability)
    - [continuous performance management and process adjustments](#continuous-performance-management-and-process-adjustments)
    - [performance-aware culture in the team](#performance-aware-culture-in-the-team)
- [Team Leadership](#team-leadership)
  - [how did you manage coordination across different roles and ensure successful, on-time delivery of projects without compromising on quality?](#how-did-you-manage-coordination-across-different-roles-and-ensure-successful-on-time-delivery-of-projects-without-compromising-on-quality)
    - [Architecture](#architecture-1)
    - [Process](#process)
    - [Collaboration](#collaboration)
- [End-to-End Solution](#end-to-end-solution)
  - [How did you approach the End-to-End Solution Design in terms of technical strategy and team leadership?](#how-did-you-approach-the-end-to-end-solution-design-in-terms-of-technical-strategy-and-team-leadership)
    - [Architecture](#architecture-2)
    - [Process](#process-1)
    - [Team](#team)
- [DevOps](#devops)
  - [Describe how you implemented a CI/CD pipeline in one of your projects, and what impact it had on the team and product delivery?](#describe-how-you-implemented-a-cicd-pipeline-in-one-of-your-projects-and-what-impact-it-had-on-the-team-and-product-delivery)
    - [Architecture](#architecture-3)
    - [Process](#process-2)
    - [Team](#team-1)
- [Strengths](#strengths)
  - [What are some of your strengths?](#what-are-some-of-your-strengths)
    - [Technical](#technical)
    - [Leadership](#leadership)
- [Weeknesses](#weeknesses)
  - [What are some of your weaknesses?](#what-are-some-of-your-weaknesses)
- [Challenges Faced](#challenges-faced)
  - [What challenges did you face in your career? and how did you overcome them?](#what-challenges-did-you-face-in-your-career-and-how-did-you-overcome-them)
- [Conflicts](#conflicts)
  - [Were there any instances of Conflicts between two teammates? How did you resolve them?](#were-there-any-instances-of-conflicts-between-two-teammates-how-did-you-resolve-them)
  - [Strong Conflicts among team members](#strong-conflicts-among-team-members)
    - [Architecture Disagreement During Refactor](#architecture-disagreement-during-refactor)
    - [Code Ownership vs Delivery Velocity](#code-ownership-vs-delivery-velocity)
- [Team Culture](#team-culture)


# Technical Challenges Faced and Overcame

## What key Technical challenges have you faced?

### Architecture
- Designing for **high scalability** and **availability**
    - Utilized **Microservice Architecture** and leveraging **AWS-managed Services** for **auto-scaling** and **high resposiveness**.
    - implemented **edge caching via CloudFront** and used **AWS Lambda** for **burstable workloads**.
    - migrated stateful components to **Redis** to reduce database load.
- Integration of 5 different social media APIs with varying data formats and rate limits: 
    - Added an **abstract layer** and **unified data model** to handle **inconsistencies**, coupled with **thorough error handling** and **caching strategies**.

### Stakeholders
- Creating a **reusable UI component library** that multiple teams would adopt, aligning with various **stakeholders’ needs** and **ensuring consistency** across the organization:
    - established a **clear design system** and **best practices documentation**, then **iteratively gathering feedback** from different teams to **refine the components**.
- Moving an **on-premise system to Azure cloud**: Introduced **agile practices**
    - breaking the migration into **smaller milestones**, 
    - **training the team** on new cloud tools, 
    - setting up **automated CI/CD pipelines** for quick feedback.

### Team Lead
- Coordinating **backend**, **frontend**, and **DevOps** efforts under a **tight deadline**: 
    - clearly defining each **team member’s responsibilities**, 
    - setting up frequent **sync-up meetings** (including 1-to-1s),
    - **establishing a shared project vision** so everyone understood how their piece fit into the puzzle.
- **Mentoring Junior** Developers: 
    - Mentored them through **pair programming** and **code reviews**
    - **breaking down the problem** into manageable tasks.

## How did you validate the effectiveness of project?

### Metrics
- Metrics like trainer retention and course completion rates were **key indicators** of success.

### Prompt Engineering
- Andrew Ng's **prompt engineering** course helped me **develop better prompts** for the model.

### Stakeholders
- Regular meetings with Stakeholders helped me understand the **effectiveness of the project**.

## A failure or something you would do differently if given another chance.

### Standardization when different teams working on different modeules
- **Situation**
    - Was leading the backend and architecture for a campaign management platform that needed integration with five different social media APIs. We had a tight timeline to launch an MVP that supported at least three platforms.
- **Failure**
    - Made the decision to build all integrations in parallel by dividing them among sub-teams — thinking this would accelerate delivery.
    - While we were able to move quickly in development, it led to inconsistencies in API abstraction, error handling, and data formats because each team implemented their integration differently.
    - When it came time to stitch the pieces together, we spent more time debugging integration mismatches and normalizing data than we saved during development.
    - As a result, the go-live was delayed by nearly 2 weeks, and the MVP required multiple patches post-launch to stabilize.
- **Lesson**
    - **Parallel execution without upfront standardization is risky**: We lacked a well-defined interface contract or base SDK for these APIs, which would’ve saved rework later.
    - **Speed at the start can cost time at the end**: I realized that spending 1 extra week in design and standardization would have saved us at least 2–3 weeks of downstream fixes.
    - **Leadership isn’t just about trusting delegation — it’s also about setting the right guardrails**: I should have reviewed the early architecture choices from each sub-team more closely and driven alignment before implementation.
- **Improvement**
    - Create a shared API abstraction layer first, and mandate each integration team to follow it.
    - Introduce a common error handling and logging framework.
    - Set up a mock contract for integration testing early on to ensure everyone is building toward the same output.
    - In parallel, I’d designate a single tech reviewer per module to ensure cohesion.

### Decoupling Payments Module into 2 Microservices
- **Situation**
    - split the system into two decoupled microservices: Payment Orchestrator (Determined the optimal gateway based on user region, currency, and compliance rules) and Payment Processor (Executed transactions, calculated taxes/discounts, and logged results)
- **Failure**
    - **Overcomplicated Service Dependencies**: The Orchestrator and Processor relied heavily on synchronous HTTP calls for critical workflows (e.g., tax calculations before routing). During peak traffic, this caused cascading failures
    - **Lack of Idempotency**: Network glitches or retries led to: Duplicate charges (e.g., users billed twice for the same course). Mismatched logs between services, complicating audits.
    - **Inadequate Testing for Edge Cases**: We tested individual services in isolation but neglected cross-service scenarios (e.g., partial failures, race conditions).
- **Lessons**
    - **Decoupling Requires Asynchronous Design**: Synchronous dependencies between microservices create tight coupling and fragility. Event-driven architectures (e.g., SQS, Kafka) would have reduced cascading failures.
    - **Idempotency is Mission-Critical**: Payment systems must guarantee that retries never duplicate charges.
    - **Testing Edge Cases is Crucial**: When it comes to something as critical as Payments Service, edge test cases must be taken care of.
- **Improvement**
    - **Adopt Event-Driven Communication**: Replace HTTP calls with AWS SQS for async workflows. This decouples services and allows graceful degradation during failures.
    - **Build Idempotency from Day One**: Generate unique idempotency keys for every transaction and store them in Redis with TTL. Reject duplicate keys to prevent double charges.
    - **Enhance Testing for Edge Cases**: Write edge test cases for race conditions, partial failures, and cascading failures.

# Technology Decision Making

## When did you have to choose a Technology Stack (X over Y), and explain the trade-offs you had to consider? 

### Golang over Python for high-throughtput microservice
- Golang’s **concurrency model** and **compiled performance** excelled for the **scale** we needed.
- Golang gave us **efficient goroutines** and **lower latency** under load.
- **performance** and **type safety** were more critical for this service (to handle **thousands of req/sec** without hiccups).
- **Downside:** **stricter type definitions** and **learning curve** for Python-centric teams.
- But it paid off when our service **easily handled peak traffic** with **minimal CPU usage**.
- Go microservices ensured **low-latency** responses for **influencer-facing features**.

### Flask over Django
- for **rapid development** and **flexibility** for a microservice that had very specific needs.
- **Flask’s minimalistic approach** meant we could **start small** and **add only the libraries we needed**, which kept our **initial velocity high**.
- **Trade-off:** Flask required us to **implement certain features (like authentication or admin interfaces) from scratch** that Django would have provided out-of-the-box.
- It was okay as our **team was experienced** in those areas and we **wanted full control** to optimize each component.

### FastAPI over Flask or Django
- native support for **async operations** - ideal for microservices needing **high throughput**
- **FastAPI’s ASGI** support allowed **seamless integration with WebSocket-based features** for live classes, which **Django’s WSGI** architecture couldn’t handle as efficiently.

### React over Angular
- **React** because our team had **prior experience** with it and a **strong JavaScript skill set**, which meant a **smoother learning curve** and **faster onboarding** for new members.
- **Angular** is a **powerful framework**, but it’s **more opinionated** and has a **steeper learning curve**.
- **Trade-off**: React needed to integrate **additional libraries** for **state management** and **tooling**, which Angular provides out-of-the-box.
- **Aligning tech stack** with the **team’s expertise** proved beneficial — the developers were **immediately productive**, and we could **deliver features quickly**.
- vast **React ecosystem** gave us **flexibility** to pick and choose **solutions** (like **Redux** for state, **Material-UI** for components) that best fit our needs.


# Influencing team to adopt a new Engineering Solution

## Ever had to Lead or Influence your team to adopt a new Engineering Approach or Best Practice. How did you convince them?

### Moving from Monolithic to Microservices
- Realized that the growing app would benefit from a **Microservice Architecture**:
    - started by designing a pilot service using **Docker** and **Kubernetes**
    - showing how it could be independently developed, tested, deployed, and scaled.
- **Shared results** in a Tech Demo, emphasizing
    - how containerization **solved our environment inconsistency issues** 
    - how splitting services could **eliminate bottlenecks in our monolith**.
- provided **clear documentation** and **architectural diagrams** for the new approach.
- **gradually refactored critical parts of the system into microservices**, and the team saw firsthand how this approach improved our **scalability** and **made deployments more flexible**.

### Adopting CI/CD practices using GitLab CI/CD
- **deployment process** was **manual** and **error-prone**.
- set up a **CI pipeline** using **GitLab CI** for a small feature, **automating tests and deployments** to a **staging environment**.
- **After initial successful run**, walked the **team** through the **pipeline’s benefits**.
- the team **gradually embraced CI/CD**; went from **monthly releases to continuous deployment** of small features.
- In long term, it instilled a culture of **higher code quality and collaboration**

### Instilling a culture of Detailed PRs and Strict Code Reviews
- **Adding PR Templates:** introduced a **lightweight PR Template** in our **GitLab workflow**
    - **Structure:** PRs need to be detailed, including the PR Type, Description, Screenshots
- **Code Review:** introduced a **lightweight code review process** in our **Git workflow**, making it a **collaborative activity** rather than a gatekeeping exercise. eg at least 2 Approvals per PR before merging.


# Scalability

## How did you Build Scalable Solution for thousands of people to join Online Video Conference at once?

### focus on a microservices-based architecture and leveraging cloud scalability
- broke the application into **stateless microservices** which could each **scale horizontally** as load increases.
    - (for example, separate services for user management, video streaming, chat, etc.)
- **AWS DynamoDB (NoSQL)** over a **traditional SQL database** for the most load-intensive parts of the system
    - **Trade-off:** more **complex query patterns** in exchange for virtually **unlimited scalability and throughput**.
- utilized **AWS Step Functions** to orchestrate and throttle heavy tasks
    - (for example, sending bulk notifications or processing video content)
- By carefully weighing **consistency vs. scalability** and **simplicity vs. modularity**, I arrived at an architecture that handled growth gracefully without breaking the user experience.

### continuous performance management and process adjustments
- implemented **rigorous monitoring** and **load-testing processes** to keep the system’s growth on track
    - set up **automated performance tests** that ran in our **CI pipeline** for **critical services** - to detect if a new code change might degrade our ability to handle load.
    - established clear **incident response processes**: detailed dashboards and alerts (using CloudWatch and Grafana) - to notify the team if **throughput** or **latency** crossed a threshold.
- **Trade-off:** dedicating development **time to building these safeguards** versus new feature work

### performance-aware culture in the team
- ran **internal workshops** on 
    - **efficient coding practices** (like optimal database query patterns and use of caching)
    - **understanding the infrastructure** (so developers knew how autoscaling and load balancers function in AWS)
- **Trade-off:** diverting some time towards training and documentation, but it ensured that every team member could contribute to the system’s scalability. 


# Team Leadership

## how did you manage coordination across different roles and ensure successful, on-time delivery of projects without compromising on quality?

### Architecture
- having a **clear technical architecture** can serve as a **“communication blueprint”** for cross-functional teams.
- initially created a **high-level architecture diagram** and **specifications** for how all the pieces would fit together.
    - **Frontend developers** knew the **contract (API specifications)** expected from the **backend**
    - **DevOps engineers** understood the **deployment topology** from day one.
- By defining these interfaces and boundaries early: each subgroup could **work somewhat independently** yet **remain aligned with the overall design**.
- This Blueprint **minimized misunderstandings and integration issues** later, helping with delivery timelines.
- broke the integration into **modular microservices**, allowing **parallel development**.

### Process
- integrated **Jira** to **track dependencies**
- **Meetings:** Organized **regular stand-ups** and **bi-weekly sprint planning meetings** that included representatives from various teams.
    - **Tasks:** **review Progress**, **surface Blockers**, **demo PRs**, and **adjust priorities** collaboratively.
    - **Demos:** **reinforced accountability** and **teamwork across functions**
- **Challenge:** handling different priorities (e.g., tech debt vs. new features)
    - **Managed By:** maintaining a **transparent backlog** and **negotiating scope with stakeholders** to find a healthy balance
- **Solutions:** **having a clear process** with defined roles, **open communication** channels, and a **culture of calling out issues early**
- **Result:** **delivering complex projects on time**, as everyone was aware of the timeline and quality standards and could coordinate their work accordingly.
- **Regular demos** with product teams **ensured alignment**.

### Collaboration
- encouraged an Environment, where
    - **easily approaching any team member** to clarify requirements or discuss constraints.
- **steps taken**
    - Feature Demos in the standups
    - Acknowledging Contributions
    - Discouraging Blame Games or Name Calling


# End-to-End Solution

## How did you approach the End-to-End Solution Design in terms of technical strategy and team leadership?

### Architecture
- **Goal:** automatically review online videos for quality issues and give instructors feedback. 
- **Technical Strategies**
    - **Divided problem into stages**: video transcription, content analysis, qc, and feedback generation
    - **Utilized FastAPI for Async Programming**: to handle concurrent requests and reduce latency
    - **Isolating AI processing in its own service queue:** made the system more **scalable** and failures in AI processing **wouldn’t take down the whole app**.
    - **Ensuring Privacy:** used **AWS KMS** to encrypt data at rest and in transit, and not sharing **user-sensitive data** with the AI services.
    - **Cost Awareness:** since APIs were expensive, implemented **batching requests**, and **caching results** wherever possible.
    - **Detailed Documentation:** 

### Process
- **Challenges**
    - Needed to Integrate various Payment Gateways (JusPay, Stripe, Tabby), where **Process** and **Strategy** were crucial.
- **Steps Taken**
    - Started by **gathering requirements** from the business stakeholders
        - understanding each vendor's use cases
        - expected transaction volumes
        - regional compliances
    - 2 microservices to keep things decoupled
        - focused on **Payments Processing** logic
            - handling common workflow
            - processing payments
        - focused on **Payments Gateway Integration**
            - choosing the right gateway - based on the region
            - differences between vendors
    - set up **CI/CD** pipeline
    - followed **Iterative Approach:** integrate one vendor, deploy to staging, test end-to-end with the frontend, gather feedback, then move to the next vendor.
- **Feedback Mechanism**
    - Weekly meetings with the shareholders to ensure that said expectations are met.
- **Fallback Mechanism**
    - If one Payments Gateway fails, **fallback to another** to ensure uninterrupted transactions. 
    - This was **well documented** and **tested properly**.

### Team
- **Project:** Social Media Marketing Campaign App
- **Mission:** to allow seamless campaign creation and tracking across various social media platforms in one place.
- **Leadership Strategy:** to empower team members with ownership of different integrations while maintaining a unified vision
- **Steps Taken**
    - assembled a cross-functional team and clarified our mission
    - broke the team into small groups, each responsible for researching and implementing one social media API
    - To ensure consistency, I established coding guidelines for how we handle API responses, errors, and rate limiting.
    - made sure the frontend and backend folks were in constant communication
    - By fostering collaboration and giving each person a voice in technical decisions, the team remained highly motivated and aligned.


# DevOps

## Describe how you implemented a CI/CD pipeline in one of your projects, and what impact it had on the team and product delivery?

### Architecture
- played a key part in building out our infrastructure automation and CI/CD pipeline.
- designed a pipeline that would containerize each service with Docker and then use Kubernetes to orchestrate deployments.
- **critical architectural decision** was using **Terraform** for **infrastructure as code**: AWS environments (from dev to prod) were consistent and could be brought up or changed in a controlled manner.
- **GitHub Actions Pipeline**: on every code push, would run tests, build a Docker image, and deploy to a Kubernetes cluster.
- **challenge:** coordinating deployments when multiple services were involved (to avoid incompatibilities)
    - solved by using semantic versioning and Helm charts to manage service dependencies.
- **Impact:** gave us **predictable**, **repeatable deployments** and reduced “it works on my machine” problems because everything ran in containers.
- moved from **manual**, **ad-hoc server** setups to an **automated** and **version-controlled infrastructure**, greatly increasing our system’s **reliability** and **scalability**.

### Process
- **Task:** improve the deployment process for a project that was moving to Azure.
- **Steps Taken**
    - introduced a CI/CD pipeline using Azure DevOps
        - setting up continuous integration to run our test suite and continuous deployment to push changes to Azure App Services.
    - worked with the team to define a branching strategy (GitFlow) that would work with the pipeline, ensuring that merging to the main branch would trigger a deployment to a staging slot and only after approval would it swap to production.
- **Initial challenges**: Tests that weren’t reliable and caused pipeline failures
    - revisited the flaky tests and improved our test suite for stability
    - Over a few iterations, the team began to trust the pipeline as we saw deployments succeed consistently.
- **Impact:** went from doing infrequent, large releases (which were stressful and often delayed) to frequent, small releases.
    - features and fixes reached users faster and with fewer bugs, because the automated tests and checks in the pipeline caught issues early

### Team
- emphasis on **team education and buy-in**
- **challenge:** proposed adopting Docker and Kubernetes for our development and deployment process
    - Rather than imposing it, organized a hands-on workshop
        - walked the team through containerizing a small app and deploying it to a local Kubernetes cluster.
    - helped demystify the tools and got everyone comfortable with the basics.


# Strengths

## What are some of your strengths?

### Technical
- **System Design and Scalability Thinking**: eg using AWS DynamoDB over a SQL database for the most load-intensive parts of the system.
- **Cross-Functional Collaboration**: eg collaborating with Ops and Finanace Teams for Payments Integration.
- **Quick and Learned Decision Making**: eg using Step Functions when emails were being marked as spam.
- **Driving Engineering Best Practices**: eg introducing PR Templates, GitLab CI/CD, code review guidelines across teams
- **Proper Documentation**: eg creating a clear documentation for the new architecture.

### Leadership
- **Mentorship and Team Building**: eg Mentoring a junior developer into integration of Test Cases.
- **Effective Communication**: eg highlighting positive outcomes and addressing team concerns.
- **Leadership Strategy**: eg using a microservices-based architecture and leveraging cloud scalability.

# Weeknesses

## What are some of your weaknesses?

- **Over-Engineering Early**: For the Brand-facing app, prematurely added too many abstraction layers for “future use,” which made onboarding harder.
    - **Fix**: Now you prioritize simplicity in early versions and only refactor once patterns emerge.
- **Not Delegating Enough Initially**: You tried to handle both architecture and implementation early in a project at GE, which slowed progress.
    - **Fix**: Now you prioritize simplicity in early versions and only refactor once patterns emerge.
- **Underestimating the Time for Documentation**: Post-launch, the absence of internal documentation slowed onboarding of new developers.
    - **Fix**: You now block time for docs in every sprint and assign it like any other deliverable.

# Challenges Faced

## What challenges did you face in your career? and how did you overcome them?

- **Vendor-Specific Payment Failures**: Tabby’s sandbox didn’t behave like production, causing failed callbacks post-launch.
    - **Fix**: Set up a mock API layer to simulate vendor behavior and added health-check retries.
- **Slow CI/CD Adoption**: Developers were reluctant to use GitLab CI/CD pipelines.
    - **Fix**: Demo-ed a POC to display the benefits of CI/CD and got everyone on board.
- **Ambiguous Requirements from Stakeholders**:  A stakeholder kept changing scope for the AI-driven QC project.
    - **Fix**: Created a fixed scope doc with checkpoints and used OKRs to anchor decisions.

# Conflicts

## Were there any instances of Conflicts between two teammates? How did you resolve them?

- **Frontend vs Backend Integration Delay**: The frontend team was blocked waiting on backend APIs.
    - **Fix**: Introduced an API contracts (using Swagger and Confluence) upfront and scheduled early alignment syncs.
- **Code Ownership Dispute**: Two developers argued over a feature ownership.
    - **Fix**: held a 1:1 with both, then redefined module ownership based on prior contributions and future goals.
- **Disagreement on Tech Stack Choice**: Two developers disagreed on which tech stack to use.
    - **Fix**: Facilitated a discussion, compared metrics (learning curve, ecosystem), and let team vote post POC review.

## Strong Conflicts among team members

### Architecture Disagreement During Refactor
- During the refactor of a backend service, two senior engineers on my team had fundamentally different views:
    - One advocated for using **event-driven architecture with Kafka** to decouple services.
    - The other strongly preferred keeping the **current REST-based synchronous design**, fearing increased complexity and ops overhead.
- **Handling**
    - **One-on-One Listening**: spoke to both individuals separately — not to judge, but to deeply understand their reasoning
    - **Short-Term vs Long-Term Vision Split**: While it was easy to continue with REST for now, but probably later on we needed to switch to event-driven architecture for scalability.
- **Solution**
    - Based on current requirement; Going on with the current design for now, and switching to Kafka after 6 months.

### Code Ownership vs Delivery Velocity
- During a tight release window, one of the mid-level engineers bypassed the usual code review process and merged a major backend change into the main branch. He justified it by saying: “It’s my module, I know what I’m doing — code review will just delay things.”
- A senior engineer on the team objected strongly — saying this set a bad precedent and violated our team ownership and peer review culture.
- **Handling**
    - **Clarified the Real Issue**: This wasn’t just about a merge — it was about boundaries and expectations.
        - The mid-level dev felt ownership pressure due to delivery timelines and took shortcuts.
        - The senior felt disrespected and worried that our review rigor was being eroded.
        - **Situation Reframing**: Not a people problem — a process weakness under pressure.
    - **Created Guardrails + Compromise**
        - A mandatory 1-review rule even during crunches (reduced from 2 temporarily).
        - A new “critical PR fast track” label — that allowed devs to signal when they needed rapid reviews, so others could prioritize.

# Team Culture
- **Detailed PRs**
    - **Structure:** PR Type (BugFix, Feature, etc), Description, Screenshots
- **PR and Feature Demos** in the standup meetings
- **Strict Code Reviews** 
    - 2 Approvals
- **Communication:** 
    - **highlighting positive outcomes** (eg praising how a recent code review caught a critical issue early), 
    - **addressing team’s concerns**
    - **demonstrating quick wins**
    - **creating a supportive environment**, where asking for help was encouraged
    - **1-to-1 meetings**
    - **daily standups**
- **Proper Documentation:** 
- **Specific Slack Channels** for Knowledge sharing: eg Articles
- **Performance-aware Culture**
- **Encouraging Cross-functional Collaborations**