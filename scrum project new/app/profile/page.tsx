"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { Loader2, ArrowLeft, Search, Check } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { MAJORS } from "@/lib/majors-list"
import { getInterestsForMajor } from "@/lib/major-interests"

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [profile, setProfile] = useState({
    name: "",
    major: "",
    year: "2",
    gpa: "",
  })
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [majorSearch, setMajorSearch] = useState("")
  const [interestSearch, setInterestSearch] = useState("")

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const data = await response.json()
        if (data.user) {
          setProfile({
            name: data.user.name || "",
            major: data.user.major || "",
            year: data.user.year?.toString() || "2",
            gpa: data.user.gpa?.toString() || "",
          })
          if (data.user.interests) {
            setSelectedInterests(
              data.user.interests
                .split(",")
                .map((i: string) => i.trim())
                .filter(Boolean)
            )
          }
        }
      }
    } catch (error) {
      console.error("Error loading profile:", error)
    } finally {
      setLoadingProfile(false)
    }
  }

  const filteredMajors = useMemo(() => {
    if (!majorSearch) return MAJORS
    const query = majorSearch.toLowerCase()
    return MAJORS.filter((major) => major.toLowerCase().includes(query))
  }, [majorSearch])

  const availableInterests = useMemo(() => {
    if (!profile.major) return []
    return getInterestsForMajor(profile.major)
  }, [profile.major])

  const filteredInterests = useMemo(() => {
    if (!interestSearch) return availableInterests
    const query = interestSearch.toLowerCase()
    return availableInterests.filter((interest) => interest.toLowerCase().includes(query))
  }, [availableInterests, interestSearch])

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          major: profile.major,
          year: parseInt(profile.year),
          gpa: profile.gpa ? parseFloat(profile.gpa) : undefined,
          interests: selectedInterests.join(", "),
        }),
      })

      if (response.ok) {
        toast.success("Profile updated successfully!")
        router.push("/dashboard")
        router.refresh()
      } else {
        const data = await response.json()
        throw new Error(data.error || "Failed to update profile")
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  if (loadingProfile) {
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
      <div className="container mx-auto px-4 md:px-6 py-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Edit Profile</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            Update your information to get better course recommendations
          </p>

          <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-lg">
            <div>
              <Label htmlFor="name" className="text-slate-900 dark:text-white">Full Name</Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                placeholder="Your name"
                required
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="major" className="text-slate-900 dark:text-white">Major</Label>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search majors..."
                  value={majorSearch}
                  onChange={(e) => setMajorSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                id="major"
                value={profile.major}
                onChange={(e) => {
                  setProfile({ ...profile, major: e.target.value })
                  setSelectedInterests([])
                  setInterestSearch("")
                }}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring mt-2"
                required
              >
                <option value="">Select your major</option>
                {filteredMajors.map((major) => (
                  <option key={major} value={major}>
                    {major}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="year" className="text-slate-900 dark:text-white">Academic Year</Label>
                <select
                  id="year"
                  value={profile.year}
                  onChange={(e) => setProfile({ ...profile, year: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring mt-2"
                  required
                >
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                  <option value="5">Graduate</option>
                </select>
              </div>

              <div>
                <Label htmlFor="gpa" className="text-slate-900 dark:text-white">GPA (Optional)</Label>
                <Input
                  id="gpa"
                  type="number"
                  step="0.01"
                  min="0"
                  max="4"
                  value={profile.gpa}
                  onChange={(e) => setProfile({ ...profile, gpa: e.target.value })}
                  placeholder="3.50"
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <Label className="text-slate-900 dark:text-white">Interests</Label>
              {profile.major && (
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-3 text-sm text-blue-800 dark:text-blue-200 mb-3">
                  Showing interests related to <strong>{profile.major}</strong>
                </div>
              )}
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search interests..."
                  value={interestSearch}
                  onChange={(e) => setInterestSearch(e.target.value)}
                  className="pl-10"
                  disabled={!profile.major}
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-3 max-h-[300px] overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-lg p-3">
                {!profile.major ? (
                  <div className="col-span-full text-center py-8 text-slate-500">
                    Select a major first to see related interests
                  </div>
                ) : filteredInterests.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-slate-500">
                    No interests found matching "{interestSearch}"
                  </div>
                ) : (
                  filteredInterests.map((interest) => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`p-2 rounded-lg text-sm text-left transition-all border flex items-center gap-2 ${
                        selectedInterests.includes(interest)
                          ? "border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                          : "border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      {selectedInterests.includes(interest) && (
                        <Check className="h-3 w-3 shrink-0 text-blue-600 dark:text-blue-400" />
                      )}
                      <span className="truncate">{interest}</span>
                    </button>
                  ))
                )}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                Selected: {selectedInterests.length} interests
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Profile"
                )}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push("/dashboard")}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
