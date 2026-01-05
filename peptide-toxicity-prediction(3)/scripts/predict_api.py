"""
API Bridge Script for NestJS Backend
Receives sequences and model choice, returns predictions
"""
import json
import sys
import argparse
import joblib
import numpy as np
from pathlib import Path

# Add parent directory to path to import modules
sys.path.append(str(Path(__file__).parent.parent))
from src.feature_extraction import PeptideFeatureExtractor


def load_models():
    """Load trained models from disk"""
    models_path = Path(__file__).parent.parent / 'results' / 'trained_models.pkl'
    
    try:
        saved_data = joblib.load(models_path)
        return saved_data
    except FileNotFoundError:
        # Return None if models not trained yet
        return None


def predict_sequence(sequence, model_name, models):
    """Predict toxicity for a single sequence"""
    
    # Extract features (must match training: use_dipeptide=True for 427 features)
    extractor = PeptideFeatureExtractor(use_dipeptide=True)
    features = extractor.extract_features(sequence).reshape(1, -1)
    
    if models is None:
        # Mock prediction for development
        mock_prob = np.random.rand()
        return {
            'prediction': 'Toxic' if mock_prob > 0.5 else 'Non-Toxic',
            'confidence': float(abs(mock_prob - 0.5) * 2),
            'probability': {
                'toxic': float(mock_prob),
                'non_toxic': float(1 - mock_prob)
            }
        }
    
    # Scale features
    scaler = models['scaler']
    features_scaled = scaler.transform(features)
    
    # Map model names
    model_map = {
        'ensemble': 'ensemble',
        'logistic_regression': 'Logistic Regression',
        'random_forest': 'Random Forest',
        'svm': 'SVM'
    }
    
    if model_name == 'ensemble' or model_name not in model_map:
        # Ensemble prediction (average of all models)
        probs = []
        for model_key in ['Logistic Regression', 'Random Forest', 'SVM']:
            model = models['models'][model_key]
            prob = model.predict_proba(features_scaled)[0]
            probs.append(prob)
        
        avg_prob = np.mean(probs, axis=0)
        prediction = 1 if avg_prob[1] > 0.5 else 0
        confidence = float(max(avg_prob))
        avg_prob = avg_prob
        
    else:
        # Single model prediction
        mapped_name = model_map[model_name]
        model = models['models'].get(mapped_name)
        if model is None:
            model = models['models']['Random Forest']  # Default fallback
        
        prediction = model.predict(features_scaled)[0]
        prob = model.predict_proba(features_scaled)[0]
        confidence = float(max(prob))
        avg_prob = prob
    
    return {
        'prediction': 'Toxic' if prediction == 1 else 'Non-Toxic',
        'confidence': confidence,
        'probability': {
            'toxic': float(avg_prob[1]),
            'non_toxic': float(avg_prob[0])
        }
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--sequences', type=str, required=True)
    parser.add_argument('--model', type=str, default='ensemble')
    args = parser.parse_args()
    
    # Parse sequences
    sequences = json.loads(args.sequences)
    
    # Load models
    models = load_models()
    
    # Predict for each sequence
    results = []
    for sequence in sequences:
        result = predict_sequence(sequence, args.model, models)
        results.append(result)
    
    # Output as JSON
    print(json.dumps(results))


if __name__ == '__main__':
    main()
