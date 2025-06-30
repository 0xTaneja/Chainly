import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ConnectButton } from '@rainbow-me/rainbowkit'

interface OrderTicketUIProps {
  isLong: boolean
  onSelectLong: () => void
  onSelectShort: () => void
  collateral: string
  onCollateralChange: (v: string) => void
  leverage: number
  onLeverageChange: (v: number) => void
  positionSize: number
  onSubmit: () => void
  walletConnected: boolean
}

export default function OrderTicketUI({
  isLong,
  onSelectLong,
  onSelectShort,
  collateral,
  onCollateralChange,
  leverage,
  onLeverageChange,
  positionSize,
  onSubmit,
  walletConnected,
}: OrderTicketUIProps) {
  // Only market tab for now
  return (
    <div className="rounded-lg bg-axCard p-4 border border-white/10 flex flex-col h-full">
      <Tabs value="market" className="w-full flex flex-col flex-1">
        <div className="flex justify-between mb-4">
          <TabsList className="bg-gray-900">
            <TabsTrigger value="market" className="data-[state=active]:bg-gray-800">
              Market
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="market" className="space-y-4 flex-1 flex flex-col">
          {/* Buy / Sell buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              className={`${isLong ? 'bg-axGreenBright text-black' : 'border-axGreenBright text-axGreenBright'} hover:bg-axGreenBright/20`}
              variant={isLong ? 'default' : 'outline'}
              onClick={onSelectLong}
            >
              Long
            </Button>
            <Button
              className={`${!isLong ? 'bg-axRedBright text-white' : 'border-axRedBright text-axRedBright'} hover:bg-axRedBright/20`}
              variant={!isLong ? 'default' : 'outline'}
              onClick={onSelectShort}
            >
              Short
            </Button>
          </div>

          {/* Collateral input */}
          <div>
            <p className="mb-2 text-gray-400 flex justify-between">
              Collateral (ETH)
            </p>
            <Input
              type="number"
              step="0.001"
              value={collateral}
              onChange={(e) => onCollateralChange(e.target.value)}
              className="bg-[#1E1E1E] border-gray-700"
            />
          </div>

          {/* Leverage slider */}
          <div>
            <div className="flex justify-between mb-2">
              <p className="text-gray-400">Leverage</p>
              <div className="w-16 relative">
                <Input
                  type="number"
                  value={leverage}
                  onChange={(e) => {
                    const v = Number(e.target.value)
                    if (v >= 1 && v <= 100) {
                      onLeverageChange(v)
                    }
                  }}
                  min={1}
                  max={100}
                  className="h-7 px-2 pr-6 text-center bg-[#1E1E1E] border-gray-700"
                  aria-label="Leverage value"
                />
                <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400">x</span>
              </div>
            </div>
            <Slider
              value={[leverage]}
              min={1}
              max={100}
              step={1}
              onValueChange={(vals) => onLeverageChange(vals[0])}
              className="my-4"
            />
            <div className="grid grid-cols-6 gap-2 text-sm">
              {[3, 5, 10, 25, 50, 100].map((x) => (
                <button
                  key={x}
                  className="px-2 py-1 rounded bg-gray-800 hover:bg-gray-700"
                  onClick={() => onLeverageChange(x)}
                >
                  {x}x
                </button>
              ))}
            </div>
          </div>

          {/* Metrics */}
          {collateral && (
            <div className="text-xs space-y-1 text-gray-400">
              <div className="flex justify-between">
                <span>Position size</span>
                <span className="text-white font-semibold">{positionSize.toFixed(4)} ETH</span>
              </div>
              <div className="flex justify-between">
                <span>Margin used</span>
                <span className="text-white font-semibold">{collateral} ETH</span>
              </div>
            </div>
          )}

          {/* Submit button / wallet connect */}
          {walletConnected ? (
            <Button
              className={`w-full font-bold py-6 mt-auto ${
                isLong ? 'bg-axGreenBright text-black hover:bg-axGreenBright/90' : 'bg-axRedBright text-white hover:bg-axRedBright/90'
              }`}
              onClick={onSubmit}
            >
              Open {isLong ? 'Long' : 'Short'}
            </Button>
          ) : (
            <div className="w-full mt-auto">
              <ConnectButton />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
} 