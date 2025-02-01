import { Controller } from "@hotwired/stimulus"
import { createConsumer } from "@rails/actioncable"

export default class extends Controller {
  static targets = [ "canvas" ]
  
  connect() {
    console.log("[Whiteboard] Controller connecting...")
    
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
    
    // Explicit context configuration
    this.ctx.strokeStyle = 'black'
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
    
    this.ctx.lineTo(coords.x, coords.y)
    this.ctx.stroke()
    
    this.broadcastDrawing({
      x1: this.lastX,
      y1: this.lastY,
      x2: coords.x,
      y2: coords.y
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
    const { x1, y1, x2, y2 } = data.drawing_data
    
    this.ctx.beginPath()
    this.ctx.moveTo(x1, y1)
    this.ctx.lineTo(x2, y2)
    this.ctx.stroke()
  }
  
  clearCanvas() {
    console.log("[Whiteboard] Clearing canvas")
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    
    const whiteboardId = this.canvas.getAttribute('data-whiteboard-id')
    
    if (this.subscription) {
      this.subscription.send({
        whiteboard_id: whiteboardId,
        drawing_data: { action: 'clear' }
      })
    } else {
      console.error("[Whiteboard] WebSocket subscription not established")
    }
  }
  
  clearCanvasRemote() {
    console.log("[Whiteboard] Clearing canvas remotely")
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
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