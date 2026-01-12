import pandas as pd
import numpy as np
from pathlib import Path
from typing import Tuple, Dict
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class DataLoader:
    """Load and validate all datasets"""

    def __init__(self, data_dir: str = "data"):
        self.data_dir = Path(data_dir)

    def load_itm_rec(self) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
        """Load ITM-Rec dataset (users, items, ratings)"""
        logger.info("Loading ITM-Rec dataset...")

        users_path = self.data_dir / "itm-rec" / "users.csv"
        items_path = self.data_dir / "itm-rec" / "items.csv"
        ratings_path = self.data_dir / "itm-rec" / "ratings.csv"

        try:
            users = pd.read_csv(users_path)
            items = pd.read_csv(items_path)
            ratings = pd.read_csv(ratings_path)

            # Normalize column names: map actual CSV headers to expected names
            # Users: UserID -> user_id
            if "UserID" in users.columns:
                users = users.rename(columns={"UserID": "user_id"})
            
            # Items: Item -> item_id, Title -> title
            if "Item" in items.columns:
                items = items.rename(columns={"Item": "item_id"})
            if "Title" in items.columns:
                items = items.rename(columns={"Title": "title"})
            
            # Ratings: UserID -> user_id, Item -> item_id, Rating -> rating
            if "UserID" in ratings.columns:
                ratings = ratings.rename(columns={"UserID": "user_id"})
            if "Item" in ratings.columns:
                ratings = ratings.rename(columns={"Item": "item_id"})
            if "Rating" in ratings.columns:
                ratings = ratings.rename(columns={"Rating": "rating"})

            logger.info(f"Loaded ITM-Rec: {len(users)} users, {len(items)} items, {len(ratings)} ratings")
            return users, items, ratings
        except Exception as e:
            logger.error(f"Error loading ITM-Rec: {e}")
            raise

    def load_coursera_reviews(self) -> pd.DataFrame:
        """Load Coursera reviews dataset"""
        logger.info("Loading Coursera reviews...")

        # Try common file names
        possible_paths = [
            self.data_dir / "coursera_reviews.csv",
            self.data_dir / "coursera" / "reviews.csv",
            self.data_dir / "coursera" / "coursera_reviews.csv",
        ]

        for path in possible_paths:
            if path.exists():
                try:
                    reviews = pd.read_csv(path)
                    logger.info(f"Loaded Coursera reviews: {len(reviews)} reviews")
                    return reviews
                except Exception as e:
                    logger.error(f"Error loading Coursera reviews from {path}: {e}")
                    continue

        logger.warning("Coursera reviews not found, continuing without them")
        return pd.DataFrame()

    def validate_datasets(self, users: pd.DataFrame, items: pd.DataFrame, ratings: pd.DataFrame) -> bool:
        """Validate dataset integrity"""
        required_user_cols = ["user_id"]
        required_item_cols = ["item_id", "title"]
        required_rating_cols = ["user_id", "item_id", "rating"]

        errors = []

        if not all(col in users.columns for col in required_user_cols):
            errors.append(f"Users missing columns: {required_user_cols}")

        if not all(col in items.columns for col in required_item_cols):
            errors.append(f"Items missing columns: {required_item_cols}")

        if not all(col in ratings.columns for col in required_rating_cols):
            errors.append(f"Ratings missing columns: {required_rating_cols}")

        if errors:
            for error in errors:
                logger.error(error)
            return False

        logger.info("Dataset validation passed")
        return True
