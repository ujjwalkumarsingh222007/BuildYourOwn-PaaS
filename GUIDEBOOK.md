# BuildYourOwn PaaS — AWS Connection & Deployment Guide

## 1. Connect Your AWS Account with a Temporary Session

1. Obtain your temporary STS credentials from **AWS IAM Identity Center (SSO Portal)** or AWS CLI:
   ```bash
   aws sts get-session-token --duration-seconds 3600
   ```
   Temporary credentials provide:
   - `AccessKeyId` (starts with `ASIA...`)
   - `SecretAccessKey`
   - `SessionToken` (`FwoGZXIv...`)
2. Open **http://localhost:3000/aws-connections** in the console.
3. Paste `AccessKeyId`, `SecretAccessKey`, `SessionToken`, pick your **AWS Region**, and click **Connect AWS**.
4. The FastAPI backend validates your session directly with AWS STS (`boto3`) and keeps credentials strictly in server memory (never saved to disk or browser storage).
5. Once connected:
   - View your **VPCs**, **EC2 instances**, **ECR repositories**, **EKS clusters**, and **S3 buckets** under `/infrastructure`.
   - Open any deployment under `/deployments/[id]` and click **Push to S3** to upload the project source + generated `Dockerfile` + Kubernetes K3s YAML manifests directly into your S3 bucket.

---

## 2. Upload & Host This Website on AWS EC2

This project includes `Dockerfile`, `backend/Dockerfile`, and `docker-compose.yml` so you can deploy both the Next.js frontend and FastAPI backend together on an AWS EC2 instance:

1. Launch an Ubuntu EC2 instance (`t3.small` or larger) and allow inbound TCP ports **3000** (Frontend) and **8000** (FastAPI) in the Security Group.
2. Upload/clone this repository to the EC2 instance and run:
   ```bash
   sudo apt-get update && sudo apt-get install -y docker.io docker-compose-v2
   export EC2_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
   sed -i "s|http://localhost:8000/api/v1|http://$EC2_IP:8000/api/v1|g" docker-compose.yml
   sed -i "s|http://localhost:3000|http://$EC2_IP:3000|g" docker-compose.yml
   sudo docker compose up -d --build
   ```
3. Visit `http://<EC2_PUBLIC_IP>:3000`.

---

## 3. Website Pages

- `/` — Landing page
- `/login`, `/signup`, `/forgot-password` — Workspace entry
- `/dashboard` — Project/deployment KPIs, host CPU & memory charts, recent activity
- `/projects` & `/projects/[id]` — Manage projects, start/stop/redeploy/delete
- `/projects/new` — 5-step deployment wizard (GitHub repo or `.zip` upload up to 50 MB)
- `/deployments` & `/deployments/[id]` — Build logs, generated `Dockerfile` & K3s YAML manifests, S3 bundle upload, rollback
- `/infrastructure` — Host runtime checks, K3s nodes/pods/services/namespaces, live AWS resources
- `/monitoring` — Live host CPU and memory charts
- `/aws-connections` — Temporary AWS STS credential connection & verification
- `/settings` — Workspace defaults, theme switcher, backend API URL
- `/guide` — In-app AWS connection & website guide
