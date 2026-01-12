"use client"

import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { ClientIcon } from "@/components/client-icon"
import { ArrowRight, BookOpen, Users, BarChart2, Sparkles, CheckCircle2 } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex h-16 items-center justify-between">
            <Logo size="md" />
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button size="sm" asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                <Link href="/register">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 md:px-6 py-20 md:py-32">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 px-4 py-2 text-sm text-blue-700 dark:text-blue-300 mb-4">
            <ClientIcon icon={Sparkles} className="h-4 w-4" suppressHydrationWarning />
            <span>AI-Powered Course Recommendations</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
            Find courses that{" "}
            <span className="text-blue-600 dark:text-blue-400">actually fit</span> your goals
          </h1>
          
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Smart course recommendations based on 50,000+ student reviews. 
            Tell us what you're studying, and we'll show you what works.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Button size="lg" asChild className="bg-blue-600 hover:bg-blue-700 text-white">
              <Link href="/register">
                Get Started Free
                <ClientIcon icon={ArrowRight} className="ml-2 h-4 w-4" suppressHydrationWarning />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="flex items-center justify-center gap-6 pt-8 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <ClientIcon icon={CheckCircle2} className="h-4 w-4 text-emerald-500" suppressHydrationWarning />
              <span>Free to use</span>
            </div>
            <div className="flex items-center gap-2">
              <ClientIcon icon={CheckCircle2} className="h-4 w-4 text-emerald-500" suppressHydrationWarning />
              <span>50K+ reviews</span>
            </div>
            <div className="flex items-center gap-2">
              <ClientIcon icon={CheckCircle2} className="h-4 w-4 text-emerald-500" suppressHydrationWarning />
              <span>All majors</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto px-4 md:px-6 py-12">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">50K+</div>
              <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Student Reviews</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">2,500+</div>
              <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Courses</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">94%</div>
              <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Match Accuracy</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 md:px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4">
            How it works
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Simple, fast, and personalized just for you
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-blue-100 dark:bg-blue-900/30">
              <ClientIcon icon={Users} className="h-7 w-7 text-blue-600 dark:text-blue-400" suppressHydrationWarning />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white">Create Profile</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Tell us your major, year, and interests
            </p>
          </div>
          
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-purple-100 dark:bg-purple-900/30">
              <ClientIcon icon={BarChart2} className="h-7 w-7 text-purple-600 dark:text-purple-400" suppressHydrationWarning />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white">AI Analyzes</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              We match you with similar students and courses
            </p>
          </div>
          
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-green-100 dark:bg-green-900/30">
              <ClientIcon icon={BookOpen} className="h-7 w-7 text-green-600 dark:text-green-400" suppressHydrationWarning />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white">Get Courses</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              See personalized recommendations with confidence scores
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 md:px-6 py-16">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to find your perfect courses?
          </h2>
          <p className="text-blue-100 mb-6 max-w-xl mx-auto">
            Join thousands of students discovering their ideal learning path
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/register">
              Get Started Free
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8">
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
          <Logo size="sm" />
          <p className="text-sm text-slate-500">Based on real student data</p>
        </div>
      </footer>
    </div>
  )
}
