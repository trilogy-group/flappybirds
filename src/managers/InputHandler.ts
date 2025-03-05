/**
 * Handles user input for the game
 */
export class InputHandler {
  private keys: { [key: string]: boolean } = {};
  private mouseDown: boolean = false;
  private touchActive: boolean = false;
  isFlapping: boolean = false;
  
  constructor() {
    // Initialize with all keys up
    this.keys = {};
    
    // Add event listeners
    this.addEventListeners();
  }
  
  /**
   * Add all event listeners
   */
  addEventListeners(): void {
    // Keyboard events
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('keyup', this.handleKeyUp.bind(this));
    
    // Mouse events
    window.addEventListener('mousedown', this.handleMouseDown.bind(this));
    window.addEventListener('mouseup', this.handleMouseUp.bind(this));
    
    // Touch events
    window.addEventListener('touchstart', this.handleTouchStart.bind(this));
    window.addEventListener('touchend', this.handleTouchEnd.bind(this));
  }
  
  /**
   * Remove all event listeners
   */
  removeEventListeners(): void {
    // Keyboard events
    window.removeEventListener('keydown', this.handleKeyDown.bind(this));
    window.removeEventListener('keyup', this.handleKeyUp.bind(this));
    
    // Mouse events
    window.removeEventListener('mousedown', this.handleMouseDown.bind(this));
    window.removeEventListener('mouseup', this.handleMouseUp.bind(this));
    
    // Touch events
    window.removeEventListener('touchstart', this.handleTouchStart.bind(this));
    window.removeEventListener('touchend', this.handleTouchEnd.bind(this));
  }
  
  /**
   * Handle keydown events
   */
  private handleKeyDown(event: KeyboardEvent): void {
    this.keys[event.key] = true;
    
    // Handle specific key presses
    if (event.key === ' ' || event.key === 'ArrowUp') {
      this.isFlapping = true;
      event.preventDefault();
    }
  }
  
  /**
   * Handle keyup events
   */
  private handleKeyUp(event: KeyboardEvent): void {
    this.keys[event.key] = false;
  }
  
  /**
   * Handle mouse down event
   */
  private handleMouseDown(_event: MouseEvent): void {
    this.mouseDown = true;
    this.isFlapping = true;
  }
  
  /**
   * Handle mouse up event
   */
  private handleMouseUp(_event: MouseEvent): void {
    this.mouseDown = false;
  }
  
  /**
   * Handle touchstart events
   */
  private handleTouchStart(event: TouchEvent): void {
    this.touchActive = true;
    this.isFlapping = true;
    event.preventDefault();
  }
  
  /**
   * Handle touchend events
   */
  private handleTouchEnd(event: TouchEvent): void {
    this.touchActive = false;
    event.preventDefault();
  }
  
  /**
   * Check if a specific key is pressed
   */
  isKeyPressed(key: string): boolean {
    return this.keys[key] === true;
  }
  
  /**
   * Check if any flap input is active
   */
  isFlapActive(): boolean {
    return (
      this.isKeyPressed(' ') ||
      this.isKeyPressed('ArrowUp') ||
      this.mouseDown ||
      this.touchActive
    );
  }
} 