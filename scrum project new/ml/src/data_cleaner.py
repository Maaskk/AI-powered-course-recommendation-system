import pandas as pd
import numpy as np
from typing import Tuple
import logging

logger = logging.getLogger(__name__)


class DataCleaner:
    """Clean and preprocess all datasets"""

    @staticmethod
    def clean_itm_rec(users: pd.DataFrame, items: pd.DataFrame, ratings: pd.DataFrame) -> Tuple[
        pd.DataFrame, pd.DataFrame, pd.DataFrame
    ]:
        """Clean ITM-Rec datasets"""
        logger.info("Cleaning ITM-Rec data...")

        # Clean users
        users_clean = users.copy()
        users_clean = users_clean.drop_duplicates(subset=["user_id"])
        users_clean["user_id"] = users_clean["user_id"].astype(str)

        # Clean items
        items_clean = items.copy()
        items_clean = items_clean.drop_duplicates(subset=["item_id"])
        items_clean["item_id"] = items_clean["item_id"].astype(str)

        # Fill missing item descriptions
        if "description" in items_clean.columns:
            items_clean["description"] = items_clean["description"].fillna(items_clean["title"])

        # Clean ratings
        ratings_clean = ratings.copy()

        # Remove duplicates (same user rating same item multiple times - keep last)
        ratings_clean = ratings_clean.drop_duplicates(subset=["user_id", "item_id"], keep="last")

        # Convert IDs to string
        ratings_clean["user_id"] = ratings_clean["user_id"].astype(str)
        ratings_clean["item_id"] = ratings_clean["item_id"].astype(str)

        # Handle rating column
        if "rating" in ratings_clean.columns:
            # Remove invalid ratings
            ratings_clean = ratings_clean[ratings_clean["rating"].notna()]
            ratings_clean = ratings_clean[ratings_clean["rating"] > 0]

            # Clip outliers (assuming 1-5 scale)
            ratings_clean["rating"] = ratings_clean["rating"].clip(1, 5)

        # Remove orphaned records (users/items not in master tables)
        ratings_clean = ratings_clean[ratings_clean["user_id"].isin(users_clean["user_id"])]
        ratings_clean = ratings_clean[ratings_clean["item_id"].isin(items_clean["item_id"])]

        logger.info(
            f"Cleaned ITM-Rec: {len(users_clean)} users, {len(items_clean)} items, {len(ratings_clean)} ratings"
        )

        return users_clean, items_clean, ratings_clean

    @staticmethod
    def clean_coursera_reviews(reviews: pd.DataFrame) -> pd.DataFrame:
        """Clean Coursera reviews"""
        if reviews.empty:
            return reviews

        logger.info("Cleaning Coursera reviews...")
        reviews_clean = reviews.copy()

        # Remove duplicates
        if "review_id" in reviews_clean.columns:
            reviews_clean = reviews_clean.drop_duplicates(subset=["review_id"])

        # Handle missing values in key columns
        if "rating" in reviews_clean.columns:
            reviews_clean = reviews_clean[reviews_clean["rating"].notna()]
            reviews_clean["rating"] = reviews_clean["rating"].clip(1, 5)

        if "course_name" in reviews_clean.columns:
            reviews_clean = reviews_clean[reviews_clean["course_name"].notna()]

        # Clean text fields
        text_cols = ["review_text", "course_name", "course_description"]
        for col in text_cols:
            if col in reviews_clean.columns:
                reviews_clean[col] = reviews_clean[col].fillna("")
                reviews_clean[col] = reviews_clean[col].str.strip()

        logger.info(f"Cleaned Coursera reviews: {len(reviews_clean)} reviews")
        return reviews_clean

    @staticmethod
    def remove_cold_start_issues(users: pd.DataFrame, items: pd.DataFrame, ratings: pd.DataFrame, min_ratings: int = 2) -> Tuple[
        pd.DataFrame, pd.DataFrame, pd.DataFrame
    ]:
        """Remove users and items with too few ratings"""
        logger.info(f"Removing cold start issues (min_ratings={min_ratings})...")

        # Iteratively remove users/items with too few ratings
        for _ in range(5):  # Max 5 iterations
            user_counts = ratings["user_id"].value_counts()
            item_counts = ratings["item_id"].value_counts()

            valid_users = user_counts[user_counts >= min_ratings].index
            valid_items = item_counts[item_counts >= min_ratings].index

            ratings = ratings[ratings["user_id"].isin(valid_users)]
            ratings = ratings[ratings["item_id"].isin(valid_items)]

            if len(valid_users) == ratings["user_id"].nunique() and len(valid_items) == ratings["item_id"].nunique():
                break

        # Filter users and items tables
        users = users[users["user_id"].isin(ratings["user_id"].unique())]
        items = items[items["item_id"].isin(ratings["item_id"].unique())]

        logger.info(
            f"After cold start removal: {len(users)} users, {len(items)} items, {len(ratings)} ratings"
        )

        return users, items, ratings
