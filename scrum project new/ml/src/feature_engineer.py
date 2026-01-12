import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)


class FeatureEngineer:
    """Create features for ML models"""

    @staticmethod
    def create_user_features(users: pd.DataFrame, ratings: pd.DataFrame) -> pd.DataFrame:
        """Create user profile features"""
        logger.info("Creating user features...")

        user_features = users.copy()

        # Rating statistics per user
        user_stats = (
            ratings.groupby("user_id")
            .agg(
                {
                    "rating": ["mean", "std", "count"],
                }
            )
            .reset_index()
        )
        user_stats.columns = ["user_id", "avg_rating", "rating_std", "num_ratings"]
        user_stats["rating_std"] = user_stats["rating_std"].fillna(0)

        user_features = user_features.merge(user_stats, on="user_id", how="left")

        # Fill missing values
        user_features["avg_rating"] = user_features["avg_rating"].fillna(3.0)
        user_features["rating_std"] = user_features["rating_std"].fillna(0)
        user_features["num_ratings"] = user_features["num_ratings"].fillna(0)

        logger.info(f"Created features for {len(user_features)} users")
        return user_features

    @staticmethod
    def create_item_features(items: pd.DataFrame, ratings: pd.DataFrame, coursera_reviews: pd.DataFrame = None) -> pd.DataFrame:
        """Create item/course features"""
        logger.info("Creating item features...")

        item_features = items.copy()

        # Rating statistics per item from ITM-Rec
        item_stats = (
            ratings.groupby("item_id")
            .agg(
                {
                    "rating": ["mean", "std", "count"],
                }
            )
            .reset_index()
        )
        item_stats.columns = ["item_id", "avg_rating", "rating_std", "num_ratings"]
        item_stats["rating_std"] = item_stats["rating_std"].fillna(0)

        item_features = item_features.merge(item_stats, on="item_id", how="left")

        # Add popularity score
        item_features["popularity_score"] = (
            item_features["num_ratings"] * item_features["avg_rating"]
        ).fillna(0)

        # Enhance with Coursera data if available
        if coursera_reviews is not None and not coursera_reviews.empty:
            logger.info("Enhancing with Coursera reviews...")
            if "course_name" in coursera_reviews.columns and "rating" in coursera_reviews.columns:
                coursera_stats = (
                    coursera_reviews.groupby("course_name")
                    .agg({"rating": ["mean", "count"]})
                    .reset_index()
                )
                coursera_stats.columns = ["title", "coursera_avg_rating", "coursera_review_count"]

                # Merge on title (fuzzy matching could be added here)
                item_features = item_features.merge(coursera_stats, on="title", how="left")

                # Create combined rating score
                item_features["coursera_avg_rating"] = item_features["coursera_avg_rating"].fillna(0)
                item_features["coursera_review_count"] = item_features["coursera_review_count"].fillna(0)

                # Weighted average of both sources
                item_features["combined_rating"] = np.where(
                    item_features["coursera_review_count"] > 0,
                    (item_features["avg_rating"] * item_features["num_ratings"] + 
                     item_features["coursera_avg_rating"] * item_features["coursera_review_count"]) / 
                    (item_features["num_ratings"] + item_features["coursera_review_count"]),
                    item_features["avg_rating"]
                )
            else:
                item_features["combined_rating"] = item_features["avg_rating"]
        else:
            item_features["combined_rating"] = item_features["avg_rating"]

        # Fill missing values
        item_features["avg_rating"] = item_features["avg_rating"].fillna(3.0)
        item_features["rating_std"] = item_features["rating_std"].fillna(0)
        item_features["num_ratings"] = item_features["num_ratings"].fillna(0)
        item_features["combined_rating"] = item_features["combined_rating"].fillna(3.0)

        logger.info(f"Created features for {len(item_features)} items")
        return item_features

    @staticmethod
    def create_interaction_features(ratings: pd.DataFrame, user_features: pd.DataFrame, item_features: pd.DataFrame) -> pd.DataFrame:
        """Create user-item interaction features"""
        logger.info("Creating interaction features...")

        interactions = ratings.copy()

        # Merge user and item features
        interactions = interactions.merge(
            user_features[["user_id", "avg_rating", "num_ratings"]],
            on="user_id",
            how="left",
            suffixes=("", "_user")
        )

        interactions = interactions.merge(
            item_features[["item_id", "avg_rating", "num_ratings", "combined_rating"]],
            on="item_id",
            how="left",
            suffixes=("", "_item")
        )

        # Rename columns for clarity
        interactions = interactions.rename(columns={
            "avg_rating": "user_avg_rating",
            "num_ratings": "user_num_ratings",
            "avg_rating_item": "item_avg_rating",
            "num_ratings_item": "item_num_ratings"
        })

        # Create deviation features
        interactions["rating_deviation"] = interactions["rating"] - interactions["user_avg_rating"]
        interactions["item_popularity"] = np.log1p(interactions["item_num_ratings"])

        logger.info(f"Created {len(interactions)} interaction records")
        return interactions
