"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { Loader2, Check, Search } from "lucide-react"
import { toast } from "sonner"
import { getInterestsForMajor } from "@/lib/major-interests"
import { MAJORS } from "@/lib/majors-list"

export default function OnboardingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    major: "",
    year: "",
    interests: [] as string[],
  })
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (!response.ok) {
        router.push("/login")
        return
      }
    } catch {
      router.push("/login")
    } finally {
      setChecking(false)
    }
  }

  // Filter majors based on search
  const filteredMajors = useMemo(() => {
    if (!searchQuery) return MAJORS
    const query = searchQuery.toLowerCase()
    return MAJORS.filter((major) => major.toLowerCase().includes(query))
  }, [searchQuery])

  // Get interests for selected major
  const availableInterests = useMemo(() => {
    if (!formData.major) return []
    return getInterestsForMajor(formData.major)
  }, [formData.major])

  // Filter interests based on search
  const filteredInterests = useMemo(() => {
    if (!searchQuery) return availableInterests
    const query = searchQuery.toLowerCase()
    return availableInterests.filter((interest) => interest.toLowerCase().includes(query))
  }, [availableInterests, searchQuery])

  const toggleInterest = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          major: formData.major,
          year: parseInt(formData.year),
          interests: formData.interests.join(", "),
          onboarded: true,
        }),
      })

      if (response.ok) {
        toast.success("Profile saved!")
        router.push("/dashboard")
        router.refresh()
      } else {
        throw new Error("Failed to save")
      }
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex h-16 items-center justify-between">
            <Logo size="md" />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main */}
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-4xl space-y-6">
          {/* Progress */}
          <div className="flex gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  s <= step ? "bg-blue-600 dark:bg-blue-500" : "bg-slate-200 dark:bg-slate-800"
                }`}
              />
            ))}
          </div>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              {step === 1 && "What's your major?"}
              {step === 2 && "Which year are you in?"}
              {step === 3 && "Your interests"}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Step {step} of 3
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-lg">
            {/* Step 1: Major */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Search majors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-[500px] overflow-y-auto">
                  {filteredMajors.length === 0 ? (
                    <div className="col-span-full text-center py-8 text-slate-500">
                      No majors found matching "{searchQuery}"
                    </div>
                  ) : (
                    filteredMajors.map((major) => (
                      <button
                        key={major}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, major, interests: [] })
                          setSearchQuery("")
                          setStep(2)
                        }}
                        className={`p-3 rounded-lg text-sm text-left transition-all ${
                          formData.major === major
                            ? "border-2 border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-100"
                            : "border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                        }`}
                      >
                        {major}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Year */}
            {step === 2 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { value: "1", label: "1st Year", desc: "Freshman" },
                  { value: "2", label: "2nd Year", desc: "Sophomore" },
                  { value: "3", label: "3rd Year", desc: "Junior" },
                  { value: "4", label: "4th Year", desc: "Senior" },
                  { value: "5", label: "Graduate", desc: "Master's/PhD" },
                ].map((year) => (
                  <button
                    key={year.value}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, year: year.value })
                      setStep(3)
                    }}
                    className={`p-4 rounded-lg text-left transition-all border-2 ${
                      formData.year === year.value
                        ? "border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                        : "border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <div className="font-semibold text-slate-900 dark:text-white">{year.label}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{year.desc}</div>
                  </button>
                ))}
              </div>
            )}

            {/* Step 3: Interests */}
            {step === 3 && (
              <div className="space-y-4">
                {formData.major && (
                  <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-3 text-sm text-blue-800 dark:text-blue-200">
                    Showing interests related to <strong>{formData.major}</strong>
                  </div>
                )}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Search interests..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-[400px] overflow-y-auto">
                  {filteredInterests.length === 0 ? (
                    <div className="col-span-full text-center py-8 text-slate-500">
                      {availableInterests.length === 0
                        ? "Select a major first to see related interests"
                        : `No interests found matching "${searchQuery}"`}
                    </div>
                  ) : (
                    filteredInterests.map((interest) => (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => toggleInterest(interest)}
                        className={`p-3 rounded-lg text-sm text-left transition-all border flex items-center gap-2 ${
                          formData.interests.includes(interest)
                            ? "border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                            : "border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                        }`}
                      >
                        {formData.interests.includes(interest) && (
                          <Check className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
                        )}
                        <span className="truncate">{interest}</span>
                      </button>
                    ))
                  )}
                </div>
                <div className="flex items-center justify-between pt-2">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Selected: {formData.interests.length} / 2 minimum
                  </p>
                  <Button
                    onClick={handleSubmit}
                    disabled={loading || formData.interests.length < 2}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Complete Profile"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {step > 1 && (
            <button
              onClick={() => {
                setStep(step - 1)
                setSearchQuery("")
              }}
              className="block mx-auto text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              ← Back
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
