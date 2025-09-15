import { ScrapingForm } from '@/components/ScrapingForm'
import { ScrapingHistory } from '@/components/ScrapingHistory'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            웹사이트 스크래핑 도구
          </h1>
          <p className="text-gray-600 mb-4">
            Playwright를 사용하여 웹사이트의 HTML을 추출하고 Supabase에 저장합니다.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">✨ 새로운 기능!</h2>
            <p className="text-blue-800 text-sm">
              스크래핑한 HTML 데이터를 실제 웹페이지로 렌더링하여 볼 수 있습니다. 
              히스토리에서 "📄 뷰어로 보기" 버튼을 클릭해보세요!
            </p>
          </div>
        </div>
        
        <ScrapingForm />
        <ScrapingHistory />
      </div>
    </div>
  )
}
