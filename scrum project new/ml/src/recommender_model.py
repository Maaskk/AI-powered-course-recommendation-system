import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from scipy.sparse import csr_matrix
from typing import List, Tuple, Dict
import joblib
import logging

logger = logging.getLogger(__name__)


class HybridRecommender:
    """Hybrid recommendation model combining collaborative filtering and content-based"""

    def __init__(self):
        self.user_item_matrix = None
        self.user_similarity = None
        self.item_similarity = None
        self.user_features = None
        self.item_features = None
        self.user_id_map = {}
        self.item_id_map = {}
        self.reverse_item_map = {}

    def fit(self, ratings: pd.DataFrame, user_features: pd.DataFrame, item_features: pd.DataFrame):
        """Train the hybrid recommender"""
        logger.info("Training hybrid recommender...")

        self.user_features = user_features.set_index("user_id")
        self.item_features = item_features.set_index("item_id")

        # Create user-item matrix
        unique_users = ratings["user_id"].unique()
        unique_items = ratings["item_id"].unique()

        self.user_id_map = {user_id: idx for idx, user_id in enumerate(unique_users)}
        self.item_id_map = {item_id: idx for idx, item_id in enumerate(unique_items)}
        self.reverse_item_map = {idx: item_id for item_id, idx in self.item_id_map.items()}

        # Build sparse matrix
        row = ratings["user_id"].map(self.user_id_map)
        col = ratings["item_id"].map(self.item_id_map)
        data = ratings["rating"].values

        self.user_item_matrix = csr_matrix(
            (data, (row, col)), shape=(len(unique_users), len(unique_items))
        )

        # Compute user similarity (collaborative filtering)
        logger.info("Computing user similarity...")
        logger.info(f"User-item matrix shape: {self.user_item_matrix.shape}")
        logger.info(f"Computing similarity for {len(unique_users)} users...")
        # Use sparse matrix for efficiency - compute only upper triangle and mirror
        self.user_similarity = cosine_similarity(self.user_item_matrix, dense_output=False)
        logger.info("User similarity computation complete")

        # Compute item similarity (content-based)
        logger.info("Computing item similarity...")
        logger.info(f"Computing similarity for {len(unique_items)} items...")
        # Use item features for content-based similarity
        item_feature_cols = ["avg_rating", "rating_std", "num_ratings", "popularity_score", "combined_rating"]
        available_cols = [col for col in item_feature_cols if col in item_features.columns]
        
        item_feature_matrix = item_features[available_cols].fillna(0).values
        
        # Normalize
        from sklearn.preprocessing import StandardScaler
        scaler = StandardScaler()
        item_feature_matrix_scaled = scaler.fit_transform(item_feature_matrix)
        
        self.item_similarity = cosine_similarity(item_feature_matrix_scaled)
        logger.info("Item similarity computation complete")

        logger.info("Training complete")

    def predict(self, user_id: str, top_n: int = 10, alpha: float = 0.7) -> List[Dict]:
        """Generate recommendations for a user"""
        
        if user_id not in self.user_id_map:
            logger.warning(f"User {user_id} not found, using popularity-based recommendations")
            return self._get_popular_items(top_n)

        user_idx = self.user_id_map[user_id]

        # Get user's rated items
        user_ratings = self.user_item_matrix[user_idx].toarray().flatten()
        rated_items = np.where(user_ratings > 0)[0]

        # Collaborative filtering scores
        cf_scores = self._collaborative_filtering_scores(user_idx, rated_items)

        # Content-based scores
        cb_scores = self._content_based_scores(rated_items)

        # Hybrid scores
        final_scores = alpha * cf_scores + (1 - alpha) * cb_scores

        # Remove already rated items
        final_scores[rated_items] = -np.inf

        # Get top N
        top_indices = np.argsort(final_scores)[::-1][:top_n]

        recommendations = []
        for idx in top_indices:
            item_id = self.reverse_item_map[idx]
            item_info = self.item_features.loc[item_id]

            recommendations.append({
                "item_id": item_id,
                "title": item_info.get("title", "Unknown"),
                "description": item_info.get("description", ""),
                "url": item_info.get("url", ""),
                "predicted_rating": float(final_scores[idx]),
                "avg_rating": float(item_info.get("combined_rating", item_info.get("avg_rating", 0))),
                "num_ratings": int(item_info.get("num_ratings", 0)),
                "confidence": float(min(final_scores[idx] / 5.0, 1.0))
            })

        return recommendations

    def _collaborative_filtering_scores(self, user_idx: int, rated_items: np.ndarray) -> np.ndarray:
        """Compute collaborative filtering scores"""
        if len(rated_items) == 0:
            return np.zeros(self.user_item_matrix.shape[1])

        # Find similar users
        user_similarities = self.user_similarity[user_idx].toarray().flatten()
        
        # Weighted average of similar users' ratings
        similar_users = np.argsort(user_similarities)[::-1][1:51]  # Top 50 similar users (excluding self)
        
        scores = np.zeros(self.user_item_matrix.shape[1])
        for similar_user in similar_users:
            similarity = user_similarities[similar_user]
            if similarity > 0:
                similar_user_ratings = self.user_item_matrix[similar_user].toarray().flatten()
                scores += similarity * similar_user_ratings

        # Normalize
        similarity_sum = user_similarities[similar_users].sum()
        if similarity_sum > 0:
            scores /= similarity_sum

        return scores

    def _content_based_scores(self, rated_items: np.ndarray) -> np.ndarray:
        """Compute content-based scores"""
        if len(rated_items) == 0:
            return np.zeros(self.item_similarity.shape[0])

        # Average similarity to rated items
        scores = self.item_similarity[rated_items].mean(axis=0)
        return scores

    def _get_popular_items(self, top_n: int) -> List[Dict]:
        """Get most popular items (fallback)"""
        popular_items = self.item_features.nlargest(top_n, "popularity_score")

        recommendations = []
        for item_id, item_info in popular_items.iterrows():
            recommendations.append({
                "item_id": item_id,
                "title": item_info.get("title", "Unknown"),
                "description": item_info.get("description", ""),
                "url": item_info.get("url", ""),
                "predicted_rating": float(item_info.get("combined_rating", item_info.get("avg_rating", 0))),
                "avg_rating": float(item_info.get("combined_rating", item_info.get("avg_rating", 0))),
                "num_ratings": int(item_info.get("num_ratings", 0)),
                "confidence": 0.5
            })

        return recommendations

    def save(self, filepath: str):
        """Save model to disk"""
        joblib.dump(self, filepath)
        logger.info(f"Model saved to {filepath}")

    @staticmethod
    def load(filepath: str):
        """Load model from disk"""
        model = joblib.load(filepath)
        logger.info(f"Model loaded from {filepath}")
        return model
