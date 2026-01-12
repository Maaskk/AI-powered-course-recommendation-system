#!/usr/bin/env python3
"""
Flask API for serving professional course recommendations
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
from pathlib import Path
import logging

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from advanced_recommender import AdvancedRecommender

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Load model
MODEL_PATH = Path("results/professional_recommender.pkl")
model = None


def load_model():
    """Load the trained professional model"""
    global model
    try:
        if MODEL_PATH.exists():
            model = AdvancedRecommender()
            model.load(str(MODEL_PATH))
            logger.info("✅ Professional model loaded successfully")
            logger.info(f"   Total courses: {len(model.courses_df)}")
            logger.info(f"   Categories: {model.courses_df['category'].nunique()}")
            return True
        else:
            logger.error(f"Model not found at {MODEL_PATH}")
            logger.error("Please run: python train_professional_model.py")
            return False
    except Exception as e:
        logger.error(f"Error loading model: {e}")
        import traceback
        traceback.print_exc()
        return False


@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "model_loaded": model is not None,
        "models_loaded": ["professional"] if model is not None else [],
        "total_courses": len(model.courses_df) if model else 0
    })


@app.route("/recommend", methods=["POST"])
def recommend():
    """Get personalized recommendations for a user"""
    try:
        data = request.json
        
        # Extract user profile
        user_profile = {
            "major": data.get("major", ""),
            "interests": data.get("interests", ""),
            "year": int(data.get("year", 2)),
            "gpa": float(data.get("gpa", 3.0))
        }
        
        top_n = data.get("top_n", 10)

        if not user_profile["major"]:
            return jsonify({"error": "Major is required"}), 400

        if model is None:
            return jsonify({"error": "Model not loaded"}), 500

        # Get recommendations using user profile
        recommendations = model.recommend(user_profile, top_n=top_n)

        return jsonify({
            "user_id": data.get("user_id", "unknown"),
            "recommendations": recommendations,
            "count": len(recommendations)
        })

    except Exception as e:
        logger.error(f"Error generating recommendations: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route("/items/popular", methods=["GET"])
def popular_items():
    """Get most popular items"""
    try:
        top_n = request.args.get("top_n", 20, type=int)
        category = request.args.get("category", None)

        if model is None:
            return jsonify({"error": "Model not loaded"}), 500

        # Get popular items
        popular = model.get_popular_courses(category, top_n)

        return jsonify({
            "items": popular,
            "count": len(popular)
        })

    except Exception as e:
        logger.error(f"Error getting popular items: {e}")
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    print("=" * 60)
    print("PROFESSIONAL AI COURSE RECOMMENDER - API SERVER")
    print("=" * 60)
    
    if load_model():
        print(f"\n✅ Ready to serve recommendations!")
        print(f"   Total courses: {len(model.courses_df)}")
        print(f"   Categories: {model.courses_df['category'].nunique()}")
        print(f"\n🚀 Starting server on http://localhost:5000")
        print("=" * 60)
        app.run(host="0.0.0.0", port=5000, debug=False)
    else:
        print("\n❌ Failed to start server - model not loaded")
        print("   Run: python train_professional_model.py")
        sys.exit(1)
