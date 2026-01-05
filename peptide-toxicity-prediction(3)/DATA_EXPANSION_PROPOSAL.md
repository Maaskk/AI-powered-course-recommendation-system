# 📊 Data Expansion Proposal

## Current vs. Proposed Dataset

### Current Dataset (Before Expansion)
- **Toxic peptides**: 53 sequences
- **Non-toxic peptides**: 53 sequences
- **Total**: 106 sequences

### Expanded Dataset (After Cleaning)
- **Toxic peptides**: ~100 sequences
- **Non-toxic peptides**: ~110 sequences
- **Total**: ~210 sequences
- **Increase**: ~2x larger

## What's Included in the New Script

### ✅ Data Cleaning Features

1. **Sequence Validation**
   - Only standard 20 amino acids (A, C, D, E, F, G, H, I, K, L, M, N, P, Q, R, S, T, V, W, Y)
   - Minimum length: 5 amino acids
   - Removes invalid characters and whitespace

2. **Duplicate Removal**
   - Removes duplicates within toxic class
   - Removes duplicates within non-toxic class
   - Removes cross-class duplicates (sequences that appear in both classes)

3. **Statistics Generation**
   - Sequence length statistics (min, max, mean, median)
   - Class balance information
   - Cleaning summary (what was removed and why)

### 📈 Data Sources

**Toxic Peptides** (~100 sequences):
- Melittin variants (bee venom)
- LL-37 and hemolytic variants
- Cytolytic antimicrobial peptides
- Synthetic toxic families (KLAK, etc.)
- Known hemolytic sequences from literature

**Non-Toxic Peptides** (~110 sequences):
- Insulin variants (FDA-approved)
- Glucagon-like peptides (therapeutic)
- Safe antimicrobial peptides
- Proline-rich safe peptides
- Designed low-hemolysis AMPs

## Files Created

The expanded script (`download_and_prepare_data_EXPANDED.py`) will create:

1. `data/raw/toxic_peptides.fasta` - Cleaned toxic sequences
2. `data/raw/nontoxic_peptides.fasta` - Cleaned non-toxic sequences  
3. `data/raw/dataset_info.txt` - Detailed statistics and information

## Comparison

| Metric | Current | Expanded | Improvement |
|--------|---------|----------|-------------|
| Total Sequences | 106 | ~210 | 2x |
| Toxic | 53 | ~100 | ~2x |
| Non-Toxic | 53 | ~110 | ~2x |
| Data Cleaning | ❌ No | ✅ Yes | Better quality |
| Duplicate Removal | ❌ No | ✅ Yes | No duplicates |
| Validation | ❌ Basic | ✅ Full | All sequences valid |

## How to Use

### Review Before Approval

1. **Test the script** (already done - it works!):
   ```bash
   python scripts/download_and_prepare_data_EXPANDED.py
   ```

2. **Review the generated data**:
   ```bash
   cat data/raw/dataset_info.txt
   head data/raw/toxic_peptides.fasta
   head data/raw/nontoxic_peptides.fasta
   ```

3. **Check statistics**:
   ```bash
   python3 -c "
   from Bio import SeqIO
   toxic = len(list(SeqIO.parse('data/raw/toxic_peptides.fasta', 'fasta')))
   nontoxic = len(list(SeqIO.parse('data/raw/nontoxic_peptides.fasta', 'fasta')))
   print(f'Toxic: {toxic}, Non-toxic: {nontoxic}, Total: {toxic + nontoxic}')
   "
   ```

### After Approval

To replace the current script with the expanded version:

```bash
# Backup current script
mv scripts/download_and_prepare_data.py scripts/download_and_prepare_data_OLD.py

# Use the expanded version
mv scripts/download_and_prepare_data_EXPANDED.py scripts/download_and_prepare_data.py

# Regenerate data
python scripts/download_and_prepare_data.py
```

## Notes

- ✅ **No breaking changes** - The output format is the same (FASTA files)
- ✅ **Backward compatible** - Existing code will work with the new data
- ✅ **Clean data** - All sequences validated and deduplicated
- ✅ **Better statistics** - More detailed information about the dataset

## If You Want Even More Sequences

The current expansion doubles the dataset. If you want **even more sequences** (500+, 1000+, etc.), I can:

1. Add more sequence variations
2. Include more literature sources
3. Generate synthetic variations of known peptides
4. Add sequences from public databases

**Just let me know the target number!**

## Questions?

- Does 210 sequences work for you, or do you want more?
- Are you happy with the cleaning approach?
- Any specific sequences or sources you want included?

**Waiting for your approval before making changes to the main script!** ✋

