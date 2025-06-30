import { TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Props {
  activeTab: string
}

export default function NewsFilters({ activeTab }: Props) {
  return (
    <TabsList className="bg-gray-900 w-full justify-start">
      <TabsTrigger value="all" className="data-[state=active]:bg-gray-800">
        All
      </TabsTrigger>
      <TabsTrigger value="bullish" className="data-[state=active]:bg-gray-800">
        Bullish
      </TabsTrigger>
      <TabsTrigger value="bearish" className="data-[state=active]:bg-gray-800">
        Bearish
      </TabsTrigger>
    </TabsList>
  )
} 