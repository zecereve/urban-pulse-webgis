# Deployment Guide for AWS (Monolithic Approach)

This guide explains how to deploy the Urban Pulse Web-GIS application to AWS Elastic Beanstalk (recommended for students) or a generic VPS like AWS EC2.

## Pre-requisites
1. **GitHub Repository**: Ensure your code is pushed to GitHub.
2. **MongoDB Atlas**: Ensure your database is accessible from anywhere (Allow Access from Anywhere `0.0.0.0/0` in Network Access) for simplicity, or whitelist the AWS IP later.

## Approach: Monolithic Deployment
We will build the Frontend (React) and serve it using the Backend (Node.js). You will deploy only **one** server.

---

## Step 1: Prepare the Build locally

1. **Build Frontend**:
   Navigate to the `frontend` folder and run the build command.
   ```bash
   cd frontend
   npm install
   npm run build
   ```
   This creates a `dist` folder inside `frontend`.

2. **Verify Folder Structure**:
   Your backend `server.js` is already configured to look for `../frontend/dist`.
   Ensure your directory structure looks like this before deploying:
   ```
   root/
   ├── backend/
   │   ├── src/
   │   ├── package.json
   │   ├── server.js
   │   └── ...
   ├── frontend/
   │   ├── dist/  <-- The built files must be here
   │   └── ...
   ```

---

## Step 2: Choose Deployment Method

### Option A: AWS Elastic Beanstalk (Recommended)
AWS Elastic Beanstalk automates the setup of EC2 instances.

1. **Create Application**: Go to AWS Console -> Elastic Beanstalk -> Create Application.
2. **Platform**: Choose **Node.js**.
3. **Upload Code**: 
   - You need to zip your project. 
   - **Crucial**: Elastic Beanstalk usually expects `package.json` at the root. Since our `package.json` is in `backend/`, you might need to:
     - Use a specialized build script.
     - **OR SIMPLER**: Deploy just the `backend` folder, but **COPY** the `frontend/dist` folder INTO `backend/` before zipping.
     
   **Recommended Zip Structure for Upload:**
   ```
   archive.zip
   ├── package.json (from backend)
   ├── src/ (from backend)
   ├── uploads/ (create empty folder)
   └── frontend/
       └── dist/ (copy the built files here)
   ```
   *Note: If you move `frontend/dist` inside `backend`, update `server.js` path to `./frontend/dist` instead of `../frontend/dist`.*

4. **Environment Variables**:
   In Configuration -> Software, add:
   - `NODE_ENV` = `production`
   - `MONGO_URI` = `your_mongodb_connection_string`

### Option B: AWS EC2 (Manual VPS)
1. **Launch Instance**: select Ubuntu 20.04 or Amazon Linux 2 (t2.micro is free tier eligible).
2. **Security Group**: Allow TCP port 22 (SSH) and 5050 (or 80).
3. **Connect via SSH**:
   ```bash
   ssh -i key.pem ubuntu@your-ip
   ```
4. **Install Node.js**:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```
5. **Clone Repo**:
   ```bash
   git clone https://github.com/YOUR_USER/YOUR_REPO.git
   cd YOUR_REPO
   ```
6. **Build & Run**:
   ```bash
   # Build frontend
   cd frontend
   npm install
   npm run build
   
   # Run backend
   cd ../backend
   npm install
   export NODE_ENV=production
   node src/server.js
   ```
   (Use `pm2` to keep it running: `npm install -g pm2` -> `pm2 start src/server.js`)

## Step 3: Verification
Visit your public IP or Beanstalk domain. You should see the React app. Login should work.

---

## Important Note for `server.js` Path
If you deploy by zipping `backend` separately, remember that `path.join(__dirname, '../frontend/dist')` tries to go *up* one level.
- On EC2 (cloning full repo): It works perfectly.
- On Beanstalk (uploading zip): Ensure the folder structure matches or adjust the path.
