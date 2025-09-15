'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface ScrapingResult {
  success: boolean
  message?: string
  error?: string
  data?: {
    url: string
    htmlLength: number
  }
}

export function ScrapingForm() {
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<ScrapingResult | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'testing' | 'connected' | 'error'>('unknown')

  const testConnection = async () => {
    setConnectionStatus('testing')
    try {
      // 먼저 테이블 확인
      const tableResponse = await fetch('/api/check-table')
      const tableData = await tableResponse.json()
      
      if (tableData.success) {
        setConnectionStatus('connected')
        console.log('테이블 확인 성공:', tableData)
      } else {
        setConnectionStatus('error')
        console.error('테이블 확인 오류:', tableData.error)
      }
    } catch (error) {
      setConnectionStatus('error')
      console.error('연결 테스트 오류:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!url.trim()) {
      setResult({
        success: false,
        error: 'URL을 입력해주세요.'
      })
      return
    }

    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() }),
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        error: '네트워크 오류가 발생했습니다.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>웹사이트 스크래핑</CardTitle>
        <CardDescription>
          URL을 입력하면 해당 사이트의 HTML을 읽어서 데이터베이스에 저장합니다.
        </CardDescription>
        <div className="flex items-center gap-2 mt-2">
          <Button 
            onClick={testConnection} 
            disabled={connectionStatus === 'testing'}
            variant="outline" 
            size="sm"
          >
            {connectionStatus === 'testing' ? '연결 테스트 중...' : '테이블 확인'}
          </Button>
          <Button 
            onClick={async () => {
              try {
                const response = await fetch('/api/table-structure')
                const data = await response.json()
                console.log('테이블 구조:', data)
                
                if (data.success) {
                  alert(`✅ 테이블 구조 확인 완료!\n\n📋 테이블 구조:\n- url: varchar\n- web_html: varchar\n- created_at: timestamp (자동 생성)\n\n📊 현재 데이터: ${data.recordCount}개 레코드`)
                } else {
                  alert(`❌ 테이블 구조 확인 실패\n오류: ${data.error}`)
                }
              } catch (error) {
                console.error('테이블 구조 확인 오류:', error)
                alert('❌ 테이블 구조 확인 실패')
              }
            }}
            variant="outline" 
            size="sm"
          >
            테이블 구조 확인
          </Button>
          <Button 
            onClick={async () => {
              const testUrl = 'https://httpbin.org/html' // 더 안정적인 테스트 URL
              setIsLoading(true)
              try {
                const response = await fetch('/api/test-scrape', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ url: testUrl })
                })
                const data = await response.json()
                setResult(data)
              } catch (error) {
                setResult({ success: false, error: '테스트 실패' })
              } finally {
                setIsLoading(false)
              }
            }}
            disabled={isLoading}
            variant="outline" 
            size="sm"
          >
            테스트 스크래핑
          </Button>
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${
              connectionStatus === 'connected' ? 'bg-green-500' :
              connectionStatus === 'error' ? 'bg-red-500' :
              connectionStatus === 'testing' ? 'bg-yellow-500' :
              'bg-gray-400'
            }`} />
            <span className="text-xs text-muted-foreground">
              {connectionStatus === 'connected' ? '연결됨' :
               connectionStatus === 'error' ? '연결 오류' :
               connectionStatus === 'testing' ? '테스트 중' :
               '연결 상태 미확인'}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="url" className="text-sm font-medium">
              웹사이트 URL
            </label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isLoading}
              className="w-full"
            />
          </div>
          
          <Button 
            type="submit" 
            disabled={isLoading || !url.trim()}
            className="w-full"
          >
            {isLoading ? '스크래핑 중...' : '스크래핑 시작'}
          </Button>
        </form>

        {result && (
          <div className="mt-6">
            {result.success ? (
              <Alert>
                <AlertDescription>
                  ✅ {result.message}
                  {result.data && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      <p>URL: {result.data.url}</p>
                      <p>HTML 크기: {result.data.htmlLength.toLocaleString()} 문자</p>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <AlertDescription>
                  ❌ {result.error}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
