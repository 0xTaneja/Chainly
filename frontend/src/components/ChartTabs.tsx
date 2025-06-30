import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import AxiomChartPanel from '@/components/AxiomChartPanel'
import ExecutionsChartPanel from '@/components/ExecutionsChartPanel'

interface Props {
  token: string
}

export default function ChartTabs({ token }: Props) {
  return (
    <Tabs defaultValue="price" className="flex flex-col flex-1">
      <TabsList className="w-fit bg-gray-900 mb-3">
        <TabsTrigger value="price">Price</TabsTrigger>
        <TabsTrigger value="exec">Executions</TabsTrigger>
      </TabsList>
      <TabsContent value="price" className="flex-1">
        <AxiomChartPanel token={token} />
      </TabsContent>
      <TabsContent value="exec" className="flex-1">
        <ExecutionsChartPanel token={token} />
      </TabsContent>
    </Tabs>
  )
} 