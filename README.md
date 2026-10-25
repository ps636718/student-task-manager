# Practical 2: Dockerization and Cloud Deployment of a Node.js Web Application

**Student Name:** Pawan Suman  
**Student ID (BTid):** BT24CSD054  
**Subject:** Cloud Computing & DevOps / Web Development Lab  
**Date:** October 2026  

---

## 📌 Aim
To develop a responsive Node.js and Express.js web application, containerize it using Docker, and deploy it to a cloud hosting platform with automated CI/CD via GitHub.

---

## 🎯 Problem Statement
Develop a **Student Task Management Web Application** that allows students to create, view, update, and delete academic tasks (CRUD operations). Containerize the application using Docker and deploy it to a cloud platform (Render / Azure / AWS) to make it publicly accessible via a live URL.

---

## 🏗️ Expected Deployment Architecture

```text
+-----------------------+         +-----------------------+         +-----------------------+
|       Developer       |  git    |        GitHub         | webhook |         Cloud         |
|                       | ------> |                       | ------> |                       |
|     VS Code + Git     |  push   |   Source Repository   | auto-cd |    Docker Container   |
+-----------------------+         +-----------------------+         +-----------------------+
                                                                                |
                                                                                | exposes port
                                                                                v
                                                                    +-----------------------+
                                                                    | Public Web Application|
                                                                    |  https://...onrender  |
                                                                    +-----------------------+
```

1. **Developer:** Writes source code in VS Code, tests locally with Node.js and Docker Desktop.
2. **GitHub:** Hosts the repository and triggers cloud deployment workflows upon `git push`.
3. **Cloud (Render / Azure / AWS):** Builds the Docker image from `Dockerfile` and runs the container.
4. **Public Web Application:** Users access the responsive task manager from any browser.

---

## 💻 Tech Stack & Requirements

| Layer | Technologies Used |
|---|---|
| **Backend** | Node.js (v18+), Express.js 4, Morgan logger, CORS, Dotenv |
| **Frontend** | HTML5, CSS3, Bootstrap 5.3, Bootstrap Icons, Google Fonts (Outfit & Inter) |
| **Persistence** | File-backed JSON Storage (`data/tasks.json`) with sample student seed data |
| **Containerization** | Docker, Docker Desktop, Multi-layer Alpine Linux Image |
| **Version Control** | Git & GitHub |
| **Cloud Hosting** | Render (Docker Web Service) / AWS ECS / Azure App Service |

---

## 📂 Repository Structure

```text
Practical_2/
├── data/
│   └── tasks.json              # Persistent JSON database for tasks
├── public/
│   ├── index.html              # Responsive Bootstrap 5 UI with student branding
│   ├── css/
│   │   └── style.css           # Modern gradient & glassmorphic styling
│   └── js/
│       └── app.js              # Client-side CRUD fetch controller & toast manager
├── routes/
│   ├── tasks.js                # REST API endpoints for Tasks CRUD
│   └── info.js                 # Health check, Stats, and Student Info endpoints
├── storage/
│   └── taskStorage.js          # Persistence layer & seed manager
├── .dockerignore               # Files excluded from Docker image build
├── .gitignore                  # Files excluded from Git tracking
├── Dockerfile                  # Production container definition
├── docker-compose.yml          # Compose specification for local testing
├── package.json                # Project dependencies and npm scripts
├── server.js                   # Main Express application entrypoint
├── test.js                     # Automated storage and CRUD test script
└── README.md                   # Complete documentation
```

---

## 🚀 REST API Specification

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/tasks` | Get all tasks (supports query filters: `status`, `priority`, `category`, `search`) |
| `GET` | `/api/tasks/:id` | Get single task details by ID |
| `POST` | `/api/tasks` | Create a new task (body: `title`, `description`, `category`, `priority`, `status`, `dueDate`) |
| `PUT` | `/api/tasks/:id` | Update an existing task |
| `PATCH` | `/api/tasks/:id/status`| Quick toggle task status (`Pending`, `In Progress`, `Completed`) |
| `DELETE` | `/api/tasks/:id` | Delete a task |
| `GET` | `/api/stats` | Get KPI metrics (total, pending, completed, rate) |
| `GET` | `/api/health` | Container healthcheck (uptime, memory, hostname) |
| `GET` | `/api/student-info` | Returns student details: Pawan Suman (BT24CSD054) |

---

## 🛠️ Step-by-Step Execution Guide

### Step 1: Local Development & Testing

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run automated verification tests:**
   ```bash
   npm test
   ```

3. **Start local Express server:**
   ```bash
   npm start
   ```
   Open your browser at: `http://localhost:3000`

---

### Step 2: Containerization with Docker

1. **Make sure Docker Desktop is running** on your system.
2. **Build the Docker Image:**
   ```bash
   docker build -t student-task-manager:latest .
   ```
   *Explanation:* Reads the `Dockerfile`, pulls `node:20-alpine`, installs production dependencies, copies the code, and creates the image.

3. **Verify the created Docker Image:**
   ```bash
   docker images | grep student-task-manager
   ```

4. **Run the Docker Container locally with Port Mapping:**
   ```bash
   docker run -d -p 3000:3000 --name student-tasks-app student-task-manager:latest
   ```
   *Explanation:* 
   - `-d`: Run container in detached mode (background).
   - `-p 3000:3000`: Map host port `3000` to container port `3000`.
   - `--name`: Assign a custom container name.

5. **Test container execution and view logs:**
   ```bash
   docker ps
   docker logs student-tasks-app
   ```

6. **Test the healthcheck inside the container:**
   ```bash
   curl http://localhost:3000/api/health
   ```

7. **Alternatively, use Docker Compose:**
   ```bash
   docker compose up -d
   ```

---

### Step 3: Push Source Code to GitHub

1. **Initialize Git and commit code:**
   ```bash
   git init -b main
   git add .
   git commit -m "feat: complete Practical 2 Student Task Manager with Dockerfile"
   ```

2. **Create a new repository on GitHub:**
   - Go to [https://github.com/new](https://github.com/new)
   - Repository name: `student-task-manager-docker`
   - Set visibility to **Public**
   - Leave "Initialize with README" unchecked

3. **Link local repository and push:**
   ```bash
   git remote add origin https://github.com/ps636718/student-task-manager.git
   git branch -M main
   git push -u origin main
   ```

---

### Step 4: Deploy to Cloud (Render - Recommended & Free)

Render automatically detects your `Dockerfile` and builds/deploys the container to the cloud for free:

1. **Sign in to Render:**
   - Go to [https://render.com](https://render.com) and log in with your GitHub account.

2. **Create New Web Service:**
   - Click **New +** -> Select **Web Service**.
   - Choose **Build and deploy from a Git repository**.
   - Select your repository: `student-task-manager-docker`.

3. **Configure the Service:**
   - **Name:** `pawan-suman-taskmanager` (or any unique name)
   - **Region:** Singapore / Oregon / Frankfurt
   - **Branch:** `main`
   - **Runtime:** **Docker** (Render will automatically select Docker since a `Dockerfile` exists)
   - **Instance Type:** Free

4. **Deploy:**
   - Click **Create Web Service**.
   - Render will execute `docker build` using your `Dockerfile` and spin up the live container.
   - Once deployment finishes (status shows **Live**), Render generates a public URL, for example:
     ```text
     https://pawan-suman-taskmanager.onrender.com
     ```

5. **Verify Public URL:**
   - Open the live URL in your browser.
   - Check the live badge: `Docker App: Healthy`.
   - Test creating, updating, and deleting tasks live on the cloud!

---

## 🧠 Key Viva / Examination Concepts

1. **What is Containerization?**  
   Packaging an application with all its libraries, runtime, and configuration into a lightweight container that runs identically across any machine.

2. **Difference between Docker Container vs Virtual Machine (VM):**  
   VMs virtualize hardware and include a full Guest OS (heavy, slow boot, GBs in size). Docker containers share the host OS kernel and virtualize at the OS process level (lightweight, starts in milliseconds, MBs in size).

3. **Why use `node:20-alpine` in Dockerfile?**  
   Alpine Linux is an ultra-lightweight distribution (around 5MB base). It reduces container attack surface, speeds up cloud deployments, and minimizes image transfer time.

4. **What is Port Mapping (`-p 3000:3000`)?**  
   Containers have their own isolated network stack. The `-p 3000:3000` argument binds port `3000` of the host machine to port `3000` of the container, allowing web traffic to reach the Express server.

5. **Role of `.dockerignore`:**  
   Prevents unnecessary host files (such as host `node_modules`, `.git`, `.env`) from being copied into the container context during `docker build`, ensuring clean builds and fast transfers.

---

## 👨‍💻 Student Details
- **Student Name:** Pawan Suman
- **ID Number:** BT24CSD054
- **Branch:** Computer Science & Engineering
