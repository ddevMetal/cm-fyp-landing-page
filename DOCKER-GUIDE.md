# 🐳 DOCKER DEPLOYMENT GUIDE
**Project:** Wise Fitness Landing Page  
**Date:** July 30, 2025  
**Version:** Safe Point 1  

## 🚀 QUICK START

### Build the Docker Image:
```powershell
cd "c:\FYP\cm-fyp-landing-page"
docker build -t wise-fitness-landing .
```

### Run Locally:
```powershell
docker run -d -p 8080:80 --name wise-fitness wise-fitness-landing
```

**Access:** http://localhost:8080

### Stop Container:
```powershell
docker stop wise-fitness
docker rm wise-fitness
```

---

## 📦 DOCKER SETUP DETAILS

### Files Created:
- **`Dockerfile`** - Multi-stage build with nginx
- **`nginx.conf`** - Optimized web server configuration  
- **`.dockerignore`** - Excludes unnecessary files from build

### Container Features:
- ✅ **Lightweight:** Alpine Linux base (~5MB)
- ✅ **Production Ready:** Nginx web server
- ✅ **Optimized:** Gzip compression, caching headers
- ✅ **Secure:** Security headers, file access protection
- ✅ **Health Checks:** Built-in container health monitoring
- ✅ **Render Compatible:** Ready for cloud deployment

---

## 🔄 UPDATING YOUR DOCKER IMAGE

### When you make changes to your code:

1. **Rebuild the image:**
```powershell
docker build -t wise-fitness-landing:v2 .
```

2. **Stop old container:**
```powershell
docker stop wise-fitness
docker rm wise-fitness
```

3. **Run new version:**
```powershell
docker run -d -p 8080:80 --name wise-fitness wise-fitness-landing:v2
```

### Or use this one-liner update script:
```powershell
docker stop wise-fitness; docker rm wise-fitness; docker build -t wise-fitness-landing .; docker run -d -p 8080:80 --name wise-fitness wise-fitness-landing
```

---

## 🌐 RENDER DEPLOYMENT

### 1. Push to GitHub:
```powershell
git add .
git commit -m "🐳 Add Docker configuration for deployment"
git push origin main
```

### 2. Create Render Web Service:
- Go to [render.com](https://render.com)
- Connect your GitHub repository: `cm-fyp-landing-page`
- Choose "Web Service"
- Select "Docker" as environment

### 3. Render Configuration:
```yaml
# Render will auto-detect these settings:
Build Command: docker build -t wise-fitness .
Start Command: (auto-detected from Dockerfile)
Port: 80
Health Check Path: /health
```

### 4. Environment Variables (if needed):
```
NODE_ENV=production
PORT=80
```

---

## 🔧 DOCKER COMMANDS REFERENCE

### Build & Run:
```powershell
# Build image
docker build -t wise-fitness-landing .

# Run container (detached mode)
docker run -d -p 8080:80 --name wise-fitness wise-fitness-landing

# Run container (interactive mode for debugging)
docker run -it -p 8080:80 wise-fitness-landing

# Run with environment variables
docker run -d -p 8080:80 -e NODE_ENV=production wise-fitness-landing
```

### Management:
```powershell
# List running containers
docker ps

# View container logs
docker logs wise-fitness

# Access container shell
docker exec -it wise-fitness sh

# View container resource usage
docker stats wise-fitness

# Remove container
docker stop wise-fitness && docker rm wise-fitness

# Remove image
docker rmi wise-fitness-landing
```

### Cleanup:
```powershell
# Remove all stopped containers
docker container prune

# Remove all unused images
docker image prune

# Remove all unused volumes
docker volume prune

# Clean everything
docker system prune -a
```

---

## 📊 DOCKER IMAGE INFO

### Expected Image Size: ~15-20MB
- **Base:** nginx:alpine (~5MB)
- **Your Files:** ~10-15MB (HTML, CSS, JS)
- **Configuration:** <1MB

### Container Performance:
- **Memory Usage:** ~10-20MB
- **CPU Usage:** Very low (static files)
- **Startup Time:** 1-3 seconds
- **Response Time:** <50ms

---

## 🛠️ TROUBLESHOOTING

### Common Issues:

**1. Build fails:**
```powershell
# Check Docker is running
docker version

# Build with verbose output
docker build --no-cache -t wise-fitness-landing .
```

**2. Container won't start:**
```powershell
# Check logs
docker logs wise-fitness

# Run interactively to debug
docker run -it wise-fitness-landing sh
```

**3. Can't access website:**
```powershell
# Check container is running
docker ps

# Verify port mapping
docker port wise-fitness

# Test health endpoint
curl http://localhost:8080/health
```

**4. Files not updating:**
```powershell
# Rebuild without cache
docker build --no-cache -t wise-fitness-landing .

# Make sure you're copying the right files
docker run -it wise-fitness-landing ls -la
```

---

## 🚀 DEPLOYMENT WORKFLOWS

### Development Workflow:
1. Make changes to your code
2. Test locally: `docker build -t test . && docker run -p 8080:80 test`
3. If good, commit: `git add . && git commit -m "Update"`
4. Push: `git push origin main`
5. Render auto-deploys from GitHub

### Production Workflow:
1. Create feature branch: `git checkout -b feature-name`
2. Make changes and test with Docker
3. Merge to main: `git checkout main && git merge feature-name`
4. Push: `git push origin main`
5. Render deploys automatically

---

## 📝 RENDER SPECIFIC NOTES

### Automatic Deployments:
- Render watches your `main` branch
- Any push to `main` triggers automatic rebuild
- Build time: ~2-5 minutes
- Zero-downtime deployments

### Custom Domain:
- Add your domain in Render dashboard
- Update DNS to point to Render
- SSL certificates are automatic and free

### Scaling:
- Render handles scaling automatically
- No manual container management needed
- Built-in CDN for static assets

---

**✅ Your Docker setup is now ready for development and production deployment on Render!**

*Next: Push to GitHub and set up Render deployment*
