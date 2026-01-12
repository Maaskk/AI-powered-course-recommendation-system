#!/usr/bin/env python3
"""
Train the course recommendation model using ITM-Rec and Coursera datasets
"""

import sys
from pathlib import Path
import logging
import json

# Force unbuffered output for real-time progress
sys.stdout.reconfigure(line_buffering=True)
sys.stderr.reconfigure(line_buffering=True)

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from data_loader import DataLoader
from data_cleaner import DataCleaner
from feature_engineer import FeatureEngineer
from recommender_model import HybridRecommender
from evaluator import ModelEvaluator

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def main():
    """Main training pipeline"""
    logger.info("=" * 60)
    logger.info("COURSE RECOMMENDATION MODEL TRAINING")
    logger.info("=" * 60)

    # Create output directory
    output_dir = Path("models")
    output_dir.mkdir(exist_ok=True)

    # 1. Load Data
    loader = DataLoader(data_dir="../data")
    users, items, ratings = loader.load_itm_rec()
    coursera_reviews = loader.load_coursera_reviews()

    # 2. Validate Data
    if not loader.validate_datasets(users, items, ratings):
        logger.error("Dataset validation failed!")
        sys.exit(1)

    # 3. Clean Data
    cleaner = DataCleaner()
    users_clean, items_clean, ratings_clean = cleaner.clean_itm_rec(users, items, ratings)
    coursera_clean = cleaner.clean_coursera_reviews(coursera_reviews)

    # 4. Remove cold start issues
    users_clean, items_clean, ratings_clean = cleaner.remove_cold_start_issues(
        users_clean, items_clean, ratings_clean, min_ratings=2
    )

    # 5. Feature Engineering
    engineer = FeatureEngineer()
    user_features = engineer.create_user_features(users_clean, ratings_clean)
    item_features = engineer.create_item_features(items_clean, ratings_clean, coursera_clean)

    logger.info("=" * 60)
    logger.info("DATA SUMMARY")
    logger.info("=" * 60)
    logger.info(f"Users: {len(user_features)}")
    logger.info(f"Items: {len(item_features)}")
    logger.info(f"Ratings: {len(ratings_clean)}")
    logger.info(f"Sparsity: {(1 - len(ratings_clean) / (len(user_features) * len(item_features))) * 100:.2f}%")
    if not coursera_clean.empty:
        logger.info(f"Coursera reviews: {len(coursera_clean)}")
    logger.info("=" * 60)

    # 6. Train/Test Split
    evaluator = ModelEvaluator()
    train_ratings, test_ratings = evaluator.train_test_split_ratings(ratings_clean, test_size=0.2)

    # 7. Train Model
    logger.info("=" * 60)
    logger.info("TRAINING MODEL")
    logger.info("=" * 60)

    model = HybridRecommender()
    model.fit(train_ratings, user_features, item_features)

    # 8. Evaluate Model
    logger.info("=" * 60)
    logger.info("EVALUATING MODEL")
    logger.info("=" * 60)

    metrics = evaluator.evaluate_model(model, test_ratings, user_features)

    # Save metrics
    metrics_path = output_dir / "metrics.json"
    with open(metrics_path, "w") as f:
        json.dump(metrics, f, indent=2)
    logger.info(f"Metrics saved to {metrics_path}")

    # 9. Save Model
    model_path = output_dir / "recommender_model.pkl"
    model.save(str(model_path))

    # Save feature data
    user_features.to_pickle(output_dir / "user_features.pkl")
    item_features.to_pickle(output_dir / "item_features.pkl")
    logger.info("Feature data saved")

    logger.info("=" * 60)
    logger.info("TRAINING COMPLETE!")
    logger.info("=" * 60)
    logger.info(f"Model saved to: {model_path}")
    logger.info(f"Metrics: RMSE={metrics['rmse']:.3f}, MAE={metrics['mae']:.3f}, Coverage={metrics['coverage']:.2%}")


if __name__ == "__main__":
    main()
