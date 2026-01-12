"""
Train Professional Recommendation Model
"""
import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.professional_data_loader import ProfessionalDataLoader
from src.advanced_recommender import AdvancedRecommender
import pandas as pd

def train_professional_model():
    """Train the professional recommendation model"""
    
    print("=" * 60)
    print("PROFESSIONAL AI COURSE RECOMMENDER - TRAINING")
    print("=" * 60)
    
    # Step 1: Load real course data
    print("\n[1/3] Loading real course data from Coursera reviews...")
    loader = ProfessionalDataLoader()
    courses = loader.load_courses_from_reviews()
    
    if courses.empty:
        print("❌ ERROR: No courses loaded. Check data path.")
        return
    
    print(f"\n📊 Data Summary:")
    print(f"   Courses: {len(courses)}")
    print(f"   Categories: {courses['category'].value_counts().to_dict()}")
    print(f"   Average Rating: {courses['rating'].mean():.2f}")
    print(f"   Total Reviews: {courses['num_ratings'].sum():,}")
    
    # Step 2: Train model
    print("\n[2/3] Training advanced recommendation model...")
    model = AdvancedRecommender()
    model.fit(courses)
    
    # Step 3: Test with diverse students
    print("\n[3/3] Testing with diverse student profiles...")
    
    test_students = [
        {'major': 'Computer Science', 'interests': 'AI, Machine Learning, Web Development', 'year': 3, 'gpa': 3.7},
        {'major': 'Biomedical Engineering', 'interests': 'Medical Devices, Signal Processing', 'year': 2, 'gpa': 3.5},
        {'major': 'Business Administration', 'interests': 'Marketing, Entrepreneurship', 'year': 4, 'gpa': 3.8},
        {'major': 'Psychology', 'interests': 'Mental Health, Research', 'year': 2, 'gpa': 3.6}
    ]
    
    for student in test_students:
        recommendations = model.recommend(student, top_n=5)
        print(f"\n✅ {student['major']} student:")
        for i, rec in enumerate(recommendations[:3], 1):
            print(f"   {i}. {rec['title'][:60]}...")
            print(f"      Category: {rec['category']}, Confidence: {rec['confidence']:.2f}")
    
    # Step 4: Save model
    print("\n[4/4] Saving trained model...")
    os.makedirs('results', exist_ok=True)
    model.save('results/professional_recommender.pkl')
    
    # Save course catalog
    courses.to_csv('results/course_catalog.csv', index=False)
    print("✅ Course catalog saved")
    
    print("\n" + "=" * 60)
    print("TRAINING COMPLETE!")
    print("=" * 60)
    print("\nNext steps:")
    print("1. Update predict_api.py to use AdvancedRecommender")
    print("2. Start API: python predict_api.py")
    print("3. Start Next.js: npm run dev")
    print("4. Test at http://localhost:3000")

if __name__ == "__main__":
    train_professional_model()
