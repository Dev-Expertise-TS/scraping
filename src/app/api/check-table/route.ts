import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    // 테이블 구조 확인
    const { data, error } = await supabaseAdmin
      .from('scraping')
      .select('*')
      .limit(1)

    if (error) {
      return NextResponse.json({
        success: false,
        error: `테이블 접근 오류: ${error.message}`,
        code: error.code
      })
    }

    // 테이블 정보 조회 (간단한 방식으로 변경)
    let tableInfo = null
    try {
      // 테이블의 컬럼 정보를 간단히 확인
      const { data: columns } = await supabaseAdmin
        .from('scraping')
        .select('*')
        .limit(0)
      
      tableInfo = { columns: '테이블 접근 가능' }
    } catch (error) {
      tableInfo = { error: '테이블 정보 조회 실패' }
    }

    return NextResponse.json({
      success: true,
      message: '테이블 접근 성공',
      tableExists: true,
      sampleData: data,
      tableInfo: tableInfo
    })

  } catch (error) {
    console.error('테이블 확인 오류:', error)
    return NextResponse.json({
      success: false,
      error: `테이블 확인 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
    })
  }
}
