import { Controller } from "@hotwired/stimulus"
import { createConsumer } from "@rails/actioncable"

export default class extends Controller {
  static targets = [ "canvas" ]

  // Color generation utility
  generateUniqueColor() {
    // Use a combination of timestamp and random values to create a unique color
    const timestamp = Date.now()
    const randomPart = Math.floor(Math.random() * 0xFFFFFF)
    
    // Mix timestamp and random values to create a unique color
    const colorValue = (timestamp ^ randomPart) & 0xFFFFFF
    
    // Convert to hex color
    const hexColor = `#${colorValue.toString(16).padStart(6, '0')}`
    
    console.log(`[Whiteboard] Generated unique color: ${hexColor}`)
    return hexColor
  }

  // Debug method to log all method calls
  debug(methodName, ...args) {
    console.group(`[Whiteboard] ${methodName}`)
    console.trace() // Print call stack
    console.log("Arguments:", args)
    console.groupEnd()
  }
  
  connect() {
    console.log("[Whiteboard] Controller connecting...")
    
    // Generate a unique color for this client
    this.drawColor = this.generateUniqueColor()
    
    // Force enable debug mode
    this.debugMode = true
    
    console.log("[Whiteboard] Initializing whiteboard controller")
    
    this.canvas = document.getElementById('drawing-canvas')
    if (!this.canvas) {
      console.error("[Whiteboard] Canvas element not found!")
      return
    }
    
    const whiteboardId = this.canvas.getAttribute('data-whiteboard-id')
    console.log(`[Whiteboard] Whiteboard ID: ${whiteboardId}`)
    
    if (!whiteboardId) {
      console.error("[Whiteboard] No whiteboard ID found!")
      return
    }
    
    this.ctx = this.canvas.getContext('2d')
    
    // Enhanced canvas setup
    this.setupCanvasSize()
    this.setupCanvasContext()
    this.setupEventListeners()
    
    // Drawing state
    this.isDrawing = false
    
    // WebSocket
    this.setupWebSocket(whiteboardId)
    
    // Additional debugging
    this.logCanvasProperties()
  }
  
  // Logging utilities
  log(message) {
    console.log(`[Whiteboard] ${message}`)
  }
  
  error(message) {
    console.error(`[Whiteboard] ${message}`)
  }
  
  // Detailed canvas properties logging
  logCanvasProperties() {
    console.log(`[Whiteboard] Canvas width: ${this.canvas.width}`)
    console.log(`[Whiteboard] Canvas height: ${this.canvas.height}`)
    console.log(`[Whiteboard] Canvas client width: ${this.canvas.clientWidth}`)
    console.log(`[Whiteboard] Canvas client height: ${this.canvas.clientHeight}`)
    console.log(`[Whiteboard] Context stroke style: ${this.ctx.strokeStyle}`)
    console.log(`[Whiteboard] Context line width: ${this.ctx.lineWidth}`)
  }
  
  setupCanvasSize() {
    console.log("[Whiteboard] Setting up canvas dimensions")
    
    // Ensure canvas fills its container
    const container = this.canvas.parentElement
    const containerWidth = container.clientWidth
    
    // Set canvas dimensions
    this.canvas.width = containerWidth
    this.canvas.height = window.innerHeight * 0.6
    
    console.log(`[Whiteboard] Set canvas dimensions: ${this.canvas.width} x ${this.canvas.height}`)
    
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }
  
  setupCanvasContext() {
    console.log("[Whiteboard] Setting up canvas context")
    
    // Use the generated unique color
    this.ctx.strokeStyle = this.drawColor
    this.ctx.lineWidth = 3
    this.ctx.lineCap = 'round'
    this.ctx.lineJoin = 'round'
    this.ctx.imageSmoothingEnabled = false
    
    console.log(`[Whiteboard] Context configured: color=${this.ctx.strokeStyle}, width=${this.ctx.lineWidth}`)
  }
  
  setupEventListeners() {
    console.log("[Whiteboard] Setting up event listeners")
    
    // Mouse events (fallback for browsers with limited pointer event support)
    this.canvas.addEventListener('mousedown', (event) => {
      console.log("[Whiteboard] Mouse down event")
      this.handleMouseDown(event)
    })
    this.canvas.addEventListener('mousemove', (event) => {
      if (this.isDrawing) {
        console.log("[Whiteboard] Mouse move event")
        this.handleMouseMove(event)
      }
    })
    this.canvas.addEventListener('mouseup', (event) => {
      console.log("[Whiteboard] Mouse up event")
      this.handleMouseUp(event)
    })
    this.canvas.addEventListener('mouseout', (event) => {
      console.log("[Whiteboard] Mouse out event")
      this.handleMouseUp(event)
    })
    
    // Pointer events
    this.canvas.addEventListener('pointerdown', (event) => {
      console.log("[Whiteboard] Pointer down event")
      this.startDrawing(event)
    })
    this.canvas.addEventListener('pointermove', (event) => {
      if (this.isDrawing) {
        console.log("[Whiteboard] Pointer move event")
        this.draw(event)
      }
    })
    this.canvas.addEventListener('pointerup', (event) => {
      console.log("[Whiteboard] Pointer up event")
      this.stopDrawing(event)
    })
    this.canvas.addEventListener('pointerout', (event) => {
      console.log("[Whiteboard] Pointer out event")
      this.stopDrawing(event)
    })
    
    // Touch events
    this.canvas.addEventListener('touchstart', (event) => {
      console.log("[Whiteboard] Touch start event")
      this.handleTouchStart(event)
    }, { passive: false })
    this.canvas.addEventListener('touchmove', (event) => {
      console.log("[Whiteboard] Touch move event")
      this.handleTouchMove(event)
    }, { passive: false })
    this.canvas.addEventListener('touchend', (event) => {
      console.log("[Whiteboard] Touch end event")
      this.handleTouchEnd(event)
    }, { passive: false })
  }
  
  // Mouse event handlers (fallback)
  handleMouseDown(event) {
    event.preventDefault()
    this.startDrawing(event)
  }
  
  handleMouseMove(event) {
    event.preventDefault()
    this.draw(event)
  }
  
  handleMouseUp(event) {
    event.preventDefault()
    this.stopDrawing(event)
  }
  
  // Touch event handlers
  handleTouchStart(event) {
    event.preventDefault()
    const touch = event.touches[0]
    this.startDrawing(touch)
  }
  
  handleTouchMove(event) {
    event.preventDefault()
    const touch = event.touches[0]
    this.draw(touch)
  }
  
  handleTouchEnd(event) {
    event.preventDefault()
    this.stopDrawing(event)
  }
  
  getCanvasCoordinates(event) {
    const rect = this.canvas.getBoundingClientRect()
    const scaleX = this.canvas.width / rect.width
    const scaleY = this.canvas.height / rect.height
    
    const coords = {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY
    }
    
    console.log(`[Whiteboard] Coordinates: x=${coords.x}, y=${coords.y}`)
    return coords
  }
  
  startDrawing(event) {
    console.log("[Whiteboard] Start drawing")
    
    event.preventDefault()
    
    this.isDrawing = true
    const coords = this.getCanvasCoordinates(event)
    
    console.log(`[Whiteboard] Drawing start coordinates: x=${coords.x}, y=${coords.y}`)
    
    // Ensure we use the unique color
    this.ctx.strokeStyle = this.drawColor
    
    this.ctx.beginPath()
    this.ctx.moveTo(coords.x, coords.y)
    
    this.lastX = coords.x
    this.lastY = coords.y
    
    if (event.pointerId) {
      this.canvas.setPointerCapture(event.pointerId)
    }
  }
  
  draw(event) {
    if (!this.isDrawing) return
    
    event.preventDefault()
    
    const coords = this.getCanvasCoordinates(event)
    
    console.log(`[Whiteboard] Drawing move coordinates: x=${coords.x}, y=${coords.y}`)
    
    // Ensure we use the unique color for drawing
    this.ctx.strokeStyle = this.drawColor
    this.ctx.lineTo(coords.x, coords.y)
    this.ctx.stroke()
    
    this.broadcastDrawing({
      x1: this.lastX,
      y1: this.lastY,
      x2: coords.x,
      y2: coords.y,
      color: this.drawColor // Include color in broadcast
    })
    
    this.lastX = coords.x
    this.lastY = coords.y
  }
  
  stopDrawing(event) {
    if (this.isDrawing) {
      console.log("[Whiteboard] Stop drawing")
      
      this.isDrawing = false
      this.ctx.beginPath()
      
      if (event.pointerId) {
        this.canvas.releasePointerCapture(event.pointerId)
      }
    }
  }
  
  broadcastDrawing(drawingData) {
    console.log("[Whiteboard] Broadcasting drawing")
    const whiteboardId = this.canvas.getAttribute('data-whiteboard-id')
    
    if (this.subscription) {
      this.subscription.send({
        whiteboard_id: whiteboardId,
        drawing_data: drawingData
      })
    } else {
      console.error("[Whiteboard] WebSocket subscription not established")
    }
  }
  
  drawRemote(data) {
    const { x1, y1, x2, y2, color } = data.drawing_data
    
    this.ctx.beginPath()
    this.ctx.strokeStyle = color || 'black' // Fallback to black if no color
    this.ctx.moveTo(x1, y1)
    this.ctx.lineTo(x2, y2)
    this.ctx.stroke()
  }
  
  clearCanvas(event) {
    // Add a debugger to pause execution and inspect
    debugger;
    
    console.log("[Whiteboard] Attempting to clear canvas")
    console.warn("[Whiteboard] Clear Canvas Method Called")
    
    try {
      // Log all relevant properties
      console.log("[Whiteboard] Canvas:", this.canvas)
      console.log("[Whiteboard] Context:", this.ctx)
      console.log("[Whiteboard] Canvas Width:", this.canvas?.width)
      console.log("[Whiteboard] Canvas Height:", this.canvas?.height)
      
      // Ensure canvas and context exist
      if (!this.canvas || !this.ctx) {
        console.error("[Whiteboard] Canvas or context not initialized")
        alert("[Whiteboard] Canvas not initialized") // Add an alert for visibility
        return
      }
      
      // Clear the entire canvas
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
      console.log("[Whiteboard] Canvas cleared locally")
      
      // Get whiteboard ID
      const whiteboardId = this.canvas.getAttribute('data-whiteboard-id')
      console.log(`[Whiteboard] Whiteboard ID for clear: ${whiteboardId}`)
      
      // Broadcast canvas clear
      if (this.subscription) {
        console.log("[Whiteboard] Sending clear message via WebSocket")
        this.subscription.send({
          whiteboard_id: whiteboardId,
          drawing_data: { action: 'clear' }
        })
      } else {
        console.error("[Whiteboard] WebSocket subscription not established")
        alert("[Whiteboard] WebSocket not established") // Add an alert for visibility
      }
    } catch (error) {
      console.error("[Whiteboard] Error clearing canvas:", error)
      alert(`[Whiteboard] Error: ${error.message}`) // Add an alert for visibility
    }
  }
  
  clearCanvasRemote() {
    console.log("[Whiteboard] Clearing canvas remotely")
    
    try {
      if (!this.canvas || !this.ctx) {
        console.error("[Whiteboard] Canvas or context not initialized for remote clear")
        return
      }
      
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    } catch (error) {
      console.error("[Whiteboard] Error clearing canvas remotely:", error)
    }
  }
  
  setupWebSocket(whiteboardId) {
    console.log(`[Whiteboard] Setting up WebSocket for whiteboard ${whiteboardId}`)
    
    this.cable = createConsumer()
    
    try {
      this.subscription = this.cable.subscriptions.create(
        { 
          channel: "DrawingChannel", 
          whiteboard_id: whiteboardId 
        },
        {
          connected: () => {
            console.log(`[Whiteboard] Connected to whiteboard ${whiteboardId}`)
          },
          
          disconnected: () => {
            console.log(`[Whiteboard] Disconnected from whiteboard ${whiteboardId}`)
          },
          
          received: (data) => {
            console.log("[Whiteboard] Received WebSocket data")
            if (data.drawing_data) {
              if (data.drawing_data.action === 'clear') {
                this.clearCanvasRemote()
              } else {
                this.drawRemote(data)
              }
            }
          }
        }
      )
    } catch (error) {
      console.error(`[Whiteboard] WebSocket setup error: ${error}`)
    }
  }
}