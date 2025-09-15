import { chromium, Browser, Page } from 'playwright'
import { supabaseAdmin } from './supabase'

export interface ScrapingResult {
  success: boolean
  html?: string
  error?: string
  url: string
  htmlLength?: number
}

export async function scrapeWebsite(url: string): Promise<ScrapingResult> {
  let browser: Browser | null = null
  
  try {
    console.log('스크래핑 시작:', url)
    
    // URL 유효성 검사
    if (!url || !url.startsWith('http')) {
      throw new Error('유효한 URL을 입력해주세요. (http:// 또는 https://로 시작해야 합니다)')
    }

    // 브라우저 실행
    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    })

    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 }
    })

    const page: Page = await context.newPage()

    // 페이지 로드 타임아웃 설정 (30초)
    await page.goto(url, { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    })

    // 추가 대기 (JavaScript 로딩 완료)
    await page.waitForTimeout(2000)

    // HTML 내용 가져오기
    const html = await page.content()
    console.log('HTML 추출 완료, 크기:', html.length)

    // Supabase에 저장 (정확한 테이블 구조에 맞춤)
    // 테이블 구조: url (varchar), web_html (varchar), created_at (now())
    const insertData = {
      url: url,
      web_html: html
      // created_at은 자동으로 now() 함수로 설정됨
    }

    console.log('저장할 데이터:', insertData)

    const { data, error } = await supabaseAdmin
      .from('scraping')
      .insert([insertData])
      .select()

    if (error) {
      console.error('Supabase 저장 오류:', error)
      throw new Error(`데이터베이스 저장 실패: ${error.message}`)
    }

    console.log('Supabase 저장 완료:', data)

    return {
      success: true,
      html: html,
      url: url,
      htmlLength: html.length
    }

  } catch (error) {
    console.error('스크래핑 오류:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
      url: url
    }
  } finally {
    if (browser) {
      await browser.close()
      console.log('브라우저 종료')
    }
  }
}

export async function getScrapingHistory(): Promise<any[]> {
  try {
    console.log('히스토리 조회 시작')
    
    // 테이블 구조: url (varchar), web_html (varchar), created_at (now())
    const { data, error } = await supabaseAdmin
      .from('scraping')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('히스토리 조회 오류:', error)
      throw new Error(`데이터 조회 실패: ${error.message}`)
    }

    console.log('히스토리 조회 완료:', data?.length || 0, '개 항목')
    return data || []
  } catch (error) {
    console.error('스크래핑 히스토리 조회 오류:', error)
    return []
  }
}
