"""
Complete training pipeline for peptide toxicity prediction.

This script orchestrates the entire ML workflow:
1. Data loading
2. Feature extraction
3. Model training with hyperparameter tuning
4. Evaluation on validation and test sets
5. Biological interpretation
"""

import sys
from pathlib import Path

# Add src to path
sys.path.append(str(Path(__file__).parent.parent))

from src.data_loader import load_datasets, get_dataset_statistics
from src.feature_extraction import PeptideFeatureExtractor
from src.models import ToxicityPredictor
from src.evaluate import ModelEvaluator
from src.biological_analysis import BiologicalAnalyzer
from src.utils import set_random_seed, save_results, print_section_header, Logger


def main():
    """Execute complete training pipeline."""
    
    # Initialize logger
    logger = Logger("results/pipeline.log")
    
    print_section_header("PEPTIDE TOXICITY PREDICTION PIPELINE")
    print("Academic-Quality Machine Learning for Bioinformatics")
    print("Predicting peptide toxicity from amino acid sequences\n")
    
    # Set random seed for reproducibility
    set_random_seed(42)
    logger.log("Random seed set to 42 for reproducibility")
    
    # =========================================================================
    # 1. LOAD DATASETS
    # =========================================================================
    print_section_header("STEP 1: DATA LOADING")
    
    train_data, val_data, test_data = load_datasets()
    
    # Print dataset statistics
    for name, data in [("Training", train_data), ("Validation", val_data), ("Test", test_data)]:
        stats = get_dataset_statistics(data)
        print(f"{name} Set Statistics:")
        print(f"  Total samples: {stats['n_samples']}")
        print(f"  Toxic: {stats['n_toxic']} ({stats['toxic_ratio']*100:.1f}%)")
        print(f"  Non-toxic: {stats['n_nontoxic']} ({(1-stats['toxic_ratio'])*100:.1f}%)")
        print(f"  Length: {stats['mean_length']:.1f} ± {stats['std_length']:.1f} AA")
        print(f"  Range: [{stats['min_length']}, {stats['max_length']}] AA\n")
    
    logger.log(f"Loaded {len(train_data['sequences'])} training samples")
    
    # =========================================================================
    # 2. FEATURE EXTRACTION
    # =========================================================================
    print_section_header("STEP 2: FEATURE EXTRACTION")
    
    # Initialize feature extractor (WITH dipeptide for better accuracy)
    # Dipeptide composition adds 400 features (427 total) for better performance
    extractor = PeptideFeatureExtractor(use_dipeptide=True)
    
    print("Feature extraction configuration:")
    print(f"  Amino acid composition: 20 features")
    print(f"  Sequence length: 1 feature")
    print(f"  Physicochemical properties: 6 features")
    print(f"  Dipeptide composition: {'400 features' if extractor.use_dipeptide else 'Not used'}")
    print(f"  Total features: {len(extractor.feature_names)}\n")
    
    # Extract features for all datasets
    X_train, y_train = extractor.extract_batch(train_data['sequences'], train_data['labels'])
    X_val, y_val = extractor.extract_batch(val_data['sequences'], val_data['labels'])
    X_test, y_test = extractor.extract_batch(test_data['sequences'], test_data['labels'])
    
    feature_names = extractor.get_feature_names()
    logger.log(f"Feature extraction complete: {X_train.shape[1]} features")
    
    # =========================================================================
    # 3. MODEL TRAINING
    # =========================================================================
    print_section_header("STEP 3: MODEL TRAINING")
    
    predictor = ToxicityPredictor()
    
    training_results = predictor.train(
        X_train=X_train,
        y_train=y_train,
        X_val=X_val,
        y_val=y_val,
        cv_folds=5
    )
    
    logger.log("Model training complete")
    
    # Save trained models
    predictor.save_models("results/trained_models.pkl")
    logger.log("Models saved")
    
    # =========================================================================
    # 4. EVALUATION
    # =========================================================================
    print_section_header("STEP 4: MODEL EVALUATION")
    
    evaluator = ModelEvaluator(output_dir="results")
    
    all_results = {}
    
    # Evaluate each model
    for model_name in ['Logistic Regression', 'Random Forest', 'SVM']:
        print(f"\n{'='*70}")
        print(f"Evaluating {model_name}")
        print(f"{'='*70}")
        
        # Validation set evaluation
        print("\n--- VALIDATION SET ---")
        y_val_pred = predictor.predict(X_val, model_name)
        y_val_proba = predictor.predict_proba(X_val, model_name)[:, 1]
        
        val_metrics = evaluator.evaluate_model(y_val, y_val_pred, y_val_proba, model_name)
        
        # Test set evaluation
        print("\n--- TEST SET (INDEPENDENT) ---")
        y_test_pred = predictor.predict(X_test, model_name)
        y_test_proba = predictor.predict_proba(X_test, model_name)[:, 1]
        
        test_metrics = evaluator.evaluate_model(y_test, y_test_pred, y_test_proba, model_name)
        
        # Store results
        all_results[model_name] = {
            'validation': val_metrics,
            'test': test_metrics,
            'training': training_results[model_name]
        }
        
        # Generate visualizations
        evaluator.plot_confusion_matrix(test_metrics['confusion_matrix'], model_name, "Test")
        evaluator.plot_roc_curve(y_test, y_test_proba, model_name, "Test")
        
        # Feature importance (for Random Forest and Logistic Regression)
        importance = predictor.get_feature_importance(model_name, feature_names)
        if importance is not None:
            evaluator.plot_feature_importance(importance, feature_names, model_name)
    
    # Compare models
    test_results_only = {name: res['test'] for name, res in all_results.items()}
    evaluator.compare_models(test_results_only, metric='f1_score')
    evaluator.compare_models(test_results_only, metric='roc_auc')
    
    logger.log("Model evaluation complete")
    
    # =========================================================================
    # 5. BIOLOGICAL INTERPRETATION
    # =========================================================================
    print_section_header("STEP 5: BIOLOGICAL INTERPRETATION")
    
    analyzer = BiologicalAnalyzer(output_dir="results")
    
    # Analyze test set (independent data)
    analyzer.analyze_amino_acid_distribution(test_data['sequences'], y_test)
    analyzer.analyze_physicochemical_properties(X_test, y_test, feature_names)
    analyzer.analyze_length_distribution(test_data['sequences'], y_test)
    
    logger.log("Biological analysis complete")
    
    # =========================================================================
    # 6. SAVE RESULTS
    # =========================================================================
    print_section_header("STEP 6: SAVING RESULTS")
    
    # Save comprehensive results
    save_results(all_results, "results/evaluation_results.json")
    
    # Print summary
    print("\n" + "="*70)
    print("PIPELINE COMPLETE")
    print("="*70)
    print("\nFinal Test Set Performance Summary:")
    print(f"{'Model':<25} {'Accuracy':<12} {'F1-Score':<12} {'ROC-AUC':<12}")
    print("-" * 70)
    for model_name, results in all_results.items():
        test_res = results['test']
        print(f"{model_name:<25} {test_res['accuracy']:<12.4f} "
              f"{test_res['f1_score']:<12.4f} {test_res['roc_auc']:<12.4f}")
    
    print("\n✓ All results saved to: results/")
    print("✓ Visualizations: results/*.png")
    print("✓ Metrics: results/evaluation_results.json")
    print("✓ Trained models: results/trained_models.pkl")
    print("✓ Log file: results/pipeline.log")
    
    logger.log("Pipeline execution completed successfully")


if __name__ == "__main__":
    main()
