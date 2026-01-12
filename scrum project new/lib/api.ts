/**
 * Client-side API utilities
 */

export interface Student {
  id?: number
  user_id: string
  name: string
  email?: string
  major?: string
  year?: number
  created_at?: string
}

export interface Recommendation {
  id?: number
  item_id: string
  title: string
  description?: string
  url?: string
  predicted_rating: number
  avg_rating: number
  num_ratings: number
  confidence: number
  created_at?: string
}

export interface PopularItem {
  item_id: string
  title: string
  description?: string
  url?: string
  predicted_rating: number
  avg_rating: number
  num_ratings: number
  confidence: number
}

export class ApiClient {
  private baseUrl: string

  constructor(baseUrl = "/api") {
    this.baseUrl = baseUrl
  }

  // Students
  async createStudent(student: Omit<Student, "id" | "created_at">): Promise<Student> {
    const response = await fetch(`${this.baseUrl}/students`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(student),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to create student")
    }

    const data = await response.json()
    return data.student
  }

  async getStudent(userId: string): Promise<Student> {
    const response = await fetch(`${this.baseUrl}/students/${userId}`)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to fetch student")
    }

    const data = await response.json()
    return data.student
  }

  async getAllStudents(): Promise<Student[]> {
    const response = await fetch(`${this.baseUrl}/students`)

    if (!response.ok) {
      throw new Error("Failed to fetch students")
    }

    const data = await response.json()
    return data.students
  }

  // Recommendations
  async generateRecommendations(userId: string, topN = 10): Promise<Recommendation[]> {
    const response = await fetch(`${this.baseUrl}/recommendations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, top_n: topN }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to generate recommendations")
    }

    const data = await response.json()
    return data.recommendations
  }

  async getRecommendations(userId: string, limit = 10): Promise<Recommendation[]> {
    const response = await fetch(`${this.baseUrl}/recommendations?user_id=${userId}&limit=${limit}`)

    if (!response.ok) {
      throw new Error("Failed to fetch recommendations")
    }

    const data = await response.json()
    return data.recommendations
  }

  // Popular items
  async getPopularItems(topN = 20): Promise<PopularItem[]> {
    const response = await fetch(`${this.baseUrl}/popular?top_n=${topN}`)

    if (!response.ok) {
      throw new Error("Failed to fetch popular items")
    }

    const data = await response.json()
    return data.items
  }

  // Ratings
  async saveRating(userId: string, itemId: string, rating: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/ratings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, item_id: itemId, rating }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to save rating")
    }
  }

  async getUserRatings(userId: string): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/ratings?user_id=${userId}`)

    if (!response.ok) {
      throw new Error("Failed to fetch ratings")
    }

    const data = await response.json()
    return data.ratings
  }

  // Health
  async checkHealth(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/health`)
    return response.json()
  }
}

export const api = new ApiClient()
