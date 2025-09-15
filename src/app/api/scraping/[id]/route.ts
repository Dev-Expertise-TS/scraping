import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: 'ID가 필요합니다.' },
        { status: 400 }
      )
    }

    console.log('스크래핑 데이터 조회:', id)

    // 특정 스크래핑 레코드 조회
    const { data, error } = await supabaseAdmin
      .from('scraping')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('스크래핑 데이터 조회 오류:', error)
      
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { 
            success: false, 
            error: '해당 스크래핑 데이터를 찾을 수 없습니다.' 
          },
          { status: 404 }
        )
      }
      
      return NextResponse.json(
        { 
          success: false, 
          error: `데이터 조회 실패: ${error.message}` 
        },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { 
          success: false, 
          error: '스크래핑 데이터를 찾을 수 없습니다.' 
        },
        { status: 404 }
      )
    }

    console.log('스크래핑 데이터 조회 완료:', data.url)

    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        url: data.url,
        web_html: data.web_html,
        created_at: data.created_at
      }
    })

  } catch (error) {
    console.error('API 오류:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: `서버 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}` 
      },
      { status: 500 }
    )
  }
}
