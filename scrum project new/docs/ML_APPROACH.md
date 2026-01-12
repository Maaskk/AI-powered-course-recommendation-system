# Machine Learning Approach

## Overview

This system uses a **hybrid recommendation approach** combining collaborative filtering with student performance prediction.

## Models

### 1. Collaborative Filtering Recommender

**Algorithm**: Item-based Collaborative Filtering using Cosine Similarity

**Data Source**: ITM-Rec dataset (users.csv, items.csv, ratings.csv)

**Features**:
- Multi-criteria ratings (Rating, App, Data, Ease, Class)
- User demographics (Gender, Age, Married)
- Context (Semester, Lockdown)

**Process**:
1. Build user-item rating matrix
2. Calculate item-item similarity matrix
3. Generate recommendations based on similar items the user rated highly
4. Apply demographic and context filters

### 2. Student Performance Predictor

**Algorithm**: Random Forest Classifier

**Data Source**: Student Performance dataset

**Features**:
- Demographics (Age, Gender, Parental Education)
- Academic (Attendance, Previous Grades, Study Time)
- Behavioral (Absences, Participation)

**Purpose**:
- Predict student success likelihood
- Weight recommendations based on predicted performance
- Identify at-risk students

### 3. Hybrid Approach

**Combination Strategy**:
```python
final_score = (0.7 * collaborative_score) + (0.3 * performance_weight)
```

**Benefits**:
- Personalized recommendations
- Context-aware suggestions
- Performance-based filtering

## Data Cleaning Pipeline

### Phase 1: Initial Cleaning
- Remove duplicates
- Handle missing values (mean imputation for numerical, mode for categorical)
- Remove outliers using IQR method
- Standardize column names

### Phase 2: Feature Engineering
- Create interaction features
- Encode categorical variables (one-hot encoding)
- Normalize numerical features (StandardScaler)
- Create derived features (average ratings, difficulty score)

### Phase 3: Data Integration
- Merge datasets on common keys (user_id, item_id)
- Align timestamps
- Create unified feature matrix

### Phase 4: Validation
- Check data types
- Verify no missing values in critical columns
- Validate ranges and distributions
- Generate data quality report

## Evaluation Metrics

### Recommendation Quality
- **Precision@K**: Accuracy of top-K recommendations
- **Recall@K**: Coverage of relevant items in top-K
- **NDCG**: Normalized Discounted Cumulative Gain
- **MAP**: Mean Average Precision

### Performance Prediction
- **Accuracy**: Overall prediction accuracy
- **Precision/Recall**: Per-class metrics
- **F1-Score**: Harmonic mean
- **AUC-ROC**: Area under ROC curve

## Model Training

### Training Split
- 80% training, 20% testing
- Stratified split to maintain class balance

### Hyperparameters
- Collaborative Filter: similarity_threshold=0.3, n_neighbors=20
- Random Forest: n_estimators=100, max_depth=10, min_samples_split=5

### Validation
- 5-fold cross-validation
- Grid search for optimal hyperparameters
