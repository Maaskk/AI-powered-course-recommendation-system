"""
Advanced Recommendation Model - Content-based with major-specific matching
"""
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from typing import Dict, List
import pickle
import logging

logger = logging.getLogger(__name__)


class AdvancedRecommender:
    """
    Professional hybrid recommendation system:
    - Content-based: Match course content to user profile
    - Profile-based: Align major/interests with course categories
    - Quality-based: Boost highly-rated courses
    """

    def __init__(self):
        self.vectorizer = TfidfVectorizer(
            max_features=2000,
            stop_words="english",
            ngram_range=(1, 3),
            min_df=2,
        )
        self.courses_df = None
        self.course_vectors = None

        # Major to keyword mapping - CRITICAL for accurate recommendations
        self.major_keywords = {
            # Computer Science & IT
            "Computer Science": "programming software development web mobile algorithms data structures computer science coding python java javascript",
            "Software Engineering": "software engineering development programming coding architecture design patterns agile scrum",
            "Data Science": "data analysis machine learning statistics python AI artificial intelligence data science analytics big data",
            "Information Technology": "IT information technology systems networking database administration cloud computing",
            "Cybersecurity": "cybersecurity network security information security ethical hacking cryptography penetration testing",
            
            # Engineering
            "Biomedical Engineering": "medical health biotechnology biomechanics devices anatomy physiology biomedical engineering signal processing medical devices",
            "Mechanical Engineering": "mechanical CAD thermodynamics mechanics manufacturing design mechanical engineering",
            "Electrical Engineering": "electrical circuits electronics embedded systems signal processing electrical engineering",
            "Civil Engineering": "civil engineering construction structural design infrastructure transportation",
            "Chemical Engineering": "chemical engineering process design chemistry manufacturing materials",
            "Aerospace Engineering": "aerospace engineering aircraft spacecraft aerodynamics propulsion",
            "Industrial Engineering": "industrial engineering operations research optimization manufacturing systems",
            "Environmental Engineering": "environmental engineering sustainability pollution control water treatment",
            
            # Business
            "Business Administration": "management leadership strategy entrepreneurship MBA business administration marketing finance",
            "Business Management": "business management operations strategy leadership organizational behavior",
            "Marketing": "marketing digital advertising branding social media SEO analytics marketing",
            "Finance": "finance accounting investment banking financial economics trading finance",
            "Accounting": "accounting financial reporting auditing taxation bookkeeping",
            "Economics": "economics macro micro econometrics market policy trade economics",
            "Entrepreneurship": "entrepreneurship startups business planning innovation venture capital",
            "International Business": "international business global trade cross-cultural management",
            
            # Psychology
            "Psychology": "psychology mental health counseling behavioral cognitive therapy psychology research",
            "Clinical Psychology": "clinical psychology therapy counseling mental health treatment",
            "Cognitive Psychology": "cognitive psychology brain cognition memory learning",
            
            # Sciences
            "Biology": "biology genetics molecular cell microbiology ecology evolution biology",
            "Molecular Biology": "molecular biology genetics DNA RNA proteins cell biology",
            "Biochemistry": "biochemistry chemistry biology proteins enzymes metabolism",
            "Genetics": "genetics DNA RNA heredity genomics molecular genetics",
            "Chemistry": "chemistry organic inorganic analytical biochemistry laboratory chemistry",
            "Organic Chemistry": "organic chemistry carbon compounds reactions synthesis",
            "Physical Chemistry": "physical chemistry thermodynamics quantum mechanics spectroscopy",
            "Mathematics": "mathematics calculus algebra statistics linear geometry mathematics",
            "Applied Mathematics": "applied mathematics modeling optimization numerical methods",
            "Statistics": "statistics data analysis probability regression hypothesis testing",
            "Physics": "physics quantum mechanics thermodynamics relativity electromagnetism physics",
            "Theoretical Physics": "theoretical physics quantum mechanics relativity particle physics",
            "Applied Physics": "applied physics engineering physics materials science",
            
            # Health & Medicine
            "Medicine": "medicine clinical healthcare nursing anatomy pharmacology medicine",
            "Nursing": "nursing patient care clinical healthcare medical procedures nursing",
            "Pharmacy": "pharmacy pharmaceuticals drug therapy medication",
            "Public Health": "public health epidemiology health policy community health",
            "Health Sciences": "health sciences healthcare medical research public health",
            
            # Design & Arts
            "Graphic Design": "design graphic visual UI UX creative photoshop illustrator design",
            "Industrial Design": "industrial design product design manufacturing ergonomics",
            "Fashion Design": "fashion design clothing textiles style trends",
            "Architecture": "architecture building design construction urban planning",
            
            # Communications & Media
            "Communications": "communication media journalism public relations writing communications",
            "Journalism": "journalism news reporting writing media ethics",
            "Media Studies": "media studies communication theory digital media",
            
            # Humanities
            "English Literature": "english literature writing poetry novels literary analysis",
            "History": "history historical research ancient modern world history",
            "Political Science": "political science government policy international relations",
            "Sociology": "sociology social research society culture social issues",
            "Anthropology": "anthropology culture human society archaeology",
            "Philosophy": "philosophy ethics logic metaphysics epistemology",
            
            # Education
            "Education": "education teaching pedagogy curriculum learning",
            "Early Childhood Education": "early childhood education preschool teaching child development",
            "Special Education": "special education disabilities learning support",
            
            # Law & Justice
            "Law": "law legal studies jurisprudence contracts criminal law",
            "Criminal Justice": "criminal justice law enforcement criminology",
            
            # Social Work
            "Social Work": "social work counseling community services social services",
            
            # Arts
            "Art": "art painting drawing sculpture visual arts",
            "Music": "music composition performance theory",
            "Theater": "theater drama acting performance",
            "Film Studies": "film studies cinema production directing",
            
            # Other
            "Other": "general education learning academic",
        }

    def fit(self, courses_df: pd.DataFrame):
        """Train the recommendation model"""
        self.courses_df = courses_df.copy()

        # Create rich text representations
        self.courses_df["full_text"] = (
            self.courses_df["title"].fillna("")
            + " "
            + self.courses_df["description"].fillna("")
            + " "
            + self.courses_df["category"].fillna("")
        )

        # Vectorize courses
        self.course_vectors = self.vectorizer.fit_transform(
            self.courses_df["full_text"]
        )

        logger.info("✅ Advanced model trained")
        logger.info(f"   - {len(self.courses_df)} courses indexed")
        logger.info(f"   - {self.course_vectors.shape[1]} features extracted")

    def recommend(self, user_profile: Dict, top_n: int = 10) -> List[Dict]:
        """
        Generate personalized recommendations for a user

        Args:
            user_profile: {major, interests, year, gpa}
            top_n: Number of recommendations

        Returns:
            List of course recommendations with scores
        """
        major = user_profile.get("major", "")
        interests = user_profile.get("interests", "")
        year = int(user_profile.get("year", 2))
        gpa = float(user_profile.get("gpa", 3.0))

        # Build user query with major-specific keywords
        # Use mapping if available, otherwise use major name + common keywords
        major_keywords = self.major_keywords.get(major, major.lower())
        # If major not in mapping, try to extract keywords from major name
        if major not in self.major_keywords:
            # Extract key terms from major name (e.g., "Computer Science" -> "computer science programming")
            major_keywords = major.lower()
        
        user_query = f"{major} {major_keywords} {interests}".lower()

        # Vectorize user profile
        user_vector = self.vectorizer.transform([user_query])

        # Compute similarities
        similarities = cosine_similarity(user_vector, self.course_vectors)[0]

        # Get top candidates (3x for filtering)
        top_indices = similarities.argsort()[-top_n * 3 :][::-1]

        recommendations = []
        for idx in top_indices:
            course = self.courses_df.iloc[idx]
            similarity = similarities[idx]

            # Filter by difficulty based on year
            difficulty = course.get("difficulty", "Intermediate")
            if year <= 1 and difficulty == "Advanced":
                continue  # Skip advanced for freshmen
            if year >= 4 and difficulty == "Beginner" and gpa > 3.5:
                continue  # Skip beginner for high-performing seniors

            # Calculate confidence score (similarity + quality)
            quality_score = course.get("rating", 4.0) / 5.0
            confidence = (similarity * 0.7) + (quality_score * 0.3)

            # Predict user rating
            predicted_rating = 3.0 + (confidence * 2.0)
            predicted_rating = min(predicted_rating, 5.0)

            recommendations.append(
                {
                    "item_id": str(course["course_id"]),
                    "course_id": str(course["course_id"]),
                    "title": str(course["title"]),
                    "description": str(course.get("description", ""))[:250] + "...",
                    "category": str(course.get("category", "General")),
                    "difficulty": str(difficulty),
                    "rating": float(course.get("rating", 4.0)),
                    "predicted_rating": round(predicted_rating, 2),
                    "confidence": round(confidence, 2),
                    "match_score": round(similarity, 2),
                    "source": str(course.get("source", "Coursera")),
                    "url": str(course.get("url", "#")),
                    "num_ratings": int(course.get("num_ratings", 0)),
                    "avg_rating": float(course.get("rating", 4.0)),
                }
            )

            if len(recommendations) >= top_n:
                break

        # Sort by confidence
        recommendations.sort(key=lambda x: x["confidence"], reverse=True)

        return recommendations

    def get_popular_courses(self, category: str = None, top_n: int = 10) -> List[Dict]:
        """Get popular courses, optionally filtered by category"""
        df = self.courses_df.copy()

        if category:
            df = df[
                df["category"].str.contains(category, case=False, na=False)
            ]

        # Sort by rating and number of reviews
        df = df.sort_values(
            ["rating", "num_ratings"], ascending=[False, False]
        ).head(top_n)

        return df[
            ["course_id", "title", "rating", "category", "source", "num_ratings"]
        ].to_dict("records")

    def save(self, filepath: str):
        """Save trained model"""
        model_data = {
            "vectorizer": self.vectorizer,
            "courses_df": self.courses_df,
            "course_vectors": self.course_vectors,
            "major_keywords": self.major_keywords,
        }
        with open(filepath, "wb") as f:
            pickle.dump(model_data, f)
        logger.info(f"✅ Model saved to {filepath}")

    def load(self, filepath: str):
        """Load trained model"""
        with open(filepath, "rb") as f:
            model_data = pickle.load(f)

        self.vectorizer = model_data["vectorizer"]
        self.courses_df = model_data["courses_df"]
        self.course_vectors = model_data["course_vectors"]
        self.major_keywords = model_data.get("major_keywords", {})
        logger.info(f"✅ Model loaded from {filepath}")
