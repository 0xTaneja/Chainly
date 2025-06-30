'use client'

import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import PositionsTable from '@/components/PositionsTable'
import OpenOrdersTable from '@/components/OpenOrdersTable'
import TradeHistoryTable from '@/components/TradeHistoryTable'
import { useFuturesEvents } from '@/hooks/useFuturesEvents'

export default function PositionsTabs() {
  const [tab, setTab] = useState<'positions' | 'orders' | 'history'>('positions')
  const { opens, closes } = useFuturesEvents()

  return (
    <Tabs value={tab} onValueChange={(v: string)=>setTab(v as any)} className="w-full">
      <TabsList className="bg-axCard">
        <TabsTrigger value="positions" className="data-[state=active]:bg-axBlack">Positions</TabsTrigger>
        <TabsTrigger value="orders" className="data-[state=active]:bg-axBlack">Orders</TabsTrigger>
        <TabsTrigger value="history" className="data-[state=active]:bg-axBlack">History</TabsTrigger>
      </TabsList>
      <TabsContent value="positions" className="pt-4"><PositionsTable /></TabsContent>
      <TabsContent value="orders" className="pt-4"><OpenOrdersTable orders={opens} /></TabsContent>
      <TabsContent value="history" className="pt-4"><TradeHistoryTable trades={closes} /></TabsContent>
    </Tabs>
  )
} 