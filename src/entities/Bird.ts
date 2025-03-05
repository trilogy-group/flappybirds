import { Entity } from '../core/Entity';
import { Vector2 } from '../utils/Vector2';

export type BirdColor = 'yellow' | 'red' | 'blue';

export class Bird implements Entity {
  position: Vector2;
  velocity: Vector2;
  acceleration: Vector2;
  width: number;
  height: number;
  rotation: number;
  gravity: number;
  flapStrength: number;
  maxSpeed: number;
  color: BirdColor;
  
  // Animation properties
  sprites: HTMLImageElement[];
  currentFrame: number;
  frameTimer: number;
  frameDuration: number;
  
  // Power-up properties
  hasShield: boolean;
  shieldTimer: number;
  shieldDuration: number;
  
  constructor(x: number, y: number, color: BirdColor = 'yellow') {
    this.position = new Vector2(x, y);
    this.velocity = new Vector2(0, 0);
    this.acceleration = new Vector2(0, 0);
    this.width = 34; // Width of the bird sprite
    this.height = 24; // Height of the bird sprite
    this.rotation = 0;
    this.gravity = 900; // Gravity strength
    this.flapStrength = -350; // Negative because y-axis is inverted in canvas
    this.maxSpeed = 400; // Maximum falling speed
    this.color = color;
    
    // Initialize animation properties
    this.sprites = [];
    this.loadSprites();
    this.currentFrame = 0;
    this.frameTimer = 0;
    this.frameDuration = 0.1; // Time between frame changes in seconds
    
    // Initialize power-up properties
    this.hasShield = false;
    this.shieldTimer = 0;
    this.shieldDuration = 5; // Shield lasts for 5 seconds
  }
  
  /**
   * Load the bird sprite images
   */
  private loadSprites(): void {
    const spriteFiles = [
      `${this.color}bird-downflap.png`,
      `${this.color}bird-midflap.png`,
      `${this.color}bird-upflap.png`
    ];
    
    // Load each sprite
    spriteFiles.forEach(file => {
      const img = new Image();
      img.src = `/assets/sprites/${file}`;
      this.sprites.push(img);
    });
  }
  
  /**
   * Change the bird's color and reload sprites
   */
  setColor(color: BirdColor): void {
    this.color = color;
    this.sprites = []; // Clear existing sprites
    this.loadSprites(); // Load new sprites
  }
  
  /**
   * Activate the shield power-up
   */
  activateShield(): void {
    this.hasShield = true;
    this.shieldTimer = 0;
  }
  
  /**
   * Make the bird flap its wings (jump)
   */
  flap(): void {
    this.velocity.y = this.flapStrength;
  }
  
  /**
   * Update the bird's position, rotation, and animation
   */
  update(deltaTime: number): void {
    // Apply gravity
    this.acceleration.y = this.gravity;
    
    // Update velocity based on acceleration
    this.velocity.y += this.acceleration.y * deltaTime;
    
    // Limit falling speed
    if (this.velocity.y > this.maxSpeed) {
      this.velocity.y = this.maxSpeed;
    }
    
    // Update position based on velocity
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
    
    // Update rotation based on velocity
    // When going up, rotate upward; when falling, rotate downward
    const targetRotation = this.velocity.y > 0 ? 
      Math.min(Math.PI / 4, this.velocity.y / this.maxSpeed * Math.PI / 2) : 
      Math.max(-Math.PI / 6, this.velocity.y / this.flapStrength * Math.PI / 6);
    
    // Smooth rotation transition
    this.rotation = this.rotation + (targetRotation - this.rotation) * 5 * deltaTime;
    
    // Update animation frame
    this.frameTimer += deltaTime;
    if (this.frameTimer >= this.frameDuration) {
      this.frameTimer = 0;
      this.currentFrame = (this.currentFrame + 1) % this.sprites.length;
    }
    
    // Update shield timer
    if (this.hasShield) {
      this.shieldTimer += deltaTime;
      if (this.shieldTimer >= this.shieldDuration) {
        this.hasShield = false;
      }
    }
  }
  
  /**
   * Render the bird to the canvas
   */
  render(context: CanvasRenderingContext2D): void {
    // Save the current context state
    context.save();
    
    // Translate to the bird's position (center)
    context.translate(this.position.x, this.position.y);
    
    // Rotate the context
    context.rotate(this.rotation);
    
    // Draw the bird sprite
    if (this.sprites.length > 0 && this.sprites[this.currentFrame].complete) {
      context.drawImage(
        this.sprites[this.currentFrame],
        -this.width / 2,
        -this.height / 2,
        this.width,
        this.height
      );
    } else {
      // Fallback if sprites aren't loaded yet
      // Use different colors based on bird type
      let fillColor = '#f8e71c'; // Default yellow
      if (this.color === 'red') fillColor = '#e74c3c';
      if (this.color === 'blue') fillColor = '#3498db';
      
      context.fillStyle = fillColor;
      context.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    }
    
    // Draw shield effect if active
    if (this.hasShield) {
      const shieldRadius = Math.max(this.width, this.height) * 0.8;
      const pulseScale = 1 + Math.sin(this.shieldTimer * 5) * 0.1;
      const fadeOut = Math.min(1, (this.shieldDuration - this.shieldTimer) / 1.5);
      
      // Draw shield glow
      const gradient = context.createRadialGradient(0, 0, 0, 0, 0, shieldRadius * pulseScale);
      gradient.addColorStop(0, 'rgba(52, 152, 219, 0.1)');
      gradient.addColorStop(0.7, 'rgba(52, 152, 219, 0.3)');
      gradient.addColorStop(1, 'rgba(52, 152, 219, 0)');
      
      context.globalAlpha = fadeOut;
      context.fillStyle = gradient;
      context.beginPath();
      context.arc(0, 0, shieldRadius * pulseScale, 0, Math.PI * 2);
      context.fill();
      
      // Draw shield outline
      context.strokeStyle = 'rgba(52, 152, 219, ' + fadeOut + ')';
      context.lineWidth = 2;
      context.beginPath();
      context.arc(0, 0, shieldRadius * pulseScale, 0, Math.PI * 2);
      context.stroke();
      
      context.globalAlpha = 1;
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
   * Check if the bird collides with another entity
   */
  collidesWith(other: Entity): boolean {
    // Add a small buffer to make collision detection more forgiving
    const collisionBuffer = 4; // Pixels of forgiveness
    
    // Get the bird's collision box coordinates with buffer
    const birdLeft = this.position.x - this.width / 2 + collisionBuffer;
    const birdRight = this.position.x + this.width / 2 - collisionBuffer;
    const birdTop = this.position.y - this.height / 2 + collisionBuffer;
    const birdBottom = this.position.y + this.height / 2 - collisionBuffer;
    
    // Get the other entity's collision box coordinates
    let otherLeft, otherRight, otherTop, otherBottom;
    
    // Special handling for Pipe entities
    if ('isTop' in other) {
      // It's a pipe
      const pipe = other as unknown as { isTop: boolean; position: Vector2; width: number; height: number };
      otherLeft = pipe.position.x - pipe.width / 2;
      otherRight = otherLeft + pipe.width;
      
      if (pipe.isTop) {
        otherTop = pipe.position.y - pipe.height;
        otherBottom = pipe.position.y;
      } else {
        otherTop = pipe.position.y;
        otherBottom = pipe.position.y + pipe.height;
      }
    } else {
      // Generic entity
      otherLeft = other.position.x - other.width / 2;
      otherRight = otherLeft + other.width;
      otherTop = other.position.y - other.height / 2;
      otherBottom = otherTop + other.height;
    }
    
    // Check for overlap
    return (
      birdLeft < otherRight &&
      birdRight > otherLeft &&
      birdTop < otherBottom &&
      birdBottom > otherTop
    );
  }
} 