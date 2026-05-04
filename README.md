# Campus Event Scheduler - Cloud Setup

This system is built with a Node.js backend and a React (HTML) frontend. It is optimized for Render and Aiven PostgreSQL.

## 🚀 Deployment Instructions

### 1. GitHub
1.  Initialize a git repo: `git init`
2.  Add files: `git add .`
3.  Commit: `git commit -m "Initial cloud build"`
4.  Push to your GitHub repository.

### 2. Aiven (PostgreSQL)
1.  Create a PostgreSQL service on Aiven.
2.  Copy the **Service URI**.

### 3. Render
1.  Create a new **Web Service** on Render and link your GitHub repo.
2.  **Runtime**: `Node`
3.  **Build Command**: `npm install && npm run build`
4.  **Start Command**: `node server.js`
5.  **Environment Variables**:
    *   `DATABASE_URL`: (Paste your Aiven URI here)
    *   `NODE_ENV`: `production`

## 🔐 Master Credentials
- **Email**: `admin@campus.edu`
- **Password**: `admin123`

## 🛡️ CIA Triad Compliance
- **Confidentiality**: JWT & Role-based sidebar access.
- **Integrity**: Immutable audit logging in PostgreSQL.
- **Availability**: Global killswitch managed via the System Health node.
