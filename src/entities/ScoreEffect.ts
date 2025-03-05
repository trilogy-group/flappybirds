import { Entity } from '../core/Entity';
import { Vector2 } from '../utils/Vector2';

/**
 * Visual effect displayed when player scores a point
 */
export class ScoreEffect implements Entity {
  position: Vector2;
  velocity: Vector2;
  width: number;
  height: number;
  opacity: number;
  scale: number;
  lifetime: number;
  maxLifetime: number;
  text: string;
  
  constructor(x: number, y: number, text: string = '+1') {
    this.position = new Vector2(x, y);
    this.velocity = new Vector2(0, -60); // Move upward
    this.width = 40;
    this.height = 40;
    this.opacity = 1;
    this.scale = 1;
    this.lifetime = 0;
    this.maxLifetime = 1.5; // Effect lasts for 1.5 seconds
    this.text = text;
  }
  
  /**
   * Update the effect's position and appearance
   */
  update(deltaTime: number): void {
    // Update position
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
    
    // Update lifetime
    this.lifetime += deltaTime;
    
    // Calculate progress (0 to 1)
    const progress = this.lifetime / this.maxLifetime;
    
    // Update appearance based on progress
    if (progress < 0.2) {
      // Growing phase
      this.scale = 1 + progress * 2;
      this.opacity = 1;
    } else {
      // Fading phase
      this.scale = 1.4 - (progress - 0.2) * 0.5;
      this.opacity = 1 - (progress - 0.2) * 1.25;
    }
  }
  
  /**
   * Render the score effect
   */
  render(context: CanvasRenderingContext2D): void {
    // Skip rendering if fully transparent
    if (this.opacity <= 0) return;
    
    context.save();
    
    // Set text properties
    context.font = `bold ${Math.floor(30 * this.scale)}px Arial`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    
    // Draw text with shadow
    context.fillStyle = 'rgba(0, 0, 0, ' + (this.opacity * 0.5) + ')';
    context.fillText(this.text, this.position.x + 2, this.position.y + 2);
    
    // Draw main text
    context.fillStyle = 'rgba(255, 255, 255, ' + this.opacity + ')';
    context.fillText(this.text, this.position.x, this.position.y);
    
    context.restore();
  }
  
  /**
   * Check if the effect has expired
   */
  isExpired(): boolean {
    return this.lifetime >= this.maxLifetime;
  }
  
  /**
   * Score effects don't collide with anything
   */
  collidesWith(other: Entity): boolean {
    return false;
  }
} 