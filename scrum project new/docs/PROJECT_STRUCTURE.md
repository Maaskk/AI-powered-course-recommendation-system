# Project Structure Documentation

## Overview

This document outlines the complete structure of the Academic Recommendation System project.

## Directory Structure

### `/frontend` - Vue 3 Application

```
frontend/
├── src/
│   ├── components/        # Reusable Vue components
│   │   ├── StudentForm.vue
│   │   ├── RecommendationCard.vue
│   │   ├── PerformanceChart.vue
│   │   └── DataTable.vue
│   ├── views/             # Page components
│   │   ├── Dashboard.vue
│   │   ├── StudentProfile.vue
│   │   ├── Recommendations.vue
│   │   └── Analytics.vue
│   ├── services/          # API clients
│   │   └── api.ts
│   ├── stores/            # Pinia stores
│   │   └── student.ts
│   ├── types/             # TypeScript types
│   │   └── index.ts
│   ├── App.vue
│   └── main.ts
├── public/
├── package.json
└── vite.config.ts
```

### `/backend` - NestJS Application

```
backend/
├── src/
│   ├── modules/
│   │   ├── students/
│   │   │   ├── students.controller.ts
│   │   │   ├── students.service.ts
│   │   │   ├── students.entity.ts
│   │   │   └── students.module.ts
│   │   ├── recommendations/
│   │   │   ├── recommendations.controller.ts
│   │   │   ├── recommendations.service.ts
│   │   │   ├── recommendations.entity.ts
│   │   │   └── recommendations.module.ts
│   │   ├── analytics/
│   │   │   ├── analytics.controller.ts
│   │   │   ├── analytics.service.ts
│   │   │   └── analytics.module.ts
│   │   └── ml/
│   │       ├── ml.service.ts            # Python bridge
│   │       └── ml.module.ts
│   ├── database/
│   │   └── database.module.ts
│   ├── common/
│   │   ├── dto/
│   │   └── interfaces/
│   ├── app.module.ts
│   └── main.ts
├── package.json
└── tsconfig.json
```

### `/scripts` - Python ML Scripts

```
scripts/
├── clean_data.py          # Data cleaning & preprocessing
├── train_model.py         # Model training pipeline
├── predict_api.py         # Flask API for predictions
└── evaluate_model.py      # Model evaluation
```

### `/src` - Python Utilities

```
src/
├── data_loader.py         # Load and merge datasets
├── feature_engineer.py    # Feature extraction
├── model_trainer.py       # Training logic
└── evaluator.py           # Evaluation metrics
```

### `/results` - Model Artifacts

```
results/
├── collaborative_filter.pkl
├── performance_predictor.pkl
├── scaler.pkl
├── metrics.json
└── evaluation_report.txt
```

### `/data` - Datasets (User Provided)

```
data/
├── itm-rec/
│   ├── users.csv          # Student demographics
│   ├── items.csv          # Course/topic catalog
│   └── ratings.csv        # Multi-criteria ratings
├── student_performance/
│   └── student_data.csv   # Academic performance data
├── KT2/
├── KT3/
└── KT4/
```

## Data Flow

1. **Data Ingestion**: Python scripts load CSVs from `/data`
2. **Preprocessing**: Clean, normalize, handle missing values
3. **Training**: Train models, save to `/results` as .pkl files
4. **Prediction**: NestJS spawns Python process, loads models, returns predictions
5. **Storage**: Save results to SQLite database
6. **Display**: Frontend fetches from API, renders visualizations

## Communication Flow

```
Frontend (Vue 3)
    ↓ HTTP Request
Backend (NestJS)
    ↓ Spawn Child Process
Python ML Script
    ↓ Load Model
Trained Model (.pkl)
    ↓ Prediction
Python Returns JSON
    ↓
Backend Processes
    ↓ Store in SQLite
    ↓ HTTP Response
Frontend Updates UI
```

## Database Schema

### Students Table
- id, name, age, gender, major, gpa, semester, created_at

### Recommendations Table
- id, student_id, item_id, score, timestamp, model_version

### Items Table
- id, title, description, category, url

### Model_Metrics Table
- id, model_name, accuracy, precision, recall, f1_score, timestamp
