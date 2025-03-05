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
    
    // Set the global alpha for transparency
    context.globalAlpha = this.opacity;
    
    // Translate to the center position of the effect
    context.translate(this.position.x, this.position.y);
    
    // Scale the context based on the effect's scale
    context.scale(this.scale, this.scale);
    
    // Draw the power-up icon
    const iconSize = 30;
    
    // Draw different icons based on the power-up type
    switch (this.type) {
      case 'shield':
        // Draw shield icon (blue circle)
        context.beginPath();
        context.arc(0, 0, iconSize / 2, 0, Math.PI * 2);
        context.fillStyle = 'rgba(30, 144, 255, 0.7)';
        context.fill();
        context.strokeStyle = 'white';
        context.lineWidth = 2;
        context.stroke();
        
        // Draw shield symbol
        context.beginPath();
        context.moveTo(0, -iconSize / 3);
        context.lineTo(-iconSize / 3, 0);
        context.lineTo(0, iconSize / 3);
        context.lineTo(iconSize / 3, 0);
        context.closePath();
        context.fillStyle = 'white';
        context.fill();
        break;
        
      case 'slowmo':
        // Draw slow motion icon (purple circle with clock)
        context.beginPath();
        context.arc(0, 0, iconSize / 2, 0, Math.PI * 2);
        context.fillStyle = 'rgba(128, 0, 128, 0.7)';
        context.fill();
        context.strokeStyle = 'white';
        context.lineWidth = 2;
        context.stroke();
        
        // Draw clock hands
        context.beginPath();
        context.moveTo(0, 0);
        context.lineTo(0, -iconSize / 3);
        context.moveTo(0, 0);
        context.lineTo(iconSize / 4, iconSize / 5);
        context.strokeStyle = 'white';
        context.lineWidth = 2;
        context.stroke();
        break;
        
      case 'score':
        // Draw score boost icon (gold circle with star)
        context.beginPath();
        context.arc(0, 0, iconSize / 2, 0, Math.PI * 2);
        context.fillStyle = 'rgba(255, 215, 0, 0.7)';
        context.fill();
        context.strokeStyle = 'white';
        context.lineWidth = 2;
        context.stroke();
        
        // Draw star
        const spikes = 5;
        const outerRadius = iconSize / 3;
        const innerRadius = outerRadius / 2;
        
        context.beginPath();
        for (let i = 0; i < spikes * 2; i++) {
          const radius = i % 2 === 0 ? outerRadius : innerRadius;
          const angle = (Math.PI * i) / spikes - Math.PI / 2;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          
          if (i === 0) {
            context.moveTo(x, y);
          } else {
            context.lineTo(x, y);
          }
        }
        context.closePath();
        context.fillStyle = 'white';
        context.fill();
        break;
    }
    
    // Restore the context to its original state
    context.restore();
  }
  
  /**
   * Check if this entity collides with another entity
   * Power-up effects don't collide with anything
   */
  collidesWith(_other: Entity): boolean {
    return false;
  }
} 