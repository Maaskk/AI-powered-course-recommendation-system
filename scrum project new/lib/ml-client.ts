/**
 * Client for communicating with Python ML API
 */

const ML_API_URL = process.env.ML_API_URL || "http://localhost:5000"

export interface Recommendation {
  item_id: string
  title: string
  description: string
  url: string
  predicted_rating: number
  avg_rating: number
  num_ratings: number
  confidence: number
}

export interface RecommendationResponse {
  user_id: string
  recommendations: Recommendation[]
  count: number
}

export interface PopularItemsResponse {
  items: Recommendation[]
  count: number
}

export class MLClient {
  private baseUrl: string

  constructor(baseUrl: string = ML_API_URL) {
    this.baseUrl = baseUrl
  }

  async getRecommendations(userId: string, topN = 10): Promise<RecommendationResponse> {
    const response = await fetch(`${this.baseUrl}/recommend`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: userId,
        top_n: topN,
      }),
    })

    if (!response.ok) {
      throw new Error(`ML API error: ${response.statusText}`)
    }

    return response.json()
  }

  async getPopularItems(topN = 20): Promise<PopularItemsResponse> {
    const response = await fetch(`${this.baseUrl}/items/popular?top_n=${topN}`)

    if (!response.ok) {
      throw new Error(`ML API error: ${response.statusText}`)
    }

    return response.json()
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`)
      const data = await response.json()
      return data.status === "healthy" && data.model_loaded
    } catch {
      return false
    }
  }
}

export const mlClient = new MLClient()
