import { Entity } from '../core/Entity';
import { Vector2 } from '../utils/Vector2';
import { GAME_SPEED } from '../core/Game';

export type PowerUpType = 'shield' | 'slowmo' | 'score';

export class PowerUp implements Entity {
  position: Vector2;
  velocity: Vector2;
  width: number;
  height: number;
  type: PowerUpType;
  isCollected: boolean;
  animationTimer: number;
  bobAmount: number;
  rotationAngle: number;
  
  constructor(x: number, y: number, type: PowerUpType) {
    this.position = new Vector2(x, y);
    this.velocity = new Vector2(-GAME_SPEED, 0);
    this.width = 40;
    this.height = 40;
    this.type = type;
    this.isCollected = false;
    this.animationTimer = 0;
    this.bobAmount = 10; // Pixels to move up and down
    this.rotationAngle = 0;
  }
  
  /**
   * Update the power-up's position and animation
   */
  update(deltaTime: number): void {
    // Update position based on velocity
    this.position.x += this.velocity.x * deltaTime;
    
    // Update animation
    this.animationTimer += deltaTime;
    
    // Bobbing motion
    const bobOffset = Math.sin(this.animationTimer * 3) * this.bobAmount;
    this.position.y = this.position.y - bobOffset * deltaTime * 5;
    
    // Rotation
    this.rotationAngle += deltaTime * 2;
    if (this.rotationAngle > Math.PI * 2) {
      this.rotationAngle -= Math.PI * 2;
    }
  }
  
  /**
   * Set the power-up's speed
   */
  setSpeed(speed: number): void {
    this.velocity.x = -speed;
  }
  
  /**
   * Render the power-up to the canvas
   */
  render(context: CanvasRenderingContext2D): void {
    // Save the current context state
    context.save();
    
    // Translate to the power-up's position (center)
    context.translate(this.position.x, this.position.y);
    
    // Rotate the context
    context.rotate(this.rotationAngle);
    
    // Draw the power-up based on its type
    const halfWidth = this.width / 2;
    const halfHeight = this.height / 2;
    
    // Draw a glowing circle
    const gradient = context.createRadialGradient(0, 0, 5, 0, 0, halfWidth);
    
    switch (this.type) {
      case 'shield':
        gradient.addColorStop(0, 'rgba(52, 152, 219, 1)'); // Blue center
        gradient.addColorStop(1, 'rgba(52, 152, 219, 0)'); // Transparent edge
        break;
      case 'slowmo':
        gradient.addColorStop(0, 'rgba(155, 89, 182, 1)'); // Purple center
        gradient.addColorStop(1, 'rgba(155, 89, 182, 0)'); // Transparent edge
        break;
      case 'score':
        gradient.addColorStop(0, 'rgba(241, 196, 15, 1)'); // Yellow center
        gradient.addColorStop(1, 'rgba(241, 196, 15, 0)'); // Transparent edge
        break;
    }
    
    context.fillStyle = gradient;
    context.beginPath();
    context.arc(0, 0, halfWidth, 0, Math.PI * 2);
    context.fill();
    
    // Draw the power-up icon
    context.fillStyle = 'white';
    context.strokeStyle = 'black';
    context.lineWidth = 2;
    
    switch (this.type) {
      case 'shield':
        // Draw a shield icon
        context.beginPath();
        context.moveTo(0, -halfHeight * 0.5);
        context.lineTo(halfWidth * 0.6, halfHeight * 0.3);
        context.lineTo(0, halfHeight * 0.7);
        context.lineTo(-halfWidth * 0.6, halfHeight * 0.3);
        context.closePath();
        context.fill();
        context.stroke();
        break;
      case 'slowmo':
        // Draw a clock icon
        context.beginPath();
        context.arc(0, 0, halfWidth * 0.6, 0, Math.PI * 2);
        context.fill();
        context.stroke();
        
        // Draw clock hands
        context.beginPath();
        context.moveTo(0, 0);
        context.lineTo(0, -halfHeight * 0.4);
        context.stroke();
        
        context.beginPath();
        context.moveTo(0, 0);
        context.lineTo(halfWidth * 0.3, 0);
        context.stroke();
        break;
      case 'score':
        // Draw a star icon
        const spikes = 5;
        const outerRadius = halfWidth * 0.7;
        const innerRadius = outerRadius * 0.4;
        
        context.beginPath();
        for (let i = 0; i < spikes * 2; i++) {
          const radius = i % 2 === 0 ? outerRadius : innerRadius;
          const angle = (Math.PI / spikes) * i - Math.PI / 2;
          const x = radius * Math.cos(angle);
          const y = radius * Math.sin(angle);
          
          if (i === 0) {
            context.moveTo(x, y);
          } else {
            context.lineTo(x, y);
          }
        }
        context.closePath();
        context.fill();
        context.stroke();
        break;
    }
    
    // Restore the context state
    context.restore();
    
    // Debug: draw collision box
    const showDebugCollision = false; // Set to true to see collision box
    if (showDebugCollision) {
      context.strokeStyle = 'red';
      context.lineWidth = 2;
      context.strokeRect(
        this.position.x - this.width / 2,
        this.position.y - this.height / 2,
        this.width,
        this.height
      );
    }
  }
  
  /**
   * Check if the power-up collides with another entity
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