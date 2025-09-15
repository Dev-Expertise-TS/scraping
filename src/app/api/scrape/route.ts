import { NextRequest, NextResponse } from 'next/server'
import { scrapeWebsite, getScrapingHistory } from '@/lib/scraping'

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

    const result = await scrapeWebsite(url)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: '스크래핑이 완료되었습니다.',
        data: {
          url: result.url,
          htmlLength: result.html?.length || 0
        }
      })
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error 
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('API 오류:', error)
    
    // 환경변수 관련 오류인지 확인
    if (error instanceof Error && error.message.includes('환경변수')) {
      return NextResponse.json(
        { 
          success: false, 
          error: `설정 오류: ${error.message}` 
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: `서버 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}` 
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    console.log('히스토리 조회 API 호출')
    const history = await getScrapingHistory()
    
    return NextResponse.json({
      success: true,
      data: history,
      count: history.length
    })
  } catch (error) {
    console.error('히스토리 조회 오류:', error)
    
    // 환경변수 관련 오류인지 확인
    if (error instanceof Error && error.message.includes('환경변수')) {
      return NextResponse.json(
        { 
          success: false, 
          error: `설정 오류: ${error.message}` 
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: `히스토리 조회 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}` 
      },
      { status: 500 }
    )
  }
}
