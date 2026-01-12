"""
Professional Data Loader - Extracts real courses from Coursera reviews
"""
import pandas as pd
import numpy as np
from pathlib import Path
import logging

logger = logging.getLogger(__name__)


class ProfessionalDataLoader:
    """Loads and processes real course data from Coursera reviews"""

    def __init__(self, data_dir="../data"):
        self.data_dir = Path(data_dir)

    def load_courses_from_reviews(self) -> pd.DataFrame:
        """Extract course catalog from Coursera reviews"""
        logger.info("Loading courses from Coursera reviews...")

        # Load reviews by course - try multiple paths
        possible_paths = [
            self.data_dir / "100K Coursera's Course Reviews Dataset by Jan Charles" / "reviews_by_course.csv",
            self.data_dir / "100K Coursera's Course Reviews Dataset by Jan Charles " / "reviews_by_course.csv",
            self.data_dir / "coursera" / "coursera_reviews.csv",
            self.data_dir / "coursera" / "reviews_by_course.csv",
        ]
        
        reviews_path = None
        for path in possible_paths:
            if path.exists():
                reviews_path = path
                break

        if not reviews_path.exists():
            logger.error(f"Reviews file not found at {reviews_path}")
            return pd.DataFrame()

        try:
            reviews_df = pd.read_csv(reviews_path)
            logger.info(f"Loaded {len(reviews_df)} reviews")
            logger.info(f"Columns: {reviews_df.columns.tolist()}")

            # Handle different column name variations
            course_id_col = None
            for col in ["CourseId", "course_id", "Course_ID", "courseId"]:
                if col in reviews_df.columns:
                    course_id_col = col
                    break
            
            if not course_id_col:
                logger.error("Could not find course ID column")
                return pd.DataFrame()

            # Extract unique courses
            courses = []
            for course_id, group in reviews_df.groupby(course_id_col):
                # Calculate average rating
                ratings = pd.to_numeric(group["Label"], errors="coerce")
                avg_rating = ratings.mean() if not ratings.isna().all() else 4.0
                num_reviews = len(group)

                # Extract course name from reviews (use most common words)
                all_reviews = " ".join(group["Review"].astype(str).fillna(""))
                # Try to extract course name from reviews
                course_name = self._extract_course_name(course_id, all_reviews)

                # Determine category from course name and reviews
                category = self._determine_category(course_name, all_reviews)

                # Determine difficulty
                difficulty = self._determine_difficulty(all_reviews)

                courses.append(
                    {
                        "course_id": str(course_id),
                        "title": course_name,
                        "description": self._extract_description(all_reviews),
                        "category": category,
                        "difficulty": difficulty,
                        "rating": round(avg_rating, 2),
                        "num_ratings": num_reviews,
                        "source": "Coursera",
                        "url": f"https://www.coursera.org/learn/{course_id}",
                    }
                )

            courses_df = pd.DataFrame(courses)
            logger.info(f"Extracted {len(courses_df)} unique courses")

            # Clean and validate
            courses_df = self._clean_courses(courses_df)
            return courses_df

        except Exception as e:
            logger.error(f"Error loading courses: {e}")
            return pd.DataFrame()

    def _extract_course_name(self, course_id: str, reviews_text: str) -> str:
        """Extract course name from course ID and reviews"""
        # Try to find course name in reviews
        # Look for patterns like "course X", "class X", etc.
        words = reviews_text.lower().split()
        common_words = ["course", "class", "program", "specialization"]

        # If course_id looks like a name, use it
        if "-" in course_id or "_" in course_id:
            name = course_id.replace("-", " ").replace("_", " ").title()
            return name

        # Otherwise, try to extract from reviews
        # Look for capitalized phrases
        import re

        capitalized = re.findall(r"\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b", reviews_text)
        if capitalized:
            # Return most common capitalized phrase (likely course name)
            from collections import Counter

            counter = Counter(capitalized)
            if counter:
                return counter.most_common(1)[0][0]

        # Fallback: format course_id nicely
        return course_id.replace("-", " ").replace("_", " ").title()

    def _determine_category(self, course_name: str, reviews_text: str) -> str:
        """Determine course category from name and reviews"""
        text = (course_name + " " + reviews_text).lower()

        # Category keywords
        categories = {
            "Computer Science": [
                "programming",
                "python",
                "java",
                "algorithm",
                "software",
                "web development",
                "data structure",
                "computer science",
                "coding",
                "it",
                "cio",
                "cto",
            ],
            "Data Science": [
                "data science",
                "machine learning",
                "ai",
                "artificial intelligence",
                "data analysis",
                "statistics",
                "analytics",
            ],
            "Business": [
                "business",
                "management",
                "marketing",
                "finance",
                "entrepreneurship",
                "leadership",
                "mba",
            ],
            "Engineering": [
                "engineering",
                "mechanical",
                "electrical",
                "biomedical",
                "signal processing",
                "design",
            ],
            "Health & Medicine": [
                "medical",
                "health",
                "medicine",
                "nursing",
                "anatomy",
                "physiology",
                "biomedical",
            ],
            "Science": [
                "biology",
                "chemistry",
                "physics",
                "mathematics",
                "science",
            ],
            "Psychology": [
                "psychology",
                "mental health",
                "counseling",
                "behavioral",
                "cognitive",
            ],
            "Arts & Design": [
                "design",
                "graphic",
                "art",
                "creative",
                "music",
                "sketchup",
            ],
            "Education": [
                "education",
                "teaching",
                "learning",
                "pedagogy",
            ],
        }

        # Score each category
        scores = {}
        for category, keywords in categories.items():
            score = sum(1 for keyword in keywords if keyword in text)
            scores[category] = score

        if scores:
            return max(scores, key=scores.get)

        return "General"

    def _determine_difficulty(self, reviews_text: str) -> str:
        """Determine course difficulty from reviews"""
        text = reviews_text.lower()

        beginner_keywords = [
            "beginner",
            "introductory",
            "basic",
            "easy",
            "simple",
            "introduction",
        ]
        advanced_keywords = [
            "advanced",
            "expert",
            "complex",
            "difficult",
            "challenging",
            "master",
        ]

        beginner_score = sum(1 for kw in beginner_keywords if kw in text)
        advanced_score = sum(1 for kw in advanced_keywords if kw in text)

        if advanced_score > beginner_score:
            return "Advanced"
        elif beginner_score > 0:
            return "Beginner"
        else:
            return "Intermediate"

    def _extract_description(self, reviews_text: str, max_length: int = 200) -> str:
        """Extract course description from reviews"""
        # Get first few sentences from reviews
        sentences = reviews_text.split(".")[:3]
        description = ". ".join(sentences).strip()

        if len(description) > max_length:
            description = description[:max_length] + "..."

        return description if description else "A comprehensive course with excellent reviews."

    def _clean_courses(self, df: pd.DataFrame) -> pd.DataFrame:
        """Clean and validate course data"""
        # Remove duplicates
        df = df.drop_duplicates(subset=["course_id"], keep="first")

        # Remove courses with missing titles
        df = df[df["title"].notna() & (df["title"] != "")]

        # Fill missing descriptions
        df["description"] = df["description"].fillna(df["title"])

        # Ensure ratings are valid
        df["rating"] = pd.to_numeric(df["rating"], errors="coerce").fillna(4.0)
        df["rating"] = df["rating"].clip(0, 5)

        # Ensure num_ratings is valid
        df["num_ratings"] = pd.to_numeric(df["num_ratings"], errors="coerce").fillna(0)

        return df

    def create_user_profiles(self, n_users: int = 1000) -> pd.DataFrame:
        """Create diverse synthetic student profiles"""
        np.random.seed(42)

        majors = [
            "Computer Science",
            "Data Science",
            "Biomedical Engineering",
            "Business Administration",
            "Mechanical Engineering",
            "Psychology",
            "Biology",
            "Chemistry",
            "Mathematics",
            "Physics",
            "Marketing",
            "Finance",
            "Electrical Engineering",
            "Medicine",
            "Graphic Design",
            "Communications",
            "Economics",
            "Nursing",
        ]

        users = []
        for i in range(n_users):
            major = np.random.choice(majors)
            users.append(
                {
                    "user_id": f"user_{i}",
                    "name": f"Student {i}",
                    "email": f"student{i}@university.edu",
                    "major": major,
                    "year": np.random.choice([1, 2, 3, 4]),
                    "gpa": round(np.random.uniform(2.5, 4.0), 2),
                    "interests": "",
                }
            )

        return pd.DataFrame(users)


if __name__ == "__main__":
    loader = ProfessionalDataLoader()
    courses = loader.load_courses_from_reviews()
    print(f"\n✅ Loaded {len(courses)} courses")
    print(f"\nCategories: {courses['category'].value_counts()}")
    print(f"\nSample courses:")
    print(courses[["title", "category", "rating", "num_ratings"]].head(10))
