import { Entity } from '../core/Entity';
import { Vector2 } from '../utils/Vector2';

// Import the game speed
import { GAME_SPEED } from '../core/Game';

export class Pipe implements Entity {
  position: Vector2;
  velocity: Vector2;
  width: number;
  height: number;
  isTop: boolean;
  isSpecial: boolean;
  isPassed: boolean;
  sprite: HTMLImageElement;
  
  constructor(x: number, y: number, height: number, isTop: boolean, isSpecial: boolean = false, speed: number = GAME_SPEED) {
    this.position = new Vector2(x, y);
    this.velocity = new Vector2(-speed, 0); // Use the provided speed or default to GAME_SPEED
    this.width = 52; // Width of the pipe sprite
    this.height = height;
    this.isTop = isTop;
    this.isSpecial = isSpecial;
    this.isPassed = false;
    
    // Load pipe sprite based on type (green or red)
    this.sprite = new Image();
    this.sprite.src = this.isSpecial 
      ? 'assets/sprites/pipe-red.png'
      : 'assets/sprites/pipe-green.png';
  }
  
  /**
   * Update the pipe's position
   */
  update(deltaTime: number): void {
    // Update position based on velocity
    this.position.x += this.velocity.x * deltaTime;
  }
  
  /**
   * Render the pipe to the canvas
   */
  render(context: CanvasRenderingContext2D): void {
    if (this.sprite.complete) {
      const pipeX = this.position.x - this.width / 2;
      
      if (this.isTop) {
        // For top pipes, we need to flip the sprite vertically
        context.save();
        
        // Draw the pipe upside down
        context.translate(pipeX + this.width / 2, this.position.y);
        context.scale(1, -1);
        context.drawImage(
          this.sprite,
          -this.width / 2,
          0,
          this.width,
          this.height
        );
        
        context.restore();
      } else {
        // For bottom pipes, draw normally
        context.drawImage(
          this.sprite,
          pipeX,
          this.position.y,
          this.width,
          this.height
        );
      }
    } else {
      // Fallback if sprite isn't loaded yet
      // Use different colors for special pipes
      context.fillStyle = this.isSpecial ? '#E73C3C' : '#74BF2E'; // Red or Green
      
      // Draw the main pipe body
      const pipeX = this.position.x - this.width / 2;
      const pipeY = this.isTop ? this.position.y - this.height : this.position.y;
      
      context.fillRect(
        pipeX,
        pipeY,
        this.width,
        this.height
      );
      
      // Draw the pipe cap
      const capHeight = 20;
      const capWidth = this.width + 10;
      
      context.fillRect(
        this.position.x - capWidth / 2,
        this.isTop ? this.position.y - this.height - capHeight : this.position.y,
        capWidth,
        capHeight
      );
    }
    
    // Debug: draw collision box
    const showDebugCollision = false; // Set to true to see collision box
    if (showDebugCollision) {
      context.strokeStyle = 'red';
      context.lineWidth = 2;
      
      const pipeX = this.position.x - this.width / 2;
      const pipeY = this.isTop ? this.position.y - this.height : this.position.y;
      
      context.strokeRect(
        pipeX,
        pipeY,
        this.width,
        this.height
      );
    }
  }
  
  /**
   * Check if the pipe collides with another entity
   */
  collidesWith(other: Entity): boolean {
    // Get the actual collision box coordinates
    const pipeLeft = this.position.x - this.width / 2;
    const pipeRight = pipeLeft + this.width;
    
    // For top pipes, the top is at (position.y - height) and bottom is at position.y
    // For bottom pipes, the top is at position.y and bottom is at (position.y + height)
    const pipeTop = this.isTop ? this.position.y - this.height : this.position.y;
    const pipeBottom = this.isTop ? this.position.y : this.position.y + this.height;
    
    // Get the bird's collision box coordinates
    const birdLeft = other.position.x - other.width / 2;
    const birdRight = birdLeft + other.width;
    const birdTop = other.position.y - other.height / 2;
    const birdBottom = birdTop + other.height;
    
    // Check for overlap
    return (
      pipeLeft < birdRight &&
      pipeRight > birdLeft &&
      pipeTop < birdBottom &&
      pipeBottom > birdTop
    );
  }
  
  /**
   * Check if the pipe has been passed by the bird
   */
  checkPassed(birdX: number): boolean {
    // Calculate the right edge of the pipe
    const pipeRightEdge = this.position.x + this.width / 2;
    
    // Only check for top pipes to avoid counting twice
    // Only count when the bird has fully passed the right edge of the pipe
    if (this.isTop && !this.isPassed && birdX > pipeRightEdge) {
      this.isPassed = true;
      return true;
    }
    return false;
  }
} 