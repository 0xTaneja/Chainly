import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import NewsFeed from './NewsFeed'
import HighImpactNews from './HighImpactNews'
import BreakingNewsBanner from './BreakingNewsBanner'

export default function InfoPanel() {
  const [activeTab, setActiveTab] = useState('newsfeed')

  return (
    <div className="rounded-lg bg-axCard p-4 border border-gray-800">
      <BreakingNewsBanner />
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-900 mb-3 w-full">
          <TabsTrigger value="news" className="data-[state=active]:bg-gray-800">
            Latest News
          </TabsTrigger>
          <TabsTrigger value="newsfeed" className="data-[state=active]:bg-gray-800">
            News Feed
          </TabsTrigger>
        </TabsList>

        <TabsContent value="news">
          <HighImpactNews />
        </TabsContent>

        <TabsContent value="newsfeed" className="h-[350px]">
          <NewsFeed />
        </TabsContent>
      </Tabs>
    </div>
  )
} 