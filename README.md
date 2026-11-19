# 🚀 BuildYourOwn PaaS

[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-K3s-326CE5?style=for-the-badge&logo=kubernetes)](https://k3s.io/)
[![AWS Boto3](https://img.shields.io/badge/AWS-boto3%20STS%20%7C%20S3-FF9900?style=for-the-badge&logo=amazon-aws)](https://aws.amazon.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

> **From Code to Cloud. Without the Complexity.**  
> An automated, developer-first Platform-as-a-Service (PaaS) engine that transforms GitHub repositories or ZIP archives into containerized, Kubernetes-orchestrated applications synced to AWS Cloud.

---

## 📌 Table of Contents

- [Overview](#-overview)
- [System Architecture](#-system-architecture)
- [Key Features](#-key-features)
- [Deployment Pipeline](#-deployment-pipeline)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup (FastAPI)](#1-backend-setup-fastapi)
  - [Frontend Setup (Next.js)](#2-frontend-setup-nextjs)
- [AWS Cloud Integration](#-aws-cloud-integration)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Security Architecture](#-security-architecture)
- [Contributing & License](#-contributing--license)

---

## 🌟 Overview

**BuildYourOwn PaaS** bridges the gap between raw source code and production cloud infrastructure. Instead of requiring engineers to manually write multi-stage Dockerfiles, draft intricate Kubernetes YAML manifests, or deal with complex cloud credential management, the platform automates the entire lifecycle:

$$\text{Source Code (GitHub / ZIP)} \longrightarrow \text{Framework Introspection} \longrightarrow \text{BuildKit Dockerfile} \longrightarrow \text{K3s Manifests} \longrightarrow \text{AWS S3 Cloud Sync} \longrightarrow \text{Live URL}$$

---

## 🏗️ System Architecture

```
+---------------------------------------------------------------------------------+
|                               DEVELOPER CLIENT                                  |
|   Next.js 14 App Router  *  TypeScript  *  Tailwind CSS  *  shadcn/ui           |
|   * Multi-Step Deployment Wizard (GitHub / ZIP)                                 |
|   * Real-time Pipeline Logs & Artifacts Inspector                              |
|   * Temporary In-Memory AWS STS Authentication                                   |
+---------------------------------------+-----------------------------------------+
                                        | HTTP REST (CORS)
+---------------------------------------v-----------------------------------------+
|                          FASTAPI CONTROL PLANE (:8000)                          |
|   * Asynchronous BackgroundTasks Worker Engine                                  |
|   * SQLite State Store (backend/data/paas.db)                                   |
|   * Real Multipart ZIP Streamer with ZipSlip Prevention                         |
|   * Instant App Preview Router (/apps/{project-slug})                          |
|   * Host CPU / RAM Telemetry Sampler (psutil)                                   |
+---------------------------------------+-----------------------------------------+
                                        |
                  +---------------------+---------------------+
                  |                                           |
+-----------------v-------------------+   +-------------------v-------------------+
|          BUILDKIT ENGINE            |   |          AWS CLOUD & S3 SYNC          |
|  * Framework Auto-Detection         |   |  * In-Memory STS Caller Identity      |
|  * Multi-Stage Dockerfile Gen       |   |  * Automated S3 Bundle Upload         |
|  * Kubernetes K3s YAML Generator    |   |    (byo-paas/{project}/{version}/)    |
|    - deployment.yaml                |   |  * EC2, ECR & VPC Resource Discovery  |
|    - service.yaml                   |   |                                       |
|    - ingress.yaml (Traefik)         |   |                                       |
+-------------------------------------+   +---------------------------------------+
```

---

## ⚡ Key Features

1. **Multi-Source Deployment**:
   - **GitHub Integration**: Direct shallow clone (`git clone --depth 1`) from public or authenticated Git repositories.
   - **ZIP Upload**: Multipart archive upload with automatic extraction and strict ZipSlip path traversal protection.
2. **Automated Framework Detection**:
   - Automatically detects and builds Next.js, React, Vue, Express, FastAPI, Django, Flask, Go, Rust, and Static HTML projects.
3. **Automated Kubernetes (K3s) Manifests**:
   - Generates production-ready `deployment.yaml`, `service.yaml`, and Traefik `ingress.yaml` with customizable CPU, memory, and replica limits.
4. **Zero-Persistence AWS STS Security**:
   - Connects to AWS using temporary STS sessions (`AccessKeyId`, `SecretAccessKey`, `SessionToken`, `Region`).
   - Credentials exist **strictly in server process memory**—never stored in SQLite, local disk, cookies, or browser storage.
5. **Instant Live App Serving**:
   - Automatically serves deployed static and web applications locally at `http://127.0.0.1:8000/apps/<project-slug>` without requiring cluster DNS setup.
6. **Automatic S3 Cloud Sync**:
   - When AWS is connected, deployment bundles (source code, generated Dockerfile, and K3s YAML manifests) are automatically synced to an Amazon S3 bucket.

---

## 🔄 Deployment Pipeline

| Stage | Name | Description | Output |
|:---:|:---|:---|:---|
| **01** | **Source Ingestion** | Extract multipart ZIP safely or shallow clone Git repository | Isolated workspace directory |
| **02** | **Framework Analysis** | Scan manifest files (`package.json`, `requirements.txt`, etc.) | Project framework classification |
| **03** | **BuildKit Dockerfile** | Generate optimized multi-stage build container specification | Production `Dockerfile` |
| **04** | **K3s Synthesis** | Synthesize Kubernetes Deployment, Service, and Traefik Ingress | `deployment.yaml`, `service.yaml`, `ingress.yaml` |
| **05** | **Cloud Synchronization** | Upload artifacts to AWS S3 bucket if temporary session active | `s3://<bucket>/byo-paas/<app>/<version>/` |
| **06** | **Live Ingress Serving** | Register application route on control plane for instant preview | `http://127.0.0.1:8000/apps/<slug>` |

---

## 💻 Tech Stack

### **Frontend**
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS, shadcn/ui
- **Icons**: Lucide React
- **Charts**: Recharts
- **Forms & Validation**: React Hook Form, Zod
- **Client State**: TanStack React Query

### **Backend**
- **Framework**: FastAPI (Python 3.10+)
- **ASGI Server**: Uvicorn
- **Cloud SDK**: AWS SDK for Python (`boto3`)
- **System Telemetry**: `psutil`
- **Database**: SQLite3 (`backend/data/paas.db`)

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18.17+ or 20+
- **Python** 3.10, 3.11, 3.12, or 3.13
- **Git** installed on system PATH

---

### 1. Backend Setup (FastAPI)

```bash
# Navigate to the backend directory
cd backend

# Create a virtual environment
python -m venv .venv

# Activate virtual environment
# On Windows PowerShell:
.\.venv\Scripts\Activate.ps1
# On Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the FastAPI server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

The FastAPI control plane will be live at `http://127.0.0.1:8000`.  
Interactive OpenAPI/Swagger documentation is available at `http://127.0.0.1:8000/docs`.

---

### 2. Frontend Setup (Next.js)

In a new terminal window:

```bash
# Return to the root directory
cd Product-02

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ☁️ AWS Cloud Integration

BuildYourOwn PaaS connects to AWS without requiring the AWS CLI or permanent IAM root credentials.

### Connecting via Temporary STS (e.g., AWS Academy / Sandbox)
1. Open the dashboard at `http://localhost:3000/aws-connections`.
2. Input your temporary session credentials:
   - **AWS Access Key ID** (e.g. `ASIA...`)
   - **AWS Secret Access Key**
   - **AWS Session Token**
   - **AWS Region** (e.g. `us-east-1`)
3. Click **Connect AWS Cloud**.
4. The control plane calls `sts.get_caller_identity()` via `boto3`. Once validated, the badge reflects `aws:connected` and displays your account ID and IAM ARN.
5. Every subsequent deployment automatically uploads source code, Dockerfiles, and K3s YAML manifests to your S3 bucket.

---

## 📖 API Documentation

FastAPI provides an automatic, interactive OpenAPI specification:

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/health` | Service health status and runtime capabilities |
| `GET` | `/api/v1/projects` | List all tracked projects |
| `POST` | `/api/v1/projects` | Create a new project & trigger deployment pipeline |
| `POST` | `/api/v1/projects/upload-zip` | Multipart ZIP upload endpoint (50 MB limit) |
| `POST` | `/api/v1/projects/{id}/deploy` | Trigger redeployment of an existing project |
| `GET` | `/api/v1/deployments` | List all historical and active deployments |
| `GET` | `/api/v1/deployments/{id}` | Inspect deployment status, build logs, and YAML artifacts |
| `POST` | `/api/v1/aws/connect` | Authenticate temporary AWS STS credentials into memory |
| `GET` | `/api/v1/aws/status` | Current AWS session status and expiration |
| `GET` | `/api/v1/aws/resources` | Discover connected VPCs, EC2 instances, ECR, and S3 buckets |
| `POST` | `/api/v1/aws/upload-deployment` | Push deployment bundle to a selected Amazon S3 bucket |
| `GET` | `/apps/{project-slug}` | Direct live application serving endpoint |

---

## 📁 Project Structure

```text
BuildYourOwn-PaaS/
├── src/                          # Next.js 14 Frontend
│   ├── app/                      # App Router Pages
│   │   ├── (auth)/               # Login, Signup, Forgot Password
│   │   ├── (dashboard)/          # Dashboard, Projects, Deployments, Infrastructure,
│   │   │                         # Monitoring, AWS Connections, Guide, Settings
│   │   ├── layout.tsx            # Global Root Layout
│   │   └── page.tsx              # Marketing Landing Page
│   ├── components/               # Reusable UI Components (shadcn/ui)
│   ├── features/                 # Modular Feature Slices
│   ├── hooks/                    # Custom React Hooks
│   ├── lib/                      # Utilities & API Client
│   └── types/                    # TypeScript Data Contracts
├── backend/                      # FastAPI Control Plane
│   ├── app/
│   │   ├── routers/              # API Route Handlers
│   │   │   ├── aws.py            # AWS STS, S3 & Cloud Discovery
│   │   │   ├── dashboard.py      # Telemetry & Summary
│   │   │   ├── deployments.py    # Deployment Querying
│   │   │   ├── health.py         # System Health
│   │   │   ├── infrastructure.py # Simulated/Live Cluster State
│   │   │   └── projects.py       # Project CRUD & Deploy Triggers
│   │   ├── services/
│   │   │   ├── aws_service.py    # In-Memory boto3 Session Manager
│   │   │   ├── builder_service.py# Framework Detect, Dockerfile & K3s Gen
│   │   │   └── pipeline_service.py# Asynchronous Deployment Engine
│   │   ├── config.py             # Server Settings & Directory Paths
│   │   ├── database.py           # SQLite Schema & Helpers
│   │   ├── main.py               # FastAPI App & Live App Server
│   │   └── models.py             # Pydantic Schemas & DTOs
│   ├── data/                     # Local Storage (Workspaces & Uploads)
│   ├── Dockerfile                # Backend Container Definition
│   └── requirements.txt          # Python Dependencies
├── docker-compose.yml            # Multi-Service Production Compose File
├── Dockerfile                    # Frontend Container Definition
├── GUIDEBOOK.md                  # Comprehensive Platform Manual
└── README.md                     # Project Readme
```

---

## 🔒 Security Architecture

- **Zero Credential Persistence**: AWS STS credentials (`ASIA...`) are held strictly in server memory. They are never written to the SQLite database, local files, browser storage, or environment variables.
- **ZipSlip Protection**: The ZIP extraction engine inspects file paths and rejects any archive entry attempting relative traversal (`../`).
- **Input Sanitization**: Ingress hostnames and project slugs are validated to ensure compliant DNS labels.

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.
