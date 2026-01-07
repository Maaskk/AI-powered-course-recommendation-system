# 🚀 Quick Start with Docker

**The fastest way to run this project on any computer!**

## Prerequisites

1. Install Docker Desktop:
   - **Windows/Mac**: https://www.docker.com/products/docker-desktop/
   - **Linux**: https://docs.docker.com/engine/install/

2. Make sure Docker Desktop is running (you'll see the Docker icon in your taskbar/menu bar)

## Installation (3 Steps)

### Step 1: Download the Project

```bash
git clone https://github.com/Maaskk/peptide-toxicity-prediction.git
cd peptide-toxicity-prediction
```

Or download ZIP from GitHub and extract it.

### Step 2: Start with Docker

**Option A - One Command (Easy):**
```bash
docker-compose up --build
```

**Option B - Use Quick Start Script:**
```bash
# macOS/Linux:
./docker-start.sh

# Windows:
docker-start.bat
```

### Step 3: Open in Browser

Wait for the message "Application is ready!" then visit:
- **Web App**: http://localhost:3000
- **API**: http://localhost:3001

## Usage

### Test a Prediction

1. Go to http://localhost:3000
2. Click "Predict"
3. Enter a peptide sequence (e.g., `GIGAVLKVLTTGLPALISWIKRKRQQ`)
4. Click "Predict Toxicity"
5. View results!

### Train Your Own Models

```bash
# Train with your data
docker-compose run --rm peptide-app python3 scripts/train_pipeline.py
```

### Stop the Application

```bash
docker-compose down
```

## Common Commands

```bash
# Start application
docker-compose up -d

# View logs
docker-compose logs -f

# Stop application
docker-compose down

# Restart
docker-compose restart

# Rebuild after code changes
docker-compose up --build
```

## Troubleshooting

### Port Already in Use
If ports 3000 or 3001 are already used:
1. Find what's using them: `lsof -i :3000` (Mac/Linux) or `netstat -ano | findstr :3000` (Windows)
2. Stop that service
3. Or edit `docker-compose.yml` to use different ports

### Docker Not Starting
- Make sure Docker Desktop is running
- Restart Docker Desktop
- Check Docker Desktop settings (increase memory to 4GB+ if needed)

### Application Not Loading
- Wait 30-60 seconds after "docker-compose up" for full startup
- Check logs: `docker-compose logs`
- Try rebuilding: `docker-compose down && docker-compose up --build`

## Need More Help?

📖 **Full Guide**: [DOCKER_GUIDE.md](DOCKER_GUIDE.md) - Complete documentation with all details

🐛 **Issues**: Check GitHub Issues or create a new one

---

**That's it! Enjoy predicting peptide toxicity! 🧬**

