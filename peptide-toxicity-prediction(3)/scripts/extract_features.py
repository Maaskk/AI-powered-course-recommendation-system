"""
Feature Extraction API Script
Receives a sequence and returns extracted features
"""
import json
import sys
import argparse
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent))
from src.feature_extraction import PeptideFeatureExtractor


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--sequence', type=str, required=True)
    args = parser.parse_args()
    
    sequence = args.sequence
    
    # Extract features (must match training: use_dipeptide=True for 427 features)
    extractor = PeptideFeatureExtractor(use_dipeptide=True)
    features = extractor.extract_features(sequence)
    properties = extractor.extract_physicochemical_properties(sequence)
    
    result = {
        'features': features.tolist(),
        'properties': {
            'molecular_weight': float(properties[0]),
            'net_charge_pH7': float(properties[1]),
            'isoelectric_point': float(properties[2]),
            'aromaticity': float(properties[3]),
            'instability_index': float(properties[4]),
            'gravy': float(properties[5])
        },
        'amino_acid_composition': extractor.extract_amino_acid_composition(sequence).tolist(),
        'length': len(sequence)
    }
    
    print(json.dumps(result))


if __name__ == '__main__':
    main()
