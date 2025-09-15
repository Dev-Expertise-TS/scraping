export interface ScrapingRecord {
  id: string
  url: string
  web_html: string
  created_at: string
}

export interface ScrapingResult {
  success: boolean
  message?: string
  error?: string
  data?: {
    url: string
    htmlLength: number
  }
}

export interface ScrapingApiResponse {
  success: boolean
  message?: string
  error?: string
  data?: ScrapingRecord[] | {
    url: string
    htmlLength: number
  }
}
