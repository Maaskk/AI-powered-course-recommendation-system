"""
Data loader for peptide sequences.

This module is assumed to already exist and correctly loads:
- Training set
- Validation set
- Independent test set

Each dataset contains:
- sequences: List of amino acid sequences (strings)
- labels: Binary labels (0=non-toxic, 1=toxic)
- source: Data source identifier
"""

import numpy as np
from typing import Tuple, List, Dict
from Bio import SeqIO
import os
from sklearn.model_selection import train_test_split

def load_hemopi_fasta(filepath: str, label: int) -> Tuple[List[str], List[int]]:
    """
    Load HemoPI FASTA files.
    
    Args:
        filepath: Path to FASTA file
        label: Label to assign (1 for toxic/positive, 0 for non-toxic/negative)
        
    Returns:
        Tuple of (sequences, labels)
    """
    sequences = []
    labels = []
    
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"FASTA file not found: {filepath}")
    
    for record in SeqIO.parse(filepath, "fasta"):
        # Extract sequence and convert to uppercase
        sequence = str(record.seq).upper()
        # Filter out any non-standard amino acids
        if all(aa in 'ACDEFGHIKLMNPQRSTVWY' for aa in sequence):
            sequences.append(sequence)
            labels.append(label)
    
    return sequences, labels


def load_toxteller_fasta(filepath: str) -> Tuple[List[str], List[int]]:
    """
    Load ToxTeller FASTA files with labels in header.
    
    Args:
        filepath: Path to FASTA file
        
    Returns:
        Tuple of (sequences, labels)
    """
    sequences = []
    labels = []
    
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"FASTA file not found: {filepath}")
    
    for record in SeqIO.parse(filepath, "fasta"):
        sequence = str(record.seq).upper()
        header = record.description.lower()
        
        # Determine label from header
        # Check for non-toxic first (since "nontoxic" contains "toxic")
        if 'nontoxic' in header or 'non-toxic' in header or 'neg' in header or 'negative' in header:
            label = 0
        elif 'pos' in header or 'positive' in header or 'toxic' in header:
            label = 1
        else:
            # Default based on 'pos' keyword
            label = 1 if 'pos' in header else 0
        
        # Filter valid amino acids
        if all(aa in 'ACDEFGHIKLMNPQRSTVWY' for aa in sequence):
            sequences.append(sequence)
            labels.append(label)
    
    return sequences, labels


def load_csv_sequences(csv_file: str) -> List[str]:
    """Load sequences from CSV file (one sequence per line, no header)"""
    sequences = []
    if not os.path.exists(csv_file):
        return sequences
    
    with open(csv_file, 'r') as f:
        for line in f:
            seq = line.strip().upper()
            # Filter valid amino acids and minimum length
            if seq and len(seq) >= 5 and all(aa in 'ACDEFGHIKLMNPQRSTVWY' for aa in seq):
                sequences.append(seq)
    
    return sequences


def load_datasets() -> Tuple[Dict, Dict, Dict]:
    """
    Load peptide datasets from CSV or FASTA files.
    
    Priority order:
    1. CSV files (train_pos.csv, train_neg.csv, test_pos.csv, test_neg.csv)
    2. HemoPI/ToxTeller structure
    3. toxic_peptides.fasta and nontoxic_peptides.fasta
    
    Returns:
        Tuple of (train_data, val_data, test_data)
    """
    print("Loading datasets...")
    
    base_path = "data/raw"
    
    # Check if data directory exists
    if not os.path.exists(base_path):
        raise FileNotFoundError(
            f"\nData directory not found: {base_path}\n"
            f"Please run: python scripts/download_and_prepare_data.py"
        )
    
    # PRIORITY 1: Try to load from CSV files first
    csv_train_pos = f"{base_path}/train_pos.csv"
    csv_train_neg = f"{base_path}/train_neg.csv"
    csv_test_pos = f"{base_path}/test_pos.csv"
    csv_test_neg = f"{base_path}/test_neg.csv"
    
    if all(os.path.exists(f) for f in [csv_train_pos, csv_train_neg, csv_test_pos, csv_test_neg]):
        print("Loading from CSV files...")
        from sklearn.model_selection import train_test_split
        
        # Load training data
        train_pos = load_csv_sequences(csv_train_pos)
        train_neg = load_csv_sequences(csv_train_neg)
        
        # Load test data
        test_pos = load_csv_sequences(csv_test_pos)
        test_neg = load_csv_sequences(csv_test_neg)
        
        # Combine training sequences
        train_sequences = train_pos + train_neg
        train_labels = [1] * len(train_pos) + [0] * len(train_neg)
        
        # Combine test sequences
        test_sequences = test_pos + test_neg
        test_labels = [1] * len(test_pos) + [0] * len(test_neg)
        
        # Split training into train/val (90/10 split)
        train_sequences, val_sequences, train_labels, val_labels = train_test_split(
            train_sequences, train_labels, test_size=0.1, random_state=42, stratify=train_labels
        )
        
        source = 'CSV_files'
    
    # PRIORITY 2: Try to load from HemoPI structure
    elif os.path.exists(f"{base_path}/HemoPI/positive.fasta"):
        hemopi_pos_path = f"{base_path}/HemoPI/positive.fasta"
        print("Loading HemoPI training data...")
        hemopi_pos_train, labels_pos_train = load_hemopi_fasta(
            f"{base_path}/HemoPI/positive.fasta", label=1
        )
        hemopi_neg_train, labels_neg_train = load_hemopi_fasta(
            f"{base_path}/HemoPI/negative.fasta", label=0
        )
        
        # Load HemoPI validation data
        print("Loading HemoPI validation data...")
        hemopi_pos_val, labels_pos_val = load_hemopi_fasta(
            f"{base_path}/HemoPI/validation_positive.fasta", label=1
        )
        hemopi_neg_val, labels_neg_val = load_hemopi_fasta(
            f"{base_path}/HemoPI/validation_negative.fasta", label=0
        )
        
        # Load ToxTeller data
        print("Loading ToxTeller data...")
        toxteller_train_seq, toxteller_train_labels = load_toxteller_fasta(
            f"{base_path}/toxteller/training_dataset.fasta"
        )
        toxteller_test_seq, toxteller_test_labels = load_toxteller_fasta(
            f"{base_path}/toxteller/independent_dataset.fasta"
        )
        
        # Combine training data from HemoPI and ToxTeller
        train_sequences = hemopi_pos_train + hemopi_neg_train + toxteller_train_seq
        train_labels = labels_pos_train + labels_neg_train + toxteller_train_labels
        
        # Validation data from HemoPI
        val_sequences = hemopi_pos_val + hemopi_neg_val
        val_labels = labels_pos_val + labels_neg_val
        
        # Test data from ToxTeller independent set
        test_sequences = toxteller_test_seq
        test_labels = toxteller_test_labels
        
        source = 'HemoPI+ToxTeller'
    else:
        # Fall back to using the generated dataset files
        print("Loading from generated dataset files...")
        toxic_file = f"{base_path}/toxic_peptides.fasta"
        nontoxic_file = f"{base_path}/nontoxic_peptides.fasta"
        
        if not os.path.exists(toxic_file) or not os.path.exists(nontoxic_file):
            raise FileNotFoundError(
                f"\nDataset files not found!\n"
                f"Expected: {toxic_file} and {nontoxic_file}\n"
                f"Please run: python scripts/download_and_prepare_data.py"
            )
        
        # Load toxic and non-toxic sequences
        toxic_sequences, toxic_labels = load_toxteller_fasta(toxic_file)
        nontoxic_sequences, nontoxic_labels = load_toxteller_fasta(nontoxic_file)
        
        # Combine all sequences
        all_sequences = toxic_sequences + nontoxic_sequences
        all_labels = toxic_labels + nontoxic_labels
        
        # Split into train/val/test (70/15/15)
        # First split: train (70%) vs temp (30%)
        train_sequences, temp_sequences, train_labels, temp_labels = train_test_split(
            all_sequences, all_labels, test_size=0.3, random_state=42, stratify=all_labels
        )
        
        # Second split: val (15%) vs test (15%) from temp
        val_sequences, test_sequences, val_labels, test_labels = train_test_split(
            temp_sequences, temp_labels, test_size=0.5, random_state=42, stratify=temp_labels
        )
        
        source = 'Generated_dataset'
    
    # Create datasets
    train_data = {
        'sequences': train_sequences,
        'labels': np.array(train_labels),
        'source': source
    }
    
    val_data = {
        'sequences': val_sequences,
        'labels': np.array(val_labels),
        'source': source
    }
    
    test_data = {
        'sequences': test_sequences,
        'labels': np.array(test_labels),
        'source': source
    }
    
    # Print statistics
    print(f"\n✓ Training set: {len(train_data['sequences'])} samples")
    print(f"  - Toxic: {np.sum(train_data['labels'])} ({np.mean(train_data['labels'])*100:.1f}%)")
    print(f"  - Non-toxic: {np.sum(train_data['labels']==0)} ({np.mean(train_data['labels']==0)*100:.1f}%)")
    
    print(f"\n✓ Validation set: {len(val_data['sequences'])} samples")
    print(f"  - Toxic: {np.sum(val_data['labels'])} ({np.mean(val_data['labels'])*100:.1f}%)")
    print(f"  - Non-toxic: {np.sum(val_data['labels']==0)} ({np.mean(val_data['labels']==0)*100:.1f}%)")
    
    print(f"\n✓ Test set: {len(test_data['sequences'])} samples")
    print(f"  - Toxic: {np.sum(test_data['labels'])} ({np.mean(test_data['labels'])*100:.1f}%)")
    print(f"  - Non-toxic: {np.sum(test_data['labels']==0)} ({np.mean(test_data['labels']==0)*100:.1f}%)\n")
    
    return train_data, val_data, test_data


def get_dataset_statistics(data: Dict) -> Dict:
    """
    Calculate basic statistics for a dataset.
    
    Args:
        data: Dataset dictionary
        
    Returns:
        Statistics dictionary
    """
    sequences = data['sequences']
    labels = data['labels']
    
    stats = {
        'n_samples': len(sequences),
        'n_toxic': int(np.sum(labels)),
        'n_nontoxic': int(np.sum(labels == 0)),
        'toxic_ratio': float(np.mean(labels)),
        'mean_length': float(np.mean([len(seq) for seq in sequences])),
        'std_length': float(np.std([len(seq) for seq in sequences])),
        'min_length': int(min([len(seq) for seq in sequences])),
        'max_length': int(max([len(seq) for seq in sequences]))
    }
    
    return stats
