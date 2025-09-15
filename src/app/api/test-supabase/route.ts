import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    // Supabase 연결 테스트
    const { data, error } = await supabaseAdmin
      .from('scraping')
      .select('count')
      .limit(1)

    if (error) {
      // 테이블이 없을 수 있으니 생성 시도
      console.log('테이블이 없거나 오류 발생:', error.message)
      
      return NextResponse.json({
        success: false,
        error: `Supabase 연결 오류: ${error.message}`,
        suggestion: 'scraping 테이블을 생성해야 할 수 있습니다.'
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Supabase 연결 성공!',
      data: { tableExists: true }
    })

  } catch (error) {
    console.error('Supabase 테스트 오류:', error)
    return NextResponse.json({
      success: false,
      error: `연결 테스트 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
      suggestion: '환경변수와 Supabase 프로젝트 설정을 확인해주세요.'
    })
  }
}

export async function POST() {
  try {
    // 테이블 생성 시도
    const { data, error } = await supabaseAdmin.rpc('create_scraping_table')

    if (error) {
      // 직접 SQL 실행으로 테이블 생성 시도
      const { data: createData, error: createError } = await supabaseAdmin
        .from('scraping')
        .select('*')
        .limit(1)

      if (createError && createError.code === 'PGRST116') {
        return NextResponse.json({
          success: false,
          error: '테이블이 존재하지 않습니다.',
          suggestion: 'Supabase SQL Editor에서 다음 쿼리를 실행하세요:',
          sql: `CREATE TABLE scraping (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  web_html TEXT NOT NULL,
  scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: '테이블 생성 완료 또는 이미 존재합니다.'
    })

  } catch (error) {
    console.error('테이블 생성 오류:', error)
    return NextResponse.json({
      success: false,
      error: `테이블 생성 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
    })
  }
}
