import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    // 테이블 구조: url (varchar), web_html (varchar), created_at (now())
    const { data: sampleData, error: sampleError } = await supabaseAdmin
      .from('scraping')
      .select('*')
      .limit(1)

    if (sampleError) {
      return NextResponse.json({
        success: false,
        error: `테이블 접근 오류: ${sampleError.message}`,
        code: sampleError.code,
        hint: sampleError.hint
      })
    }

    return NextResponse.json({
      success: true,
      message: '테이블 접근 성공',
      tableExists: true,
      tableStructure: {
        url: 'varchar',
        web_html: 'varchar', 
        created_at: 'timestamp (auto-generated with now())'
      },
      sampleData: sampleData,
      availableColumns: sampleData && sampleData.length > 0 ? Object.keys(sampleData[0]) : ['url', 'web_html', 'created_at'],
      recordCount: sampleData ? sampleData.length : 0
    })

  } catch (error) {
    console.error('테이블 구조 확인 오류:', error)
    return NextResponse.json({
      success: false,
      error: `테이블 구조 확인 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
    })
  }
}
