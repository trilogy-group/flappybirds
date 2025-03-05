import { Entity } from '../core/Entity';
import { Vector2 } from '../utils/Vector2';
import { PowerUpType } from './PowerUp';

export class PowerUpEffect implements Entity {
  position: Vector2;
  velocity: Vector2;
  width: number;
  height: number;
  type: PowerUpType;
  lifetime: number;
  maxLifetime: number;
  scale: number;
  opacity: number;
  
  constructor(x: number, y: number, type: PowerUpType) {
    this.position = new Vector2(x, y);
    this.velocity = new Vector2(0, -50); // Move upward
    this.width = 80;
    this.height = 80;
    this.type = type;
    this.lifetime = 0;
    this.maxLifetime = 1.5; // Seconds
    this.scale = 0.5;
    this.opacity = 1;
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
    
    // First half: grow and fade in
    if (progress < 0.3) {
      this.scale = 0.5 + (progress / 0.3) * 0.5;
      this.opacity = Math.min(1, progress * 3);
    } 
    // Second half: fade out
    else {
      this.scale = 1;
      this.opacity = Math.max(0, 1 - ((progress - 0.3) / 0.7));
    }
  }
  
  /**
   * Check if the effect has expired
   */
  isExpired(): boolean {
    return this.lifetime >= this.maxLifetime;
  }
  
  /**
   * Render the effect to the canvas
   */
  render(context: CanvasRenderingContext2D): void {
    // Save the current context state
    context.save();
    
    // Set global alpha for fading
    context.globalAlpha = this.opacity;
    
    // Translate to the effect's position (center)
    context.translate(this.position.x, this.position.y);
    
    // Scale the context
    context.scale(this.scale, this.scale);
    
    // Draw the effect based on its type
    const halfWidth = this.width / 2;
    const halfHeight = this.height / 2;
    
    // Draw text label
    context.fillStyle = 'white';
    context.strokeStyle = 'black';
    context.lineWidth = 3;
    context.font = 'bold 20px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    
    let text = '';
    switch (this.type) {
      case 'shield':
        text = 'SHIELD!';
        context.fillStyle = '#3498db'; // Blue
        break;
      case 'slowmo':
        text = 'SLOW-MO!';
        context.fillStyle = '#9b59b6'; // Purple
        break;
      case 'score':
        text = 'DOUBLE SCORE!';
        context.fillStyle = '#f1c40f'; // Yellow
        break;
    }
    
    // Draw text with shadow
    context.shadowColor = 'rgba(0, 0, 0, 0.5)';
    context.shadowBlur = 5;
    context.shadowOffsetX = 2;
    context.shadowOffsetY = 2;
    
    context.strokeText(text, 0, 0);
    context.fillText(text, 0, 0);
    
    // Restore the context state
    context.restore();
  }
  
  /**
   * Power-up effects don't collide with anything
   */
  collidesWith(other: Entity): boolean {
    return false;
  }
} 