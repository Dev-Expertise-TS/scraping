'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface ScrapingRecord {
  id: string
  url: string
  web_html: string
  created_at: string
}

export default function HtmlViewerPage() {
  const params = useParams()
  const [record, setRecord] = useState<ScrapingRecord | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/scraping/${params.id}`)
        const data = await response.json()
        
        if (data.success) {
          setRecord(data.data)
        } else {
          setError(data.error)
        }
      } catch (error) {
        setError('데이터를 불러오는 중 오류가 발생했습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchRecord()
    }
  }, [params.id])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR')
  }

  const openInNewTab = () => {
    if (record?.web_html) {
      const newWindow = window.open('', '_blank')
      if (newWindow) {
        newWindow.document.write(record.web_html)
        newWindow.document.close()
      }
    }
  }

  const downloadHtml = () => {
    if (record?.web_html) {
      const blob = new Blob([record.web_html], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `scraped-${record.url.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().getTime()}.html`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-8">
            <p className="text-muted-foreground">로딩 중...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <Alert variant="destructive">
            <AlertDescription>
              ❌ {error}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  if (!record) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <Alert>
            <AlertDescription>
              데이터를 찾을 수 없습니다.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 space-y-6">
        {/* 헤더 정보 */}
        <Card>
          <CardHeader>
            <CardTitle>스크래핑된 웹페이지 뷰어</CardTitle>
            <CardDescription>
              스크래핑된 HTML 데이터를 웹페이지로 렌더링합니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">
                    <a 
                      href={record.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      {record.url}
                    </a>
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    스크래핑 시간: {formatDate(record.created_at)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    HTML 크기: {record.web_html.length.toLocaleString()} 문자
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={openInNewTab} variant="outline">
                    새 탭에서 열기
                  </Button>
                  <Button onClick={downloadHtml} variant="outline">
                    HTML 다운로드
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* HTML 렌더링 영역 */}
        <Card>
          <CardHeader>
            <CardTitle>렌더링된 웹페이지</CardTitle>
            <CardDescription>
              아래는 스크래핑된 HTML이 실제 웹페이지로 렌더링된 모습입니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <iframe
                srcDoc={record.web_html}
                className="w-full h-[600px] border-0"
                title={`스크래핑된 페이지: ${record.url}`}
                sandbox="allow-scripts allow-same-origin allow-forms"
              />
            </div>
          </CardContent>
        </Card>

        {/* 원본 HTML 코드 */}
        <Card>
          <CardHeader>
            <CardTitle>원본 HTML 코드</CardTitle>
            <CardDescription>
              스크래핑된 원본 HTML 코드를 확인할 수 있습니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <pre className="bg-gray-100 p-4 text-sm overflow-auto max-h-96">
                <code>{record.web_html}</code>
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
