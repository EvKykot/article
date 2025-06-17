import React, { useMemo } from 'react'
import SmoothLineChart from './smooth-line-chart'
import { usePriceHistory } from '../utils/price-history-mock'

const ChartWithData = () => {
  const rawPriceHistory = usePriceHistory()

  // Filter data to ensure all entries have valid time values
  const lineChartData = useMemo(() => {
    return rawPriceHistory.filter((item) => !Number.isNaN(item.time))
  }, [rawPriceHistory])

  // Debug logging
  React.useEffect(() => {
    if (lineChartData.length > 0) {
      const lastPoint = lineChartData[lineChartData.length - 1]
      console.log(
        `Chart data updated, now has ${lineChartData.length} points. Last point:`,
        new Date(lastPoint.time * 1000).toISOString(),
        `Value: ${lastPoint.value}`,
      )
    }
  }, [lineChartData.length])

  if (lineChartData.length === 0) {
    return <div>Loading chart data...</div>
  }

  return (
    <div className="chart-container" style={{ width: '100%', height: '100%', position: 'relative' }}>
      <SmoothLineChart data={lineChartData} />
    </div>
  )
}

export default ChartWithData
