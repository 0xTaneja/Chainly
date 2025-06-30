'use client'

import { useState } from 'react'
import OrderTicketContainer from '@/components/OrderTicketContainer'
import PositionsTabs from '@/components/PositionsTabs'
import { useFuturesEvents } from '@/hooks/useFuturesEvents'
import ChartTabs from '@/components/ChartTabs'
import StatsHeader from '@/components/StatsHeader'

// News components
import InfoPanel from '@/components/news/InfoPanel'

interface Props { token: string }

export default function TradingTerminal({ token }: Props) {
  const [isLong, setIsLong] = useState(true)

  useFuturesEvents() // keep streaming for child components

  return (
<div className="w-screen h-[calc(100vh-4rem)] flex flex-col bg-axBlack text-white overflow-hidden">
  {/* top grid */}
  <div className="flex-1 min-h-0 grid grid-cols-[1fr_340px] gap-4 p-4 overflow-hidden">
    {/* chart + positions */}
    <div className="flex flex-col gap-4 overflow-hidden">
      <StatsHeader />
      <ChartTabs token={token} />
      <PositionsTabs />
    </div>

    {/* order ticket column */}
    <div className="flex flex-col min-h-0 overflow-y-auto">
      <OrderTicketContainer token={token} isLong={isLong} onToggle={() => setIsLong(v=>!v)} />
      {/* News feed */}
      <div className="mt-4">
        <InfoPanel />
      </div>
    </div>
  </div>

  {/* Note: PositionsTabs now rendered above inside main column */}
</div>
  )
} 