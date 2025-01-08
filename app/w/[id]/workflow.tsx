'use client'

import { useState, useCallback, useEffect } from 'react'
import { BlockProps } from '../components/block'

const ZOOM_SPEED = 0.005
const MIN_ZOOM = 0.5
const MAX_ZOOM = 2
const CANVAS_SIZE = 5000 // 5000px x 5000px virtual canvas

export default function Workflow() {
  const [blocks, setBlocks] = useState<
    (BlockProps & { id: string; position: { x: number; y: number } })[]
  >([])
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [startPanPos, setStartPanPos] = useState({ x: 0, y: 0 })

  // Initialize pan position after mount
  useEffect(() => {
    const viewportWidth = window.innerWidth - 344 // Account for sidebar
    const viewportHeight = window.innerHeight - 56 // Account for header
    setPan({
      x: (viewportWidth - CANVAS_SIZE) / 2,
      y: (viewportHeight - CANVAS_SIZE) / 2,
    })
  }, [])

  const constrainPan = useCallback(
    (newPan: { x: number; y: number }, currentZoom: number) => {
      // Calculate the visible area dimensions
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight - 56 // Adjust for header height

      // Calculate the scaled canvas size
      const scaledCanvasWidth = CANVAS_SIZE * currentZoom
      const scaledCanvasHeight = CANVAS_SIZE * currentZoom

      // Calculate the maximum allowed pan values
      const maxX = 0
      const minX = viewportWidth - scaledCanvasWidth
      const maxY = 0
      const minY = viewportHeight - scaledCanvasHeight

      return {
        x: Math.min(maxX, Math.max(minX, newPan.x)),
        y: Math.min(maxY, Math.max(minY, newPan.y)),
      }
    },
    []
  )

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()

    try {
      const blockData = JSON.parse(
        e.dataTransfer.getData('application/json')
      ) as BlockProps

      // Get the canvas element's bounding rectangle
      const rect = e.currentTarget.getBoundingClientRect()

      // Calculate the drop position in canvas coordinates
      // 1. Get the mouse position relative to the canvas element
      // 2. Remove the pan offset (scaled by zoom)
      // 3. Scale by zoom to get true canvas coordinates
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      const x = mouseX / zoom
      const y = mouseY / zoom

      setBlocks((prev) => [
        ...prev,
        {
          ...blockData,
          id: crypto.randomUUID(),
          position: { x, y },
        },
      ])
    } catch (err) {
      console.error('Error dropping block:', err)
    }
  }

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      // Prevent browser zooming
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        const delta = -e.deltaY * ZOOM_SPEED
        setZoom((prevZoom) => {
          // If we're at max/min zoom and trying to zoom further, return current zoom
          if (
            (prevZoom >= MAX_ZOOM && delta > 0) ||
            (prevZoom <= MIN_ZOOM && delta < 0)
          ) {
            return prevZoom
          }
          const newZoom = Math.min(
            MAX_ZOOM,
            Math.max(MIN_ZOOM, prevZoom + delta)
          )
          // Adjust pan when zooming to keep the point under cursor fixed
          setPan((prevPan) => constrainPan(prevPan, newZoom))
          return newZoom
        })
      } else {
        // Regular scrolling for pan
        setPan((prevPan) =>
          constrainPan(
            {
              x: prevPan.x - e.deltaX,
              y: prevPan.y - e.deltaY,
            },
            zoom
          )
        )
      }
    },
    [constrainPan, zoom]
  )

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 1 || e.button === 0) {
        // Middle mouse or left click
        setIsPanning(true)
        setStartPanPos({ x: e.clientX - pan.x, y: e.clientY - pan.y })
      }
    },
    [pan]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isPanning) {
        setPan((prevPan) =>
          constrainPan(
            {
              x: e.clientX - startPanPos.x,
              y: e.clientY - startPanPos.y,
            },
            zoom
          )
        )
      }
    },
    [isPanning, startPanPos, zoom, constrainPan]
  )

  const handleMouseUp = useCallback(() => {
    setIsPanning(false)
  }, [])

  // Add this useEffect to prevent browser zoom
  useEffect(() => {
    const preventDefaultZoom = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
      }
    }

    document.addEventListener('wheel', preventDefaultZoom, { passive: false })
    return () => document.removeEventListener('wheel', preventDefaultZoom)
  }, [])

  return (
    <div
      className="w-full h-[calc(100vh-56px)] overflow-hidden"
      onWheel={handleWheel}
    >
      <div
        className="w-full h-full bg-[#F5F5F5] relative cursor-grab active:cursor-grabbing"
        style={{
          backgroundImage: `radial-gradient(#D9D9D9 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
          width: CANVAS_SIZE,
          height: CANVAS_SIZE,
          transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
          transformOrigin: '0 0',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {blocks.map((block) => (
          <div
            key={block.id}
            style={{
              position: 'absolute',
              left: `${block.position.x}px`,
              top: `${block.position.y}px`,
              transform: 'translate(-50%, -50%)',
              backgroundColor: block.bgColor,
              width: '160px', // 40 * 4 (w-40)
              height: '80px', // 20 * 4 (h-20)
              borderRadius: '8px', // rounded-lg
              cursor: 'move',
              userSelect: 'none',
            }}
          />
        ))}
      </div>
    </div>
  )
}
