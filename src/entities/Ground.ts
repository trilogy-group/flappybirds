import { Entity } from '../core/Entity';
import { Vector2 } from '../utils/Vector2';
import { GAME_SPEED } from '../core/Game';

export class Ground implements Entity {
  position: Vector2;
  velocity: Vector2;
  width: number;
  height: number;
  sprite: HTMLImageElement;
  
  constructor(x: number, y: number, width: number, height: number, speed: number = GAME_SPEED) {
    this.position = new Vector2(x, y);
    this.velocity = new Vector2(-speed, 0); // Use the provided speed or default to GAME_SPEED
    this.width = width;
    this.height = height;
    
    // Load the ground sprite
    this.sprite = new Image();
    this.sprite.src = 'assets/sprites/base.png';
  }
  
  /**
   * Update the ground's position
   */
  update(deltaTime: number): void {
    // Update position based on velocity
    this.position.x += this.velocity.x * deltaTime;
    
    // If the ground has moved too far left, reset its position
    // We now reset it when it's just about to go completely off-screen
    // This ensures smoother scrolling with no visible gaps
    if (this.position.x < -this.width * 0.9) {
      this.position.x += this.width * 2; // Jump ahead by 2 segments
    }
  }
  
  /**
   * Set the ground speed
   */
  setSpeed(speed: number): void {
    this.velocity.x = -speed;
  }
  
  /**
   * Render the ground to the canvas
   */
  render(context: CanvasRenderingContext2D): void {
    if (this.sprite.complete) {
      // Draw the ground sprite
      context.drawImage(
        this.sprite,
        this.position.x - this.width / 2,
        this.position.y - this.height / 2,
        this.width,
        this.height
      );
    } else {
      // Fallback if sprite isn't loaded yet
      // Draw the ground
      context.fillStyle = '#DED895'; // Sandy color
      context.fillRect(
        this.position.x - this.width / 2,
        this.position.y - this.height / 2,
        this.width,
        this.height
      );
      
      // Draw a line at the top of the ground
      context.strokeStyle = '#85643B';
      context.lineWidth = 3;
      context.beginPath();
      context.moveTo(this.position.x - this.width / 2, this.position.y - this.height / 2);
      context.lineTo(this.position.x + this.width / 2, this.position.y - this.height / 2);
      context.stroke();
      
      // Draw some grass tufts
      context.fillStyle = '#8ED943';
      for (let i = 0; i < this.width; i += 30) {
        const x = this.position.x - this.width / 2 + i;
        const height = 5 + Math.random() * 5;
        context.fillRect(x, this.position.y - this.height / 2 - height, 10, height);
      }
    }
  }
  
  /**
   * Check if the ground collides with another entity
   */
  collidesWith(other: Entity): boolean {
    // Simple AABB collision detection
    const halfWidthA = this.width / 2;
    const halfHeightA = this.height / 2;
    const halfWidthB = other.width / 2;
    const halfHeightB = other.height / 2;
    
    // Calculate the distance between centers
    const dx = Math.abs(this.position.x - other.position.x);
    const dy = Math.abs(this.position.y - other.position.y);
    
    // Check if the distance is less than the sum of half-widths and half-heights
    return dx < halfWidthA + halfWidthB && dy < halfHeightA + halfHeightB;
  }
} 