"""
Prepare data from CSV files for training.
Loads train_pos.csv, train_neg.csv, test_pos.csv, test_neg.csv
and converts them to the format needed for training.
"""

import os
import numpy as np
from pathlib import Path

def load_csv_sequences(csv_file):
    """Load sequences from CSV file (one sequence per line, no header)"""
    sequences = []
    if not os.path.exists(csv_file):
        print(f"⚠ File not found: {csv_file}")
        return sequences
    
    with open(csv_file, 'r') as f:
        for line in f:
            seq = line.strip()
            if seq and len(seq) >= 5:  # Minimum length
                sequences.append(seq.upper())
    
    return sequences

def prepare_csv_datasets():
    """Prepare datasets from CSV files"""
    base_path = Path("data/raw")
    
    print("=" * 70)
    print("PREPARING DATASETS FROM CSV FILES")
    print("=" * 70)
    
    # Load training data
    print("\nLoading training data...")
    train_pos = load_csv_sequences(base_path / "train_pos.csv")
    train_neg = load_csv_sequences(base_path / "train_neg.csv")
    
    print(f"  ✓ Loaded {len(train_pos)} positive (toxic) sequences")
    print(f"  ✓ Loaded {len(train_neg)} negative (non-toxic) sequences")
    
    # Load test data
    print("\nLoading test data...")
    test_pos = load_csv_sequences(base_path / "test_pos.csv")
    test_neg = load_csv_sequences(base_path / "test_neg.csv")
    
    print(f"  ✓ Loaded {len(test_pos)} positive (toxic) sequences")
    print(f"  ✓ Loaded {len(test_neg)} negative (non-toxic) sequences")
    
    # Create train data
    train_sequences = train_pos + train_neg
    train_labels = [1] * len(train_pos) + [0] * len(train_neg)
    
    # Create test data
    test_sequences = test_pos + test_neg
    test_labels = [1] * len(test_pos) + [0] * len(test_neg)
    
    # Create validation set from training data (10% of training)
    from sklearn.model_selection import train_test_split
    train_sequences, val_sequences, train_labels, val_labels = train_test_split(
        train_sequences, train_labels, test_size=0.1, random_state=42, stratify=train_labels
    )
    
    print("\n" + "=" * 70)
    print("DATASET SUMMARY")
    print("=" * 70)
    print(f"Training set: {len(train_sequences)} sequences")
    print(f"  - Toxic: {sum(train_labels)} ({sum(train_labels)/len(train_labels)*100:.1f}%)")
    print(f"  - Non-toxic: {len(train_labels)-sum(train_labels)} ({(len(train_labels)-sum(train_labels))/len(train_labels)*100:.1f}%)")
    
    print(f"\nValidation set: {len(val_sequences)} sequences")
    print(f"  - Toxic: {sum(val_labels)} ({sum(val_labels)/len(val_labels)*100:.1f}%)")
    print(f"  - Non-toxic: {len(val_labels)-sum(val_labels)} ({(len(val_labels)-sum(val_labels))/len(val_labels)*100:.1f}%)")
    
    print(f"\nTest set: {len(test_sequences)} sequences")
    print(f"  - Toxic: {sum(test_labels)} ({sum(test_labels)/len(test_labels)*100:.1f}%)")
    print(f"  - Non-toxic: {len(test_labels)-sum(test_labels)} ({(len(test_labels)-sum(test_labels))/len(test_labels)*100:.1f}%)")
    
    return {
        'train': {'sequences': train_sequences, 'labels': np.array(train_labels)},
        'val': {'sequences': val_sequences, 'labels': np.array(val_labels)},
        'test': {'sequences': test_sequences, 'labels': np.array(test_labels)}
    }

if __name__ == "__main__":
    datasets = prepare_csv_datasets()
    print("\n✓ Datasets prepared successfully!")
    print("\nNext: Update data_loader.py to use these CSV files")

