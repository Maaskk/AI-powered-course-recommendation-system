"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import type { Student } from "@/lib/api"

interface StudentFormProps {
  onSubmit: (student: Omit<Student, "id" | "created_at">) => Promise<void>
}

export function StudentForm({ onSubmit }: StudentFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    user_id: "",
    name: "",
    email: "",
    major: "",
    year: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await onSubmit({
        user_id: formData.user_id,
        name: formData.name,
        email: formData.email || undefined,
        major: formData.major || undefined,
        year: formData.year ? Number.parseInt(formData.year) : undefined,
      })

      // Reset form
      setFormData({
        user_id: "",
        name: "",
        email: "",
        major: "",
        year: "",
      })
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="user_id">
            Student ID <span className="text-destructive">*</span>
          </Label>
          <Input
            id="user_id"
            value={formData.user_id}
            onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
            placeholder="e.g., STU001"
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">
            Full Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., John Doe"
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="e.g., john@university.edu"
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="major">Major</Label>
          <Input
            id="major"
            value={formData.major}
            onChange={(e) => setFormData({ ...formData, major: e.target.value })}
            placeholder="e.g., Computer Science"
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="year">Year</Label>
          <Input
            id="year"
            type="number"
            min="1"
            max="6"
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
            placeholder="e.g., 2"
            disabled={loading}
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Student Profile
        </Button>
      </form>
    </Card>
  )
}
