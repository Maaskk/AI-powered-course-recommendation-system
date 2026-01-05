<template>
  <div class="flex flex-col min-h-screen">
    <AppHeader />
    
    <main class="flex-1 w-full flex justify-center">
      <div class="mx-auto max-w-7xl px-6 flex flex-col">
        
        <section class="flex flex-col items-center text-center pt-32 pb-24 gap-8">
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <div class="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
            AI-Powered Bioinformatics Platform
          </div>
          
          <h1 class="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight">
            Peptide Toxicity
            <span class="bg-gradient-to-r from-primary via-blue-500 to-purple-500 bg-clip-text text-transparent block">Prediction</span>
          </h1>
          
          <p class="text-lg sm:text-xl text-muted-foreground max-w-2xl">
            Advanced machine learning platform for predicting peptide toxicity with professional-grade accuracy and detailed biological analysis.
          </p>
          
          <button 
            @click="router.push('/predict')" 
            class="px-12 py-4 bg-gradient-to-r from-primary to-blue-600 text-primary-foreground rounded-xl font-semibold hover:from-primary/90 hover:to-blue-600/90 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 cursor-pointer text-base sm:text-lg">
            Start Prediction
          </button>
        </section>

        <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-32">
          <div 
            v-for="stat in stats" 
            :key="stat.title" 
            class="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
            <div class="flex items-start justify-between mb-4">
              <div :class="`w-14 h-14 rounded-xl ${stat.color} flex items-center justify-center shadow-lg`">
                <component :is="stat.icon" class="w-7 h-7 text-white" />
              </div>
            </div>
            <div class="text-4xl font-bold mb-2">{{ stat.value }}</div>
            <div class="text-base text-muted-foreground font-medium">{{ stat.title }}</div>
          </div>
        </section>

        <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 py-20">
          <div 
            v-for="feature in features" 
            :key="feature.title" 
            class="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
            <div :class="`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4 shadow-lg`">
              <component :is="feature.icon" class="w-6 h-6 text-white" />
            </div>
            <h3 class="font-semibold text-lg mb-2">{{ feature.title }}</h3>
            <p class="text-sm text-muted-foreground leading-relaxed">{{ feature.description }}</p>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Dna, Brain, BarChart3, Zap, Shield, TrendingUp, Database, Activity } from 'lucide-vue-next'
import AppHeader from '../components/AppHeader.vue'

const router = useRouter()

const stats = [
  {
    title: 'Prediction Accuracy',
    value: '89.5%',
    icon: TrendingUp,
    color: 'bg-blue-500'
  },
  {
    title: 'ML Models',
    value: '4',
    icon: Brain,
    color: 'bg-purple-500'
  },
  {
    title: 'Processing Speed',
    value: '<100ms',
    icon: Zap,
    color: 'bg-amber-500'
  }
]

const features = [
  {
    title: 'Multiple ML Models',
    description: 'Logistic Regression, Random Forest, SVM, and Ensemble predictions',
    icon: Brain,
    color: 'bg-blue-500'
  },
  {
    title: 'Feature Extraction',
    description: 'AAC, physicochemical properties, and dipeptide composition',
    icon: Dna,
    color: 'bg-purple-500'
  },
  {
    title: 'Batch Processing',
    description: 'Analyze multiple sequences simultaneously with detailed reports',
    icon: Database,
    color: 'bg-green-500'
  },
  {
    title: 'Real-time Analysis',
    description: 'Instant predictions with confidence scores and visualizations',
    icon: Activity,
    color: 'bg-amber-500'
  }
]
</script>
