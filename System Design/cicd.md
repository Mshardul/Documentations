# Tools Used
- `GitHub`: for storing source code and for version control
- `GitHub Actions`: for CI (building code, running tests, creating Docker images)
- `Docker`: for containerization of microservices.
- `Kubernetes (on EKS)`: for orchestrating containers (deployments, scaling, networking).
- `Argo CD`: for CD into Kubernetes.
- `NGINX`: Commonly used as a reverse proxy, load balancer, or ingress controller.
    - Properties
        - `Ingress Controller`: 
            - Implements Kubernetes Ingress rules
            - routes traffic to Services.
            - configures the actual load balancer/proxy
        - `API Gateway`: 
            - Reads Ingress resources to route HTTP/HTTPS traffic to the correct microservice pods.
                - Uses `Kubernetes Services` (which track pod IPs) to know where to send requests.
            - Handles authentication, rate limiting, request/response transformation.
            - Terminates TLS (HTTPS)
    - Alternatives: `Traefik`, `HAProxy`, `AWS ALB Ingress Controller`
- `Ingress`:
    - A Kubernetes resource defining how external traffic is routed to internal services in the cluster.
    - requires an Ingress Controller to implement the rules.
- `AWS ECR`: for container registry

# GitHub Repos
- `project-be`: backend microservice
- `project-fe`: frontend microservice
- `project-argo-cd`: for CD
    - contains Kubernetes YAML files (Deployments, Services, Ingress) for each microservice
    - contains image_tags for each microservice.

# Flow
- Developer commits code to `Github` repo `project-be`
- This commit triggers `GitHub Action`.
    - `checks out` the updated code.
    - `tests` the code.
    - builds a `Docker image` of the microservice
    - tags the `Docker image`.
    - pushes the `Docker Image` to `AWS ECR`.
- Developer updates Argo CD git repo `project-argo-cd`
    - update the `image tag` file (`project-argo-cd/{microservice_name}/prod/docker_image_tag.txt`)
    - commit the changes
    - `project-argo-cd/{microservice_name}/prod/docker_image_tag.txt` now holds the new `image tag` for the microservice.
- This commit triggers `GitHub Actions`
    - uses Kustomize/Helm to modify the Deployment’s `image:` field
        - runs `kustomize edit set image payment-service=ECR_IMAGE_TAG`.
    - Commits the updated kustomization.yaml to Argo CD repo.
- `Argo CD` detects the repo changes, as it consistently monitors the `project-argo-cd` repo.
    - `Argo CD` syncs the `Kubernetes Manifests`.
        - updates the `Kubernetes Deployments YAML` for the microservice, stored in the `GitHub`.
        - updates the `Kubernetes Deployments` (or `PodSpec`, or `Kustomize/Helm release`) in the `EKS cluster` to use the new image tag.
        - syncs the desired state from Git to the cluster.
            - pulls the YAML (or text file, or chart) from Git, renders it, and applies it to Kubernetes via the Kubernetes API.
            - runs `kubectl apply -f yaml-file.yaml`
- `Kubernetes` Notices the Deployment Has Changed
    - Once `Argo CD` updates the `manifest` in the `cluster`, `Kubernetes` detects the YAML changes, and triggers a rolling update
        - `Kubernetes` pulls the new `Docker image` from `ECR`.
        - retrieves `secrets` from `AWS` to Kubernetes `Secret` objects
        - `Kubernetes` then rolls out the new `Pods` with the updated `image`, respecting your Deployment’s rolling update strategy.
        - The `Kubernetes Service` tracks pod IPs via `labels`/`selectors` .
        - When new `pods` are ready, the Service updates its endpoint list to include their IPs.
- `Ingress Controller` auto-discovers the Updated Pods
    - `Ingress Controller` continuously watches the `Kubernetes API` for changes to Service/Endpoint.
    - When the Service’s endpoints (pod IPs) change, `NGINX` automatically updates its internal routing and load-balancing rules to forward traffic to the new Pods.
    - `Request` hits the `Ingress load balancer`, which routes the traffic to the correct set of `Pods` via the `NGINX Ingress Controller`.

# FAQs
1. What is **Containerization**?
- packages an application and its dependencies into a `Docker image` into a portable, isolated runtime environment (a container), ensuring it runs consistently across environments (dev, stage, prod).
- **Key benefits:**
    - Consistency across environments (dev/test/prod).
    - Lightweight (shares the host OS kernel, unlike VMs).
    - Isolation (no dependency conflicts between apps).
- **Tools**: `Docker`, `Podman`, `Containerd`, `CRI-O`

2. What is **Orchestration**?
- manages containers at scale: scheduling, scaling, networking, and health monitoring. Kubernetes automates this.
- automates the deployment, scaling, networking, and availability of containers across a cluster of machines.
- maintains a list of “Endpoints” for each Service. This is a mapping of the Pod IPs that are currently ready and serving traffic.
- **Key tasks:**
    - Deploy containers across servers.
    - Auto-scale based on load.
    - Handle rolling updates/rollbacks.
    - Manage service discovery and load balancing.
- **Tools** : `Kubernetes`, `Docker Swarm`, `Nomad`, `Apache Mesos`

1. What is **Docker Container Registry**?
- **AWS ECR**
    - it’s a managed container registry provided by AWS.
    - Stores images that Kubernetes (EKS) pulls to run containers.
- **Tools**: `Docker Hub`, `AWS ECR`

1. What is **Kubernetes control plane**?
- Manages the Kubernetes API server, etcd database, and core components (no need to maintain master nodes).
- It simplifies Kubernetes cluster setup, scaling, and upgrades.
- **AWS EKS**
    - is a managed Kubernetes service
    - AWS handles the `Kubernetes Control Plane` (API server, scheduler, etc.), while you manage worker nodes.
    - Why prefer over Plain Kubernetes
        - AWS handles Kubernetes master nodes (security patches, scaling, etc.).
        - Integration with AWS services (`VPC`, `IAM`, `ECR`).

1. What are **Kubernetes Manifests Configuration Management Tools**?
- they simplify managing `YAML` files for multiple environments (`dev`/`stage`/`prod`)
- **Tools**: `Kustomize`, `Helm`

1. What are **Secret Managers**?
- **AWS Secrets Manager**
    - stores Secrets (e.g., database passwords, API keys).
    - Uses `IAM Roles for Service Accounts (IRSA)` to grant `pods` access to `AWS Secrets Manager`.
    - Use a `sidecar container` or `admission controller` (e.g., `AWS Secrets Controller`) to inject secrets into pods at runtime.
    - Alternatively, syncs secrets to `Kubernetes Secrets` using tools like `external-secrets`.

1. What is **Ingress**?
- is a `Kubernetes resource` defining rules thattells the cluster how to direct incoming HTTP/HTTPS traffic to the correct microservice.

1. What is **Ingress Controller**?
- An `Ingress Controller`, running inside the cluster, implements that Ingress spec.
- **Tools**: `NGINX`, `Traefik`, `AWS ALB Ingress Controller`

1. Request Flow
- User sends a request to `user.example.com`.
- `DNS` routes the request to the Nginx `Ingress Controller`’s external IP.
- `Nginx` routes the request to one of the new v2 pods (via the Service’s endpoints).

1.  flow
GitHub (Backend Repo Commit)  
│  
└─▶ GitHub Actions:
    ├─ Run Tests
    ├─ Build Docker Image
    └─ Push Docker Image to AWS ECR
        │  
        └─▶ Stores Docker images

GitHub (Argo CD Repo Commit)  
│  
└─▶ GitHub Actions:
    ├─ GitHub Actions updates the `values.yaml` file or passes the tag as an override
    ├─ Helm modifies Deployment YAML with `image:tag` (based on templates and values) locally in the CI pipeline
    └─ Commit/Push to modified YAML `product-argo-cd` repo
        │  
        └─▶ Argo CD (monitoring repo):  
            ├─ Detects repo changes (eg YAML update)
            ├─ Syncs with EKS Cluster  
            └─ Updates Kubernetes Deployments (runs `kubectl apply -f <path-to-yaml>`)
                │  
                └─▶ Kubernetes:  
                    ├─ Pulls new image from ECR  
                    ├─ Creates new pods  
                    ├─ Terminates old pods (rolling update)  
                    └─ Updates Service Endpoints  
                        │  
                        └─▶ NGINX Ingress Controller:  
                            ├─ Watches Kubernetes API for Endpoint changes  
                            └─ Routes traffic to new pods  
                                │  
                                └─▶ User requests hit updated pods  

1. Is my flow correct? If not, update it.
2. How does Helm know about the new image tag? Is it part of GitHub Actions?
3. Does Helm updates the YAML file content? Like, if I check in my GitHub Repo, will the YAML file be changed? What would be the commit message?
4. How does Argo CD syncs the EKS Cluster? How does it tell the EKS Cluster about the new image? 
5. I understand that GitHub Action from the `project-be` repo pushes the entire image to EKS. But how does Kubernetes know which image to pull.
6. Just updating the Kubernetes Service Endpoints is enough for NGINX to route the traffic to the new pods? Exaplain more on Kubernetes Service Enddpoint. Are all the {service_name: [endpoints]} data written in a single file? If yes, where is this file? Do I have access to update this file?
7. How does all of these service handle authorization? Eg not all team members should be able to create/update an existing Kubernetes pod/cluster.