# LAB PRACTICAL REPORT: PRACTICAL 2

**Course / Subject:** Cloud Computing & DevOps / Web Development Lab  
**Practical Title:** Practical 2: Dockerization and Cloud Deployment of a Node.js Web Application  
**Student Name:** Pawan Suman  
**Student ID (BTid):** BT24CSD054  
**Date of Submission:** October 2026  

---

## 1. Aim
To develop a responsive Node.js and Express.js web application, containerize it using Docker, and deploy it to a cloud hosting platform with continuous deployment from GitHub.

---

## 2. Problem Statement
Develop a **Student Task Management Web Application** that allows students to create, view, update, and delete academic tasks (CRUD operations). Containerize the application using Docker and deploy it to a cloud hosting platform (Render / Azure / AWS) to make it publicly accessible via a live URL.

---

## 3. Software Requirements
- **Runtime & Backend Framework:** Node.js (v18+) and Express.js (v4.21+)
- **Frontend & Styling:** HTML5, CSS3, Bootstrap 5.3, Bootstrap Icons, Google Fonts (Outfit & Inter)
- **Container Engine:** Docker Desktop (v29.5+)
- **Version Control:** Git (v2.54+) and GitHub
- **Cloud Platform:** Render Cloud Platform (Docker runtime) / AWS / Azure

---

## 4. Expected Deployment Architecture

```text
+-----------------------+         +-----------------------+         +-----------------------+
|       Developer       |  git    |        GitHub         | webhook |         Cloud         |
|                       | ------> |                       | ------> |                       |
|     VS Code + Git     |  push   |   Source Repository   | auto-cd |    Docker Container   |
+-----------------------+         +-----------------------+         +-----------------------+
                                                                                |
                                                                                | port 3000
                                                                                v
                                                                    +-----------------------+
                                                                    | Public Web Application|
                                                                    |  https://...onrender  |
                                                                    +-----------------------+
```

### Architecture Breakdown:
1. **Developer Environment:** The developer creates and tests the Node.js REST API and responsive frontend using VS Code and Git locally.
2. **GitHub Source Repository:** The codebase is version-controlled and pushed to GitHub (`main` branch).
3. **Cloud Platform (Render):** A webhook triggers automated Docker build directly from the `Dockerfile` in the repository, packaging the application into an isolated container.
4. **Public Web Application:** The cloud service maps incoming HTTPS web traffic to the container's internal port `3000`, providing a public live URL.

---

## 5. Functional Implementation Details

### A. Node.js & Express.js REST API Endpoints
- `GET /api/tasks` : Returns all tasks, supporting search and filter parameters (`status`, `priority`, `category`).
- `GET /api/tasks/:id` : Retrieves details of a specific task by its ID.
- `POST /api/tasks` : Validates input and creates a new task in persistent storage.
- `PUT /api/tasks/:id` : Updates an existing task's title, description, category, priority, or due date.
- `PATCH /api/tasks/:id/status` : Quickly toggles status (`Pending`, `In Progress`, `Completed`).
- `DELETE /api/tasks/:id` : Deletes a task by ID.
- `GET /api/stats` : Aggregates KPI statistics (Total, Completed, Pending, In Progress, Completion Rate %).
- `GET /health` & `GET /api/health` : Healthcheck endpoint returning container status, uptime, and host specs.
- `GET /api/student-info` : Returns metadata confirming student credentials: **Pawan Suman (BT24CSD054)**.

### B. Persistent Data Storage
Tasks are stored persistently in JSON format at `data/tasks.json`, ensuring data integrity across server restarts and volume mapping in Docker.

### C. Responsive User Interface
The UI features:
- Interactive KPI metric cards.
- Quick filter buttons for task statuses and dropdowns for priorities and categories.
- Real-time search with debounced typing.
- Modal forms for creating and editing tasks.
- Toast notifications for user feedback.
- Architecture diagram visualizer matching course requirements.

---

## 6. Docker Containerization

### Dockerfile Specification
```dockerfile
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
RUN npm install --omit=dev

COPY . .
RUN mkdir -p /app/data && chmod -R 777 /app/data

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]
```

### Execution Commands:
1. **Build Docker Image:**
   ```bash
   docker build -t student-task-manager:latest .
   ```
2. **Run Docker Container with Port Mapping:**
   ```bash
   docker run -d -p 3000:3000 --name student-tasks-app student-task-manager:latest
   ```
3. **Verify Container Status:**
   ```bash
   docker ps
   docker logs student-tasks-app
   ```

---

## 7. Cloud Deployment on Render

1. Push code to GitHub:
   ```bash
   git remote add origin https://github.com/pawansuman/student-task-manager.git
   git push -u origin main
   ```
2. In Render dashboard:
   - Select **New Web Service** -> Connect GitHub repository.
   - Choose runtime **Docker**.
   - Select **Free** instance.
   - Click **Deploy Web Service**.
3. Render automatically executes `docker build` and launches the container at:
   `https://<your-service-name>.onrender.com`

---

## 8. Test Results & Verification

- **Automated Test Suite:** 6/6 tests passed successfully (`npm test`).
- **Healthcheck Verification:** Responded `200 OK` with JSON `{ "status": "healthy", "uptime": ... }`.
- **CRUD Operations:** Tested successfully locally and ready for live cloud operation.

---

## 9. Conclusion
The Student Task Management web application was successfully developed using Node.js and Express.js, tested locally, packaged into a Docker container with an optimized Alpine Linux base image, and configured for cloud deployment.
