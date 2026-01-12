# Deployment Guide

This guide will help you deploy the Academic Recommendation System on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 18+** - [Download](https://nodejs.org/)
- **Python 3.9+** - [Download](https://www.python.org/downloads/)
- **npm** or **yarn** - Comes with Node.js

## Step 1: Clone or Download the Project

If you received the project as a ZIP file:
```bash
unzip academic-recommendation-system.zip
cd academic-recommendation-system
```

## Step 2: Prepare Your Data

Create a `data` folder in the project root with the following structure:

```
data/
├── itm-rec/
│   ├── users.csv
│   ├── items.csv
│   └── ratings.csv
├── student_performance/
│   └── student_data.csv
├── KT2/
├── KT3/
└── KT4/
```

Copy your dataset files into the appropriate folders.

## Step 3: Install Python Dependencies

From the project root directory:

```bash
pip install -r requirements.txt
```

If you encounter permission errors, use:
```bash
pip install --user -r requirements.txt
```

## Step 4: Clean Data and Train Models

Run the training pipeline:

```bash
python scripts/train_model.py
```

This process will:
- Clean all datasets
- Perform feature engineering
- Train the collaborative filtering model
- Train the performance prediction model
- Save models to the `results/` folder
- Generate evaluation metrics

**Expected output:**
```
==================================================
ACADEMIC RECOMMENDATION SYSTEM - TRAINING PIPELINE
==================================================

[STEP 1/4] Cleaning data...
Cleaning ITM-Rec users...
Cleaned users saved to data/cleaned/users_cleaned.csv
...

[STEP 4/4] Training Performance Predictor...
Performance predictor model saved!

==================================================
TRAINING COMPLETE!
==================================================
```

## Step 5: Start the ML Prediction API

In a new terminal window, start the Flask API:

```bash
python scripts/predict_api.py
```

The API should start on `http://localhost:5000`

**Expected output:**
```
Loaded collaborative filter model
Loaded performance predictor model
Starting ML Prediction API on port 5000...
 * Running on http://0.0.0.0:5000
```

**Keep this terminal running.**

## Step 6: Install and Start Backend

In a new terminal window:

```bash
cd backend
npm install
```

Wait for dependencies to install, then start the backend:

```bash
npm run start:dev
```

The backend should start on `http://localhost:3000`

**Expected output:**
```
Backend server running on http://localhost:3000
API available at http://localhost:3000/api
```

**Keep this terminal running.**

## Step 7: Install and Start Frontend

In a new terminal window:

```bash
cd frontend
npm install
```

Wait for dependencies to install, then start the frontend:

```bash
npm run dev
```

The frontend should start on `http://localhost:5173`

**Expected output:**
```
  VITE v5.0.8  ready in 532 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

## Step 8: Access the Application

Open your browser and navigate to:

**http://localhost:5173**

You should see the Academic Recommendation System dashboard.

## Verification Checklist

Verify everything is working:

1. **ML Status Indicator** - Green dot in top-right corner of navigation
2. **Dashboard** - Shows statistics and charts
3. **Students Page** - Can add new students
4. **Generate Recommendations** - Click "Recommend" button for a student
5. **Analytics Page** - Shows distributions and item popularity

## Troubleshooting

### ML Service Shows Red Dot

**Problem:** ML service is not running or unreachable

**Solutions:**
- Verify Python API is running on port 5000
- Check terminal for Flask errors
- Ensure models were trained successfully (check `results/` folder)

### Backend Connection Errors

**Problem:** Frontend cannot connect to backend

**Solutions:**
- Verify backend is running on port 3000
- Check CORS settings in `backend/src/main.ts`
- Check browser console for specific errors

### No Data in Dashboard

**Problem:** Dashboard shows zeros or "No data available"

**Solutions:**
- Add students through the Students page
- Generate recommendations for students
- Wait a moment for data to populate

### Model Training Fails

**Problem:** `train_model.py` throws errors

**Solutions:**
- Verify data files exist in correct folders
- Check CSV files are not corrupted
- Ensure all Python dependencies are installed
- Check Python version is 3.9+

### Port Already in Use

**Problem:** Error: "Port 3000 (or 5000, 5173) is already in use"

**Solutions:**
- Find and kill the process using that port
- Or change the port in configuration:
  - Backend: Change `PORT` in `backend/src/main.ts`
  - Frontend: Change port in `frontend/vite.config.ts`
  - ML API: Change port in `scripts/predict_api.py`

## Production Deployment

For production deployment:

1. **Set Environment Variables:**
   ```bash
   NODE_ENV=production
   ML_API_URL=<your-ml-api-url>
   ```

2. **Build Frontend:**
   ```bash
   cd frontend
   npm run build
   ```

3. **Build Backend:**
   ```bash
   cd backend
   npm run build
   npm run start:prod
   ```

4. **Use a Production WSGI Server for Python:**
   ```bash
   pip install gunicorn
   gunicorn -w 4 -b 0.0.0.0:5000 scripts.predict_api:app
   ```

5. **Setup Reverse Proxy** (nginx/Apache)

6. **Use PostgreSQL instead of SQLite** for better performance

## Support

If you encounter issues not covered in this guide:

1. Check the logs in each terminal window
2. Review the README.md for additional information
3. Check the `docs/` folder for detailed documentation
