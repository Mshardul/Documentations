# Technical Challenges Faced and Overcame

## What key Technical challenges have you faced in your career?

### Architecture
- Designing for **high scalability** and **availability**
    - Utilized **Microservice Architecture** and leveraging **AWS-managed Services** for **auto-scaling** and **high resposiveness**.
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


# Technology Decision Making

## When did you have to choose a Technology Stack (X over Y), and explain the trade-offs you had to consider? 

### Golang over Python for high-throughtput microservice
- Golang’s **concurrency model** and **compiled performance** excelled for the **scale** we needed.
- Golang gave us **efficient goroutines** and **lower latency** under load.
- **performance** and **type safety** were more critical for this service (to handle **thousands of req/sec** without hiccups).
- **Downside:** slightly **longer development time** and **needing to manage memory manually**.
- But it paid off when our service **easily handled peak traffic** with **minimal CPU usage**.

### Flask over Django
- for **rapid development** and **flexibility** for a microservice that had very specific needs.
- **Flask’s minimalistic approach** meant we could **start small** and **add only the libraries we needed**, which kept our **initial velocity high**.
- **Trade-off:** Flask required us to **implement certain features (like authentication or admin interfaces) from scratch** that Django would have provided out-of-the-box.
- It was okay as our **team was experienced** in those areas and we **wanted full control** to optimize each component.

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

### Process
- **Meetings:** Organized **regular stand-ups** and **bi-weekly sprint planning meetings** that included representatives from various teams.
    - **Tasks:** **review Progress**, **surface Blockers**, **demo PRs**, and **adjust priorities** collaboratively.
    - **Demos:** **reinforced accountability** and **teamwork across functions**
- **Challenge:** handling different priorities (e.g., tech debt vs. new features)
    - **Managed By:** maintaining a **transparent backlog** and **negotiating scope with stakeholders** to find a healthy balance
- **Solutions:** **having a clear process** with defined roles, **open communication** channels, and a **culture of calling out issues early**
- **Result:** **delivering complex projects on time**, as everyone was aware of the timeline and quality standards and could coordinate their work accordingly.

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
    - **Isolating AI processing in its own service queue:** 


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