import React from 'react'
import type { NextPage } from 'next'
import dynamic from 'next/dynamic'

// Імпортуємо компонент SmoothLineChart тільки на стороні клієнта
const DynamicSmoothLineChart = dynamic(() => import('../components/smooth-line-chart'), { ssr: false })

// Імпортуємо компонент з даними тільки на стороні клієнта
const DynamicChartWithData = dynamic(() => import('../components/chart-with-data'), { ssr: false })

const ChartPage: NextPage = () => {
  return (
    <div>
      <h1>Price History Chart</h1>
      <div style={{ width: '100%', height: '500px' }}>
        <DynamicChartWithData />
      </div>
    </div>
  )
}

export default ChartPage
