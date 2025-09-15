import { NextRequest, NextResponse } from 'next/server'
import { scrapeWebsite } from '@/lib/scraping'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url } = body

    if (!url) {
      return NextResponse.json(
        { error: 'URL이 필요합니다.' },
        { status: 400 }
      )
    }

    console.log('테스트 스크래핑 시작:', url)
    const result = await scrapeWebsite(url)

    return NextResponse.json({
      success: result.success,
      message: result.success ? '테스트 스크래핑 완료' : '테스트 스크래핑 실패',
      data: result.success ? {
        url: result.url,
        htmlLength: result.htmlLength
      } : null,
      error: result.error
    })

  } catch (error) {
    console.error('테스트 스크래핑 오류:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: `테스트 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}` 
      },
      { status: 500 }
    )
  }
}
