"use client"

import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { AuthForm } from "@/components/auth-form"
import Link from "next/link"

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex h-16 items-center justify-between">
            <Logo size="md" />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main */}
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create account</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Get started with LearnPath</p>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-6">
            <AuthForm mode="register" />
          </div>

          <p className="text-center text-sm text-slate-600 dark:text-slate-400">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-slate-900 dark:text-white hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
