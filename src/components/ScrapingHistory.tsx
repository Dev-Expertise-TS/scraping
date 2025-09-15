'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface ScrapingRecord {
  id: string
  url: string
  web_html: string
  created_at: string
}

export function ScrapingHistory() {
  const [history, setHistory] = useState<ScrapingRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchHistory = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/scrape')
      const data = await response.json()
      
      if (data.success) {
        setHistory(data.data)
      } else {
        setError(data.error)
      }
    } catch (error) {
      setError('히스토리를 불러오는 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR')
  }

  const formatHtmlLength = (html: string) => {
    return html.length.toLocaleString()
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>스크래핑 히스토리</CardTitle>
        <CardDescription>
          최근 스크래핑한 웹사이트들의 기록입니다.
        </CardDescription>
        <Button 
          onClick={fetchHistory} 
          disabled={isLoading}
          variant="outline"
          size="sm"
        >
          {isLoading ? '새로고침 중...' : '새로고침'}
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">로딩 중...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-destructive">{error}</p>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">스크래핑 기록이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((record) => (
              <Card key={record.id} className="border">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-sm">
                        <a 
                          href={record.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          {record.url}
                        </a>
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(record.created_at)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="text-xs text-muted-foreground">
                        HTML 크기: {formatHtmlLength(record.web_html)} 문자
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/view/${record.id}`}>
                          <Button size="sm" variant="outline">
                            📄 뷰어로 보기
                          </Button>
                        </Link>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            const newWindow = window.open('', '_blank')
                            if (newWindow) {
                              newWindow.document.write(record.web_html)
                              newWindow.document.close()
                            }
                          }}
                        >
                          🔗 새 탭에서 열기
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
