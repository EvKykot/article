import * as d3 from 'd3'
import debounce from 'lodash.debounce'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export type DataPoint = {
  time: number
  value: number
}

export type RechartsLineChartProps = {
  data: DataPoint[]
  onVisibleTimeRangeChanged?: (timeRange: { from: number; to: number } | null) => void
}

const MARGIN = { top: 16, right: 70, bottom: 30, left: 8 }
const HISTORY_WINDOW_SECONDS = 60
const ANIMATION_DURATION = 1000
const LAST_POINT_OFFSET = 0
const MAX_X_RANGE_ZOOM = 5 * 60
const MIN_X_RANGE_ZOOM = 60

// Add resetChart to the component props
const SmoothLineChart: React.FC<RechartsLineChartProps & { resetChart?: () => void }> = ({
  data,
  onVisibleTimeRangeChanged,
  resetChart,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 })
  const [tooltip, _setTooltip] = useState<{ x: number; y: number; value: number; time: number } | null>(null)

  // For slide animation
  const [displayData, setDisplayData] = useState<DataPoint[]>([])
  // Base domains, before zoom is applied
  const [baseYDomain, setBaseYDomain] = useState<[number, number]>([0, 1])
  const [currentPrice, setCurrentPrice] = useState<number | null>(null)

  // Refs for transform animation
  const transformRef = useRef<number>(0)
  const animationFrameRef = useRef<number | null>(null)
  const [animationTick, setAnimationTick] = useState(0) // For forcing re-render during animation

  // Store pending animation data (remains unchanged from original logic)
  const pendingDataRef = useRef<{
    visible: DataPoint[]
    xDomain: [number, number]
    yDomain: [number, number]
    price: number | null
  } | null>(null)

  // For animating the last line segment
  const [animatedLastPoint, setAnimatedLastPoint] = useState<DataPoint | null>(null)
  const lastPointAnimFrame = useRef<number | null>(null)

  // D3 Zoom state
  const [currentD3Transform, setCurrentD3Transform] = useState<d3.ZoomTransform>(() => d3.zoomIdentity)

  // Add state variables for tracking drag state and last point visibility
  const [isDragging, setIsDragging] = useState(false)
  const [isLastPointVisible, setIsLastPointVisible] = useState(true)
  const lastTransformRef = useRef<d3.ZoomTransform>(currentD3Transform)
  const isBeingDraggedRef = useRef(false)
  const hasDraggedRef = useRef(false) // Tracks if user has dragged at all
  const userDomainRef = useRef<[number, number] | null>(null) // Store user's domain after drag

  // Reference to track if chart has been drawn initially
  const hasDrawnChartRef = useRef(false)

  const isDark = true

  // Clean up all animations
  const cancelAllAnimations = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    if (lastPointAnimFrame.current) {
      cancelAnimationFrame(lastPointAnimFrame.current)
      lastPointAnimFrame.current = null
    }
    if (cursorLineYAnimFrame.current) {
      cancelAnimationFrame(cursorLineYAnimFrame.current)
      cursorLineYAnimFrame.current = null
    }
    transformRef.current = 0
  }, [])

  // Clean up animations when component unmounts
  useEffect(() => {
    return () => {
      cancelAllAnimations()
    }
  }, [cancelAllAnimations])

  const colors = useMemo(
    () => ({
      lineColor: '#4ADE80',
      topColor: '#4ADE8040',
      bottomColor: '#4ADE8010',
      backgroundColor: isDark ? '#1F2330' : '#e9ecf1',
      textColor: isDark ? '#F5F5F5' : '#191919',
      gridColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
      referenceLine: '#FF6B6B',
    }),
    [isDark],
  )

  // Responsive resize
  useEffect(() => {
    function handleResize() {
      if (wrapperRef.current) {
        const { width, height } = wrapperRef.current.getBoundingClientRect()
        setDimensions({ width, height })
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Prepare base domains and visible data (before zoom)
  const computedData = useMemo(() => {
    if (!data || data.length === 0) {
      return { visible: [], baseXDomain: [0, 1] as [number, number], price: null }
    }
    const lastDataPoint = data.at(-1)!
    const rightEdgeTime = lastDataPoint.time
    const leftEdgeTime = rightEdgeTime - HISTORY_WINDOW_SECONDS
    // Use all data to ensure correct rendering when zooming out
    const visible = data

    return {
      visible,
      baseXDomain: [leftEdgeTime, rightEdgeTime] as [number, number],
      price: lastDataPoint.value,
    }
  }, [data])

  // Enhanced D3 Zoom handler - memoize to prevent unnecessary rerenders
  const handleZoom = useCallback(
    (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
      // Store the transform before any modifications
      lastTransformRef.current = currentD3Transform // Save previous transform
      setCurrentD3Transform(event.transform)

      // Calculate width for scaling
      const width = dimensions.width - MARGIN.left - MARGIN.right
      const unzoomedXScale = d3
        .scaleLinear()
        .domain(computedData.baseXDomain)
        .range([MARGIN.left, MARGIN.left + width])

      // Calculate the transformed domain regardless of event type
      const transformedDomain = event.transform.rescaleX(unzoomedXScale).domain() as [number, number]

      // Check if this is a drag event (change in x translation from mouse drag)
      if (event.sourceEvent && (event.sourceEvent.type === 'mousemove' || event.sourceEvent.type === 'touchmove')) {
        if (!isBeingDraggedRef.current) {
          // Just started dragging
          isBeingDraggedRef.current = true
          setIsDragging(true)
          hasDraggedRef.current = true

          // Cancel any ongoing animation when user starts dragging
          cancelAllAnimations()
        }

        // Store the current domain after applying transform
        userDomainRef.current = transformedDomain

        // Check if the last data point is visible in the current view
        const lastPoint = data.at(-1)
        if (lastPoint) {
          const isVisible = lastPoint.time >= transformedDomain[0] && lastPoint.time <= transformedDomain[1]
          setIsLastPointVisible(isVisible)
        }
      }
      // Handle wheel events (zooming)
      else if (event.sourceEvent?.type === 'wheel') {
        // Always update userDomainRef for wheel events to maintain proper zoom state
        userDomainRef.current = transformedDomain
      }
      // IMPORTANT: detects the END of dragging directly from D3 zoom events
      else if (
        event.sourceEvent &&
        (event.sourceEvent.type === 'mouseup' ||
          event.sourceEvent.type === 'touchend' ||
          event.sourceEvent.type === 'mouseleave') &&
        isBeingDraggedRef.current
      ) {
        // Reset BOTH the ref and the state immediately
        isBeingDraggedRef.current = false
        setIsDragging(false)

        // Reset the hasDragged flag as well when drag ends
        hasDraggedRef.current = false

        // Check if the last point is visible after dragging ends
        if (data.length > 0 && userDomainRef.current) {
          const lastPoint = data.at(-1)
          if (lastPoint) {
            const isVisible = lastPoint.time >= userDomainRef.current[0] && lastPoint.time <= userDomainRef.current[1]
            // Update visibility state
            setIsLastPointVisible(isVisible)

            // If last point is visible, completely reset the chart to its initial state
            // This provides the same behavior as returning to the tab
            if (isVisible && resetChart) {
              // Reset any ongoing animations first
              cancelAllAnimations()
              // Use the reset function from the wrapper to completely recreate the chart
              resetChart()
            }
          }
        }
      }
    },
    [computedData.baseXDomain, currentD3Transform, data, dimensions.width, cancelAllAnimations, resetChart],
  )

  // Extract drag end logic to a separate function for reuse
  const handleDragEnd = useCallback(() => {
    // Reset BOTH the ref and the state immediately
    isBeingDraggedRef.current = false
    setIsDragging(false)

    // Reset the hasDragged flag as well when drag ends
    hasDraggedRef.current = false

    // Check if the last point is visible after dragging ends
    if (data.length > 0 && userDomainRef.current) {
      const lastPoint = data.at(-1)
      if (lastPoint) {
        const isVisible = lastPoint.time >= userDomainRef.current[0] && lastPoint.time <= userDomainRef.current[1]
        // Update visibility state
        setIsLastPointVisible(isVisible)

        // If last point is visible, completely reset the chart to its initial state
        // This provides the same behavior as returning to the tab
        if (isVisible && resetChart) {
          // Reset any ongoing animations first
          cancelAllAnimations()
          // Use the reset function from the wrapper to completely recreate the chart
          resetChart()
        }
      }
    }
  }, [data, resetChart, cancelAllAnimations])

  // Handle end of dragging - KEEP this as a backup in case D3 events miss some cases
  useEffect(() => {
    function handleMouseUp() {
      if (isBeingDraggedRef.current) {
        handleDragEnd()
      }
    }

    // Use both mouseup and touchend events at the window level to ensure they're always captured
    window.addEventListener('mouseup', handleMouseUp, { passive: true })
    window.addEventListener('touchend', handleMouseUp, { passive: true })

    return () => {
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('touchend', handleMouseUp)
    }
  }, [handleDragEnd])

  // Calculate effectiveXDomain respecting user's drag position
  const effectiveXDomain = useMemo(() => {
    if (!dimensions.width || dimensions.width === 0) return computedData.baseXDomain

    // Get chart width for scale calculations
    const width = dimensions.width - MARGIN.left - MARGIN.right

    // If user has dragged and domain is stored, use that domain during active dragging
    if (userDomainRef.current && isDragging) {
      return userDomainRef.current
    }

    // After dragging has ended but user has previously dragged
    if (userDomainRef.current && !isDragging) {
      // If the last point is visible, transition back to default behavior
      if (isLastPointVisible) {
        const currentDomainWidth = userDomainRef.current[1] - userDomainRef.current[0]
        const rightEdgeTime = computedData.baseXDomain[1] // Last data point time

        // Create new domain that ensures the latest point is at the right edge,
        // while maintaining the same width to prevent sudden zoom changes
        return [rightEdgeTime - currentDomainWidth, rightEdgeTime] as [number, number]
      } else {
        // Last point not visible, keep the user's chosen view
        return userDomainRef.current
      }
    }

    // Default behavior - fixed right edge at latest data point
    const rightEdgeTime = computedData.baseXDomain[1]

    // Scale that maps base (unzoomed) X domain to pixels
    const unzoomedXScale = d3
      .scaleLinear()
      .domain(computedData.baseXDomain)
      .range([MARGIN.left, MARGIN.left + width])

    // Get domain after applying zoom transform
    const zoomedDomain = currentD3Transform.rescaleX(unzoomedXScale).domain() as [number, number]

    // Calculate width of new domain with zoom applied
    const zoomedDomainWidth = zoomedDomain[1] - zoomedDomain[0]

    // Create new domain, fixing right edge at current value
    return [rightEdgeTime - zoomedDomainWidth, rightEdgeTime] as [number, number]
  }, [computedData.baseXDomain, currentD3Transform, dimensions.width, isDragging, isLastPointVisible])

  // Add a ref to track the previously visible X-range for Y-axis recalculation
  const prevVisibleRangeRef = useRef<[number, number] | null>(null)

  // Update Y range based on data visible in current X range
  useEffect(() => {
    if (!computedData.visible || computedData.visible.length === 0) {
      return
    }

    // Compare current visible range with previous - this helps detect meaningful changes
    const hasRangeChanged =
      !prevVisibleRangeRef.current ||
      Math.abs(effectiveXDomain[0] - prevVisibleRangeRef.current[0]) > 0.01 ||
      Math.abs(effectiveXDomain[1] - prevVisibleRangeRef.current[1]) > 0.01

    // Always update on first render or when range changes significantly
    // Don't skip updates during animation anymore - that was causing the problem
    if (hasRangeChanged) {
      // Update the reference to the current range
      prevVisibleRangeRef.current = [...effectiveXDomain]

      // Filter data visible in current X range
      const visibleData = computedData.visible.filter(
        (point) => point.time >= effectiveXDomain[0] && point.time <= effectiveXDomain[1],
      )

      // If no visible data, don't change the range
      if (visibleData.length === 0) {
        return
      }

      // Find minimum and maximum values in visible data
      let minValue = d3.min(visibleData, (d) => d.value) ?? 0
      let maxValue = d3.max(visibleData, (d) => d.value) ?? 1

      // Calculate total value range
      const valueRange = maxValue - minValue

      // If range is too small, set minimum range
      const minRange = maxValue * 0.1 // 10% of maximum value as minimum range
      const effectiveRange = Math.max(valueRange, minRange)

      // Balanced padding: 10% bottom and 10% top for better distribution
      const bottomPadding = effectiveRange * 0.1
      const topPadding = effectiveRange * 0.1

      // Calculate new boundaries with padding
      minValue = Math.max(0, minValue - bottomPadding)
      maxValue = maxValue + topPadding

      // Update the Y-axis domain immediately
      setBaseYDomain([minValue, maxValue])
    }
  }, [computedData.visible, effectiveXDomain, currentD3Transform])

  // Store the initial data reference to detect when data actually changes
  const dataRef = useRef(data)
  const isDataChanged = dataRef.current !== data

  // For slide animation: when a new point arrives, animate transform and then draw the new point
  useEffect(() => {
    if (!isDataChanged) return // Skip if data didn't actually change
    dataRef.current = data // Update reference

    // 1. If first render — just draw
    if (displayData.length === 0) {
      setDisplayData(computedData.visible)
      // baseYDomain will be updated by the separate useEffect
      setCurrentPrice(computedData.price)
      transformRef.current = 0
      return
    }

    // 2. If new point — start animation (only if last point is visible and not actively being dragged)
    const prevLast = displayData.at(-1)
    const nextLast = computedData.visible.at(-1)

    if (prevLast && nextLast && prevLast.time !== nextLast.time) {
      // Force a refresh of the drag state to ensure it's accurate
      // This is important because the mouse up handler might not have been triggered yet
      const isCurrentlyDragging = isBeingDraggedRef.current

      // Check if we should animate based on last point visibility and current drag state
      if (isLastPointVisible && !isCurrentlyDragging) {
        const width = dimensions.width - MARGIN.left - MARGIN.right

        // Create scale considering current zoom level
        const effectiveXScale = d3
          .scaleLinear()
          .domain(effectiveXDomain) // Use effective domain that accounts for zoom
          .range([MARGIN.left, MARGIN.left + width])

        // Calculate step in pixels considering zoom
        let prevStep = 0
        if (displayData.length > 1 && displayData.at(-2)) {
          const lastPointTime = displayData.at(-1)!.time
          const prevPointTime = displayData.at(-2)!.time

          // Determine distance in pixels considering current scale
          prevStep = effectiveXScale(lastPointTime) - effectiveXScale(prevPointTime)
        }

        pendingDataRef.current = {
          visible: computedData.visible,
          xDomain: computedData.baseXDomain,
          yDomain: baseYDomain, // Use current baseYDomain state
          price: computedData.price,
        }

        setDisplayData(computedData.visible)
        // baseYDomain will be updated by the separate useEffect
        setCurrentPrice(computedData.price)
        transformRef.current = prevStep

        let start: number | null = null
        function animate(ts: number) {
          if (start === null) start = ts
          const elapsed = ts - start
          const t = Math.min(1, elapsed / ANIMATION_DURATION)
          // Use simple linear formula without additional transformations
          transformRef.current = prevStep * (1 - t)

          // Instead of updating state on every frame, just update the DOM directly
          if (svgRef.current) {
            const svg = d3.select(svgRef.current)
            const height = dimensions.height - MARGIN.top - MARGIN.bottom

            // Update ONLY elements that should move during animation
            // DO NOT include Y-axis elements here!

            // Update path transforms with eased value
            svg.selectAll('.animated-element').attr('transform', `translate(${transformRef.current},0)`)

            // Update x-axis ticks and grid lines for smooth animation
            svg.select('.x-axis-group').attr('transform', `translate(${transformRef.current},${MARGIN.top + height})`)
            svg.selectAll('.x-grid-line').attr('transform', `translate(${transformRef.current},0)`)

            // DO NOT update transformations for Y-axis elements - they should remain stationary
            // svg.select('.y-axis-group') - don't touch!
            // svg.selectAll('.y-grid-line') - don't touch!

            // Update data points (circles)
            svg.selectAll('circle.data-point').attr('transform', `translate(${transformRef.current},0)`)
          }

          if (t < 1) {
            animationFrameRef.current = requestAnimationFrame(animate)
          } else {
            transformRef.current = 0
            animationFrameRef.current = null
            // Only trigger a state update at the end of animation
            setAnimationTick((tick) => tick + 1)
          }
        }
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = requestAnimationFrame(animate)

        // Animate last line segment
        if (lastPointAnimFrame.current) cancelAnimationFrame(lastPointAnimFrame.current)
        setAnimatedLastPoint(prevLast)
        let lastPointStart: number | null = null
        function animateLastPoint(ts: number) {
          if (lastPointStart === null) lastPointStart = ts
          const elapsed = ts - lastPointStart
          const t = Math.min(1, elapsed / ANIMATION_DURATION)
          // Use simple linear formula without additional transformations
          if (prevLast && nextLast) {
            const interp: DataPoint = {
              time: prevLast.time + (nextLast.time - prevLast.time) * t,
              value: prevLast.value + (nextLast.value - prevLast.value) * t,
            }
            setAnimatedLastPoint(interp)
            if (t < 1) {
              lastPointAnimFrame.current = requestAnimationFrame(animateLastPoint)
            } else {
              setAnimatedLastPoint(nextLast)
              lastPointAnimFrame.current = null
            }
          }
        }
        lastPointAnimFrame.current = requestAnimationFrame(animateLastPoint)
      } else {
        // If not a new point or dragging/last point not visible — just update domains (e.g. resize)
        setDisplayData(computedData.visible)
        // baseYDomain will be updated by the separate useEffect
        setCurrentPrice(computedData.price)
        transformRef.current = 0
        setAnimatedLastPoint(computedData.visible.at(-1) ?? null)
      }
    } else {
      // If not a new point or dragging/last point not visible — just update domains (e.g. resize)
      setDisplayData(computedData.visible)
      // baseYDomain will be updated by the separate useEffect
      setCurrentPrice(computedData.price)
      transformRef.current = 0
      setAnimatedLastPoint(computedData.visible.at(-1) ?? null)
    }
  }, [computedData, dimensions.width, isDataChanged, effectiveXDomain, isLastPointVisible, isDragging])

  // State for vertical cursor line (no animation)
  const [cursorLineX, _setCursorLineX] = useState<number | null>(null)

  // State for horizontal label (with animation)
  const [cursorLineY, setCursorLineY] = useState<number | null>(null)
  const cursorLineYTarget = useRef<number | null>(null)
  const cursorLineYAnimFrame = useRef<number | null>(null)

  // Animate horizontal crosshair movement
  useEffect(() => {
    if (cursorLineYTarget.current === null) {
      if (cursorLineY !== null) setCursorLineY(null) // Animate to null if target is null
      return
    }
    if (cursorLineY === null) {
      setCursorLineY(cursorLineYTarget.current)
      return
    }
    let start: number | null = null
    const fromY = cursorLineY
    const toY = cursorLineYTarget.current
    const duration = 120 // ms, fast animation

    function animate(ts: number) {
      if (start === null) start = ts
      const elapsed = ts - start
      const t = Math.min(1, elapsed / duration)
      setCursorLineY(fromY + (toY - fromY) * t)
      if (t < 1) {
        cursorLineYAnimFrame.current = requestAnimationFrame(animate)
      } else {
        setCursorLineY(toY)
        cursorLineYAnimFrame.current = null
      }
    }
    if (cursorLineYAnimFrame.current) cancelAnimationFrame(cursorLineYAnimFrame.current)
    cursorLineYAnimFrame.current = requestAnimationFrame(animate)
  }, [cursorLineY]) // Simplified dependency

  // D3 rendering (slide by transform) with performance optimization
  useEffect(() => {
    if (!svgRef.current || displayData.length === 0 || dimensions.width === 0 || dimensions.height === 0) return

    // Skip re-drawing if only animation tick has changed, and use transformRef directly in transforms
    if (
      hasDrawnChartRef.current &&
      !isDataChanged &&
      dimensions.width === Number(svgRef.current.getAttribute('width')) &&
      dimensions.height === Number(svgRef.current.getAttribute('height')) && // Update only transform values for ongoing animations, don't redraw entire chart
      animationTick > 0
    ) {
      const svg = d3.select(svgRef.current)
      const height = dimensions.height - MARGIN.top - MARGIN.bottom
      const width = dimensions.width - MARGIN.left - MARGIN.right

      // Update path transforms
      svg.selectAll('path').attr('transform', `translate(${transformRef.current},0)`)

      // Update x-axis ticks and grid lines for smooth animation
      svg.select('.x-axis-group').attr('transform', `translate(${transformRef.current},${MARGIN.top + height})`)
      svg.selectAll('.x-grid-line').attr('transform', `translate(${transformRef.current},0)`)

      // Фіксуємо положення Y-осі праворуч графіка (не застосовуємо transformRef.current до неї)
      // Це запобігає руху осі Y під час анімації
      svg.select('.y-axis-group').attr('transform', `translate(${MARGIN.left + width},0)`)

      // Y-grid-lines також не повинні рухатись при анімації
      svg.selectAll('.y-grid-line').attr('transform', 'translate(0,0)')

      // Update data points (circles)
      svg.selectAll('circle.data-point').attr('transform', `translate(${transformRef.current},0)`)

      // Important: do not update x-axis-label separately, they are already updated as part of .x-axis-group
      svg.selectAll('.tick').attr('transform', function () {
        // Get the original transform that has translation for tick position
        const currentTransform = d3.select(this).attr('transform')
        if (!currentTransform) return `translate(${transformRef.current},0)`

        // Extract the original x position from transform string
        const match = /translate\(([^,]+),([^)]+)\)/.exec(currentTransform)
        if (match && match.length >= 3) {
          const origX = Number.parseFloat(match[1])
          const origY = Number.parseFloat(match[2])
          // Apply our animation offset to the original position
          return `translate(${origX + transformRef.current},${origY})`
        }
        return currentTransform
      })

      return
    }

    const width = dimensions.width - MARGIN.left - MARGIN.right
    const height = dimensions.height - MARGIN.top - MARGIN.bottom

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    // --- CLIP PATH ---
    svg
      .append('defs')
      .append('clipPath')
      .attr('id', 'clip')
      .append('rect')
      .attr('x', MARGIN.left) // Start from left margin to make Y-axis visible
      .attr('y', 0)
      .attr('width', width) // Only clip the chart area, not the Y-axis
      .attr('height', dimensions.height) // Full height SVG

    // Scales
    const x = d3
      .scaleLinear()
      .domain(effectiveXDomain) // Use zoomed domain
      .range([MARGIN.left, MARGIN.left + width - LAST_POINT_OFFSET])
    const y = d3
      .scaleLinear()
      .domain(baseYDomain) // Y domain is not zoomed
      .range([MARGIN.top + height, MARGIN.top])

    // Area generator
    const area = d3
      .area<DataPoint>()
      .x((d) => x(d.time))
      .y0(y(baseYDomain[0])) // Use baseYDomain for y0
      .y1((d) => y(d.value))
      .curve(d3.curveMonotoneX)

    // Line generator
    const line = d3
      .line<DataPoint>()
      .x((d) => x(d.time))
      .y((d) => y(d.value))
      .curve(d3.curveMonotoneX)

    // Gradient
    const defs = svg.select('defs').node() ? svg.select('defs') : svg.append('defs')
    const gradient = defs
      .append('linearGradient')
      .attr('id', 'd3-area-gradient')
      .attr('x1', '0')
      .attr('y1', '0')
      .attr('x2', '0')
      .attr('y2', '1')
    gradient.append('stop').attr('offset', '5%').attr('stop-color', colors.lineColor).attr('stop-opacity', 0.2)
    gradient.append('stop').attr('offset', '95%').attr('stop-color', colors.lineColor).attr('stop-opacity', 0.05)

    // Background
    svg
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', dimensions.width)
      .attr('height', dimensions.height)
      .attr('fill', colors.backgroundColor)

    // Grid
    const xAxisFormat = (d: any) => {
      const date = new Date(d * 1000)
      if (Number.isNaN(date.getTime())) return ''
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    }
    const xAxis = d3
      .axisBottom(x)
      .ticks(Math.max(1, Math.round(width / 100)))
      .tickFormat(xAxisFormat) // Dynamic ticks
    const yAxis = d3
      .axisRight(y)
      .ticks(Math.max(1, Math.round(height / 50)))
      .tickFormat((d: unknown) => (typeof d === 'number' ? d.toFixed(2) : '')) // Dynamic ticks

    // X grid lines
    svg
      .append('g')
      .attr('class', 'x-axis-group')
      .attr('transform', `translate(${transformRef.current},${MARGIN.top + height})`)
      .call(xAxis)
      .call((g) => g.selectAll('.domain').attr('stroke', colors.gridColor))
      .call((g) => g.selectAll('.tick line').attr('stroke', colors.gridColor))
      .call((g) =>
        g.selectAll('text').attr('class', 'x-axis-label').attr('fill', colors.textColor).attr('font-size', 12),
      )

    // Store x-axis tick values for animation
    ;(svg as any)._xAxisTicks = x.ticks(Math.max(1, Math.round(width / 100))).map((tick) => ({
      value: tick,
      formatted: xAxisFormat(tick),
      position: x(tick),
    }))

    // X grid lines with vertical lines
    svg
      .append('g')
      .selectAll('line')
      .data(x.ticks(Math.max(1, Math.round(width / 100))))
      .join('line')
      .attr('class', 'x-grid-line')
      .attr('x1', (d) => x(d))
      .attr('x2', (d) => x(d))
      .attr('y1', MARGIN.top)
      .attr('y2', MARGIN.top + height)
      .attr('stroke', colors.gridColor)
      .attr('stroke-opacity', 0.5)
      .attr('stroke-dasharray', '3 3')

    // Y grid lines
    const _yAxisContainer = svg
      .append('g')
      .attr('class', 'y-axis-group')
      .attr('transform', `translate(${MARGIN.left + width},0)`) // Fixed position, independent of transformRef
      .call(yAxis)
      .call((g) => g.selectAll('.domain').attr('stroke', colors.gridColor))
      .call((g) => g.selectAll('.tick').attr('class', 'tick y-axis-tick'))
      .call((g) => g.selectAll('text').attr('fill', colors.textColor).attr('font-size', 12))

    // Horizontal grid lines - properly create them (was missing .join('line'))
    svg
      .append('g')
      .selectAll('line')
      .data(y.ticks(Math.max(1, Math.round(height / 50)))) // Dynamic ticks
      .join('line') // Added .join('line'), which was missing before
      .attr('class', 'y-grid-line')
      .attr('x1', MARGIN.left)
      .attr('x2', MARGIN.left + width)
      .attr('y1', (d) => y(d))
      .attr('y2', (d) => y(d))
      .attr('stroke', colors.gridColor)
      .attr('stroke-dasharray', '3 3')

    // --- PATHS with transform and clipPath ---
    const g = svg.append('g').attr('clip-path', 'url(#clip)')

    // Area (up to the last point)
    g.append('path')
      .datum(displayData)
      .attr('fill', 'url(#d3-area-gradient)')
      .attr('d', area)
      .attr('transform', `translate(${transformRef.current},0)`)

    // Line up to the penultimate point (without the last segment)
    if (displayData.length > 1 && animatedLastPoint) {
      const lineData = [...displayData.slice(0, -1), animatedLastPoint]
      g.append('path')
        .datum(lineData)
        .attr('fill', 'none')
        .attr('stroke', colors.lineColor)
        .attr('stroke-width', 2)
        .attr('d', line)
        .attr('transform', `translate(${transformRef.current},0)`)
    } else if (displayData.length > 0) {
      g.append('path')
        .datum(displayData)
        .attr('fill', 'none')
        .attr('stroke', colors.lineColor)
        .attr('stroke-width', 2)
        .attr('d', line)
        .attr('transform', `translate(${transformRef.current},0)`)
    }

    // Reference line (current price)
    if (currentPrice !== null && displayData.length > 0 && animatedLastPoint) {
      const last = animatedLastPoint
      const lastY = y(last.value)

      if (
        g
          .append('line')
          .attr('x1', MARGIN.left)
          .attr('x2', MARGIN.left + width)
          .attr('y1', lastY)
          .attr('y2', lastY)
          .attr('stroke', colors.referenceLine)
          .attr('stroke-width', 1.5)
          .attr('stroke-dasharray', '3 3')
      ) {
        ;(svg as any)._priceLabelParams = { lastY, value: last.value, isDark, width, MARGIN, colors }
      }
    }

    // Crosshair: vertical and horizontal lines
    if (cursorLineX !== null && tooltip && !Number.isNaN(tooltip.y) && Number.isFinite(tooltip.y)) {
      svg
        .append('line')
        .attr('x1', cursorLineX)
        .attr('x2', cursorLineX)
        .attr('y1', MARGIN.top)
        .attr('y2', MARGIN.top + height)
        .attr('stroke', colors.gridColor)
        .attr('stroke-width', 1)
        .attr('pointer-events', 'none')
      svg
        .append('line')
        .attr('x1', MARGIN.left)
        .attr('x2', MARGIN.left + width)
        .attr('y1', cursorLineY ?? tooltip.y)
        .attr('y2', cursorLineY ?? tooltip.y)
        .attr('stroke', colors.gridColor)
        .attr('stroke-width', 1)
        .attr('pointer-events', 'none')

      const xLabelW = 76,
        xLabelH = 22,
        xLabelRx = 6
      const xLabelX = Math.max(
        MARGIN.left,
        Math.min((cursorLineX ?? MARGIN.left) - xLabelW / 2, dimensions.width - MARGIN.right - xLabelW),
      )
      const xLabelY = MARGIN.top + height + 8
      svg
        .append('rect')
        .attr('x', xLabelX)
        .attr('y', xLabelY)
        .attr('width', xLabelW)
        .attr('height', xLabelH)
        .attr('rx', xLabelRx)
        .attr('fill', isDark ? '#181C23' : '#CDCDCD')
        .attr('stroke', isDark ? '#4A4A4A' : '#AEAEAE')
        .attr('stroke-width', 0.5)
        .attr('filter', 'drop-shadow(0 1px 3px rgba(0,0,0,0.1))')
      svg
        .append('text')
        .attr('x', xLabelX + xLabelW / 2)
        .attr('y', xLabelY + xLabelH / 2 + 4)
        .attr('text-anchor', 'middle')
        .attr('fill', colors.textColor)
        .attr('font-size', 12)
        .attr('font-weight', 500)
        .text(
          new Date(tooltip.time * 1000).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }),
        )

      const yLabelW = 60,
        yLabelH = 22,
        yLabelRx = 6
      const yLabelX = MARGIN.left + width + 8
      const yLabelY = Math.max(
        MARGIN.top,
        Math.min((cursorLineY ?? tooltip.y) - yLabelH / 2, MARGIN.top + height - yLabelH),
      )
      svg
        .append('rect')
        .attr('x', yLabelX)
        .attr('y', yLabelY)
        .attr('width', yLabelW)
        .attr('height', yLabelH)
        .attr('rx', yLabelRx)
        .attr('fill', isDark ? '#181C23' : '#CDCDCD')
        .attr('stroke', isDark ? '#4A4A4A' : '#AEAEAE')
        .attr('stroke-width', 0.5)
        .attr('filter', 'drop-shadow(0 1px 3px rgba(0,0,0,0.1))')
      svg
        .append('text')
        .attr('x', yLabelX + yLabelW / 2)
        .attr('y', yLabelY + yLabelH / 2 + 4)
        .attr('text-anchor', 'middle')
        .attr('fill', colors.textColor)
        .attr('font-size', 12)
        .attr('font-weight', 500)
        .text(tooltip.value.toFixed(2))
    }

    const priceLabelParams = (svg as any)._priceLabelParams as
      | {
          lastY: number
          value: number
          isDark: boolean
          width: number
          MARGIN: { left: number }
          colors: { referenceLine: string }
        }
      | undefined
    if (priceLabelParams) {
      const {
        lastY,
        value,
        isDark: labelIsDark,
        width: labelWidth,
        MARGIN: labelMargin,
        colors: labelColors,
      } = priceLabelParams
      const priceLabelW = 60,
        priceLabelH = 22,
        priceLabelRx = 6
      const priceLabelX = (labelMargin?.left ?? 0) + labelWidth + 10
      const priceLabelY = Math.max(MARGIN.top, Math.min(lastY - priceLabelH / 2, MARGIN.top + height - priceLabelH))
      svg
        .append('rect')
        .attr('x', priceLabelX)
        .attr('y', priceLabelY)
        .attr('width', priceLabelW)
        .attr('height', priceLabelH)
        .attr('rx', priceLabelRx)
        .attr('fill', labelIsDark ? '#181C23' : '#CDCDCD')
        .attr('stroke', labelColors.referenceLine)
        .attr('stroke-width', 0.5)
        .attr('filter', 'drop-shadow(0 1px 3px rgba(0,0,0,0.1))')
      svg
        .append('text')
        .attr('x', priceLabelX + priceLabelW / 2)
        .attr('y', priceLabelY + priceLabelH / 2 + 4)
        .attr('text-anchor', 'middle')
        .attr('fill', labelColors.referenceLine)
        .attr('font-size', 12)
        .attr('font-weight', 500)
        .text(value.toFixed(2))
      ;(svg as any)._priceLabelParams = undefined
    }

    // CRITICAL: add direct mouseup/touchend event handlers to SVG
    // D3 blocks standard events, so we need to add our own handlers directly to the element
    svg.on('mouseup.dragend', function () {
      if (isBeingDraggedRef.current) {
        // Reset drag flags
        isBeingDraggedRef.current = false
        setIsDragging(false)

        // Check if last point is visible
        if (data.length > 0 && userDomainRef.current) {
          const lastPoint = data.at(-1)
          if (lastPoint) {
            const isVisible = lastPoint.time >= userDomainRef.current[0] && lastPoint.time <= userDomainRef.current[1]
            setIsLastPointVisible(isVisible)

            if (isVisible) {
              // If last point is visible, update domain
              const domainWidth = userDomainRef.current[1] - userDomainRef.current[0]
              const rightEdgeTime = lastPoint.time
              userDomainRef.current = [rightEdgeTime - domainWidth, rightEdgeTime]

              // Reset animations and trigger update
              cancelAllAnimations()
              requestAnimationFrame(() => {
                setAnimationTick((prev) => prev + 1)
              })
            }
          }
        }
      }
    })

    svg.on('touchend.dragend', function () {
      if (isBeingDraggedRef.current) {
        // Similar logic as in mouseup
        isBeingDraggedRef.current = false
        setIsDragging(false)

        if (data.length > 0 && userDomainRef.current) {
          const lastPoint = data.at(-1)
          if (lastPoint) {
            const isVisible = lastPoint.time >= userDomainRef.current[0] && lastPoint.time <= userDomainRef.current[1]
            setIsLastPointVisible(isVisible)

            if (isVisible) {
              const domainWidth = userDomainRef.current[1] - userDomainRef.current[0]
              const rightEdgeTime = lastPoint.time
              userDomainRef.current = [rightEdgeTime - domainWidth, rightEdgeTime]

              cancelAllAnimations()
              requestAnimationFrame(() => {
                setAnimationTick((prev) => prev + 1)
              })
            }
          }
        }
      }
    })

    // Setup D3 Zoom
    const zoomBehavior = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 30]) // Min 0.1x (see 10x history window), Max 30x zoom
      .extent([
        [MARGIN.left, MARGIN.top],
        [dimensions.width - MARGIN.right, dimensions.height - MARGIN.bottom],
      ])
      .translateExtent([
        [MARGIN.left - width * 10, MARGIN.top],
        [dimensions.width - MARGIN.right + width * 10, dimensions.height - MARGIN.bottom],
      ])
      .filter((event) => {
        // The original filter condition
        const shouldAllowEvent = !event.ctrlKey && (event.button === 0 || event.type === 'wheel')

        return shouldAllowEvent
      }) // Pan with LMB/Touch, Zoom with Wheel/Pinch
      .on('zoom', (event) => {
        // Get the current unzoomed scale for domain calculation
        const unzoomedXScale = d3
          .scaleLinear()
          .domain(computedData.baseXDomain)
          .range([MARGIN.left, MARGIN.left + width])

        // Calculate what the new domain would be with the current transform
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        const newDomain = event.transform.rescaleX(unzoomedXScale).domain() as [number, number]
        const newDomainWidth = newDomain[1] - newDomain[0]

        // Check if the new domain would violate our constraints
        if (newDomainWidth > MAX_X_RANGE_ZOOM) {
          // Calculate midpoint of the domain to center the zoom
          const midpoint = (newDomain[0] + newDomain[1]) / 2

          // Create a new domain with correct width centered on midpoint
          const halfMaxRange = MAX_X_RANGE_ZOOM / 2
          const constrainedDomain: [number, number] = [midpoint - halfMaxRange, midpoint + halfMaxRange]

          // Calculate new transform based on constrained domain
          const constrainedScale = width / (unzoomedXScale(constrainedDomain[1]) - unzoomedXScale(constrainedDomain[0]))
          event.transform.k = constrainedScale

          // Recalculate translation to maintain the center point
          const newTranslateX = -unzoomedXScale(midpoint) * constrainedScale + width / 2
          event.transform.x = newTranslateX
        } else if (newDomainWidth < MIN_X_RANGE_ZOOM) {
          // Similar logic for minimum zoom
          const midpoint = (newDomain[0] + newDomain[1]) / 2

          const halfMinRange = MIN_X_RANGE_ZOOM / 2
          const constrainedDomain: [number, number] = [midpoint - halfMinRange, midpoint + halfMinRange]

          const constrainedScale = width / (unzoomedXScale(constrainedDomain[1]) - unzoomedXScale(constrainedDomain[0]))
          event.transform.k = constrainedScale

          const newTranslateX = -unzoomedXScale(midpoint) * constrainedScale + width / 2
          event.transform.x = newTranslateX
        }

        // Call the original zoom handler with the potentially modified transform
        handleZoom(event)
      })
      // Enhance the 'end' event handler to ensure it captures all end-of-drag scenarios
      .on('end', function () {
        if (isBeingDraggedRef.current) {
          handleDragEnd()
        }
      })

    // Apply the zoom behavior to the SVG, ensuring it doesn't override other event listeners
    svg.call(zoomBehavior)

    // Direct DOM event handlers on SVG element (bypassing D3's event system)
    const svgElement = svgRef.current
    if (svgElement) {
      // Add native DOM event listeners that will always fire
      const handleDomMouseUp = () => {
        if (isBeingDraggedRef.current) {
          handleDragEnd()
        }
      }

      const handleDomTouchEnd = () => {
        if (isBeingDraggedRef.current) {
          handleDragEnd()
        }
      }

      svgElement.addEventListener('mouseup', handleDomMouseUp)
      svgElement.addEventListener('touchend', handleDomTouchEnd)

      // Clean up function for next render
      return () => {
        svgElement.removeEventListener('mouseup', handleDomMouseUp)
        svgElement.removeEventListener('touchend', handleDomTouchEnd)
      }
    }

    // Mark chart as drawn
    hasDrawnChartRef.current = true
  }, [
    baseYDomain,
    currentD3Transform,
    displayData,
    effectiveXDomain,
    dimensions,
    transformRef.current,
    data,
    animationTick,
    isDataChanged,
    handleDragEnd,
  ])

  // Create a debounced version of onVisibleTimeRangeChanged that will be stable between renders
  const debouncedRangeChanged = useRef<((range: { from: number; to: number } | null) => void) | null>(null)

  // Initialize debounced callback only once
  useEffect(() => {
    // eslint-disable-next-line unicorn/prefer-ternary
    if (onVisibleTimeRangeChanged) {
      // Just pass the visible range without checks - checks are already in usePrependHistoricalData
      debouncedRangeChanged.current = debounce((range: { from: number; to: number } | null) => {
        if (!range || data.length === 0) return

        // Just log and pass
        onVisibleTimeRangeChanged(range)
      }, 250)
    } else {
      debouncedRangeChanged.current = null
    }

    return () => {
      debouncedRangeChanged.current = null
    }
  }, [onVisibleTimeRangeChanged, data])

  // Call debounced callback when effectiveXDomain changes
  useEffect(() => {
    if (debouncedRangeChanged.current && effectiveXDomain) {
      debouncedRangeChanged.current({
        from: effectiveXDomain[0],
        to: effectiveXDomain[1],
      })
    }
  }, [effectiveXDomain])

  // Check if last point is visible when data changes
  useEffect(() => {
    // Only process if the user has dragged before and we have a stored domain
    if (userDomainRef.current && data.length > 0) {
      const lastPoint = data.at(-1)
      if (lastPoint) {
        const isVisible = lastPoint.time >= userDomainRef.current[0] && lastPoint.time <= userDomainRef.current[1]

        // Update last point visibility state which affects animation
        if (isLastPointVisible !== isVisible) {
          setIsLastPointVisible(isVisible)
        }
      }
    }
  }, [data, isLastPointVisible])

  // Normal component render
  return (
    <div
      ref={wrapperRef}
      className="relative flex-1 min-h-0 overflow-hidden h-full"
      style={{ backgroundColor: colors.backgroundColor, width: '100%', height: '100%' }}
    >
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        style={{ display: 'block', width: '100%', height: '100%', userSelect: 'none' /* cursor set by eventRect */ }}
      />
    </div>
  )
}

// Wrapper component for redrawing the chart after tab switching
const SmoothLineChartWrapper: React.FC<RechartsLineChartProps> = (props) => {
  const [key, setKey] = useState(0)

  // Function to reset chart - will be passed to child component
  const resetChart = useCallback(() => {
    setKey((prevKey) => prevKey + 1)
  }, [])

  // Add listener for tab visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // When tab becomes visible again, redraw chart from scratch
        resetChart()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [resetChart])

  return <SmoothLineChart key={key} resetChart={resetChart} {...props} />
}

// Export the wrapper component instead of the regular component
export default SmoothLineChartWrapper
