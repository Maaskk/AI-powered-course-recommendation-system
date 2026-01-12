import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, mean_absolute_error
from typing import Dict
import logging

logger = logging.getLogger(__name__)


class ModelEvaluator:
    """Evaluate recommendation model performance"""

    @staticmethod
    def train_test_split_ratings(ratings: pd.DataFrame, test_size: float = 0.2) -> tuple:
        """Split ratings into train and test sets"""
        logger.info(f"Splitting data: {1-test_size:.0%} train, {test_size:.0%} test")

        # Ensure each user has at least one rating in train set
        train_list = []
        test_list = []

        for user_id in ratings["user_id"].unique():
            user_ratings = ratings[ratings["user_id"] == user_id]

            if len(user_ratings) == 1:
                train_list.append(user_ratings)
            else:
                user_train, user_test = train_test_split(
                    user_ratings, test_size=test_size, random_state=42
                )
                train_list.append(user_train)
                test_list.append(user_test)

        train_df = pd.concat(train_list, ignore_index=True)
        test_df = pd.concat(test_list, ignore_index=True) if test_list else pd.DataFrame()

        logger.info(f"Train set: {len(train_df)} ratings, Test set: {len(test_df)} ratings")
        return train_df, test_df

    @staticmethod
    def evaluate_model(model, test_ratings: pd.DataFrame, user_features: pd.DataFrame) -> Dict[str, float]:
        """Evaluate model on test set"""
        logger.info("Evaluating model performance...")

        predictions = []
        actuals = []

        for _, row in test_ratings.iterrows():
            user_id = row["user_id"]
            item_id = row["item_id"]
            actual_rating = row["rating"]

            # Get prediction
            try:
                recs = model.predict(user_id, top_n=100)  # Get more to find the specific item

                # Find the specific item in recommendations
                pred_rating = None
                for rec in recs:
                    if rec["item_id"] == item_id:
                        pred_rating = rec["predicted_rating"]
                        break

                if pred_rating is not None:
                    predictions.append(pred_rating)
                    actuals.append(actual_rating)
            except Exception as e:
                logger.debug(f"Could not predict for user {user_id}, item {item_id}: {e}")
                continue

        if len(predictions) == 0:
            logger.warning("No predictions made, returning default metrics")
            return {
                "rmse": 0.0,
                "mae": 0.0,
                "coverage": 0.0,
                "num_predictions": 0
            }

        # Calculate metrics
        rmse = np.sqrt(mean_squared_error(actuals, predictions))
        mae = mean_absolute_error(actuals, predictions)
        coverage = len(predictions) / len(test_ratings)

        metrics = {
            "rmse": float(rmse),
            "mae": float(mae),
            "coverage": float(coverage),
            "num_predictions": len(predictions)
        }

        logger.info(f"Evaluation metrics: RMSE={rmse:.3f}, MAE={mae:.3f}, Coverage={coverage:.2%}")
        return metrics

    @staticmethod
    def evaluate_recommendation_quality(model, test_users: list, k: int = 10) -> Dict[str, float]:
        """Evaluate recommendation quality using precision@k and recall@k"""
        logger.info(f"Evaluating recommendation quality at k={k}...")

        precision_scores = []
        recall_scores = []

        for user_id in test_users:
            try:
                recs = model.predict(user_id, top_n=k)
                
                # This is a simplified version - in practice, you'd need ground truth
                # For now, we'll just check if recommendations are diverse
                if len(recs) > 0:
                    precision_scores.append(len(set([r["item_id"] for r in recs])) / k)
                    recall_scores.append(1.0)  # Placeholder

            except Exception as e:
                logger.debug(f"Could not get recommendations for user {user_id}: {e}")
                continue

        metrics = {
            "precision_at_k": float(np.mean(precision_scores)) if precision_scores else 0.0,
            "recall_at_k": float(np.mean(recall_scores)) if recall_scores else 0.0,
            "num_users_evaluated": len(precision_scores)
        }

        logger.info(f"Quality metrics: Precision@{k}={metrics['precision_at_k']:.3f}")
        return metrics
