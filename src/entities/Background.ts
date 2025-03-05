import { Entity } from '../core/Entity';
import { Vector2 } from '../utils/Vector2';
import { GAME_SPEED } from '../core/Game';

/**
 * Background layer with parallax scrolling effect
 */
export class Background implements Entity {
  position: Vector2;
  velocity: Vector2;
  width: number;
  height: number;
  layers: BackgroundLayer[];
  backgroundImage: HTMLImageElement;
  currentSpeed: number;
  
  constructor(width: number, height: number) {
    this.position = new Vector2(width / 2, height / 2);
    this.velocity = new Vector2(0, 0);
    this.width = width;
    this.height = height;
    this.currentSpeed = GAME_SPEED;
    
    // Load background image
    this.backgroundImage = new Image();
    this.backgroundImage.src = 'assets/sprites/background-day.png';
    
    // Create background layers with different speeds for parallax effect
    this.layers = [
      // Base ground (fastest)
      new BackgroundLayer('#DED895', 0, height - 112, width, 112, 1, false, 'ground', true)
    ];
  }
  
  /**
   * Update all background layers
   */
  update(deltaTime: number): void {
    // Update each layer
    for (const layer of this.layers) {
      layer.update(deltaTime, this.currentSpeed);
    }
  }
  
  /**
   * Set the current game speed
   */
  setSpeed(speed: number): void {
    this.currentSpeed = speed;
  }
  
  /**
   * Render all background layers
   */
  render(context: CanvasRenderingContext2D): void {
    // Draw the background image
    const bgHeight = this.height - 112; // Leave space for ground
    
    // Calculate how many times to repeat the background horizontally
    const bgWidth = this.backgroundImage.width;
    const repetitions = Math.ceil(this.width / bgWidth) + 1;
    
    // Draw repeated background images
    for (let i = 0; i < repetitions; i++) {
      context.drawImage(
        this.backgroundImage,
        i * bgWidth,
        0,
        bgWidth,
        bgHeight
      );
    }
    
    // Render each layer
    for (const layer of this.layers) {
      layer.render(context);
    }
  }
  
  /**
   * Check if this entity collides with another entity
   * Background doesn't collide with anything
   */
  collidesWith(_other: Entity): boolean {
    return false;
  }
}

/**
 * Individual background layer with parallax effect
 */
class BackgroundLayer {
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
  speedFactor: number;
  segments: { x: number, width: number }[];
  isCityscape: boolean;
  cloudType: string;
  isGround: boolean;
  groundImage: HTMLImageElement | null = null;
  
  constructor(color: string, x: number, y: number, width: number, height: number, speedFactor: number, isCityscape: boolean = false, cloudType: string = 'medium', isGround: boolean = false) {
    this.color = color;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speedFactor = speedFactor;
    this.isCityscape = isCityscape;
    this.cloudType = cloudType;
    this.isGround = isGround;
    
    // Create three segments for infinite scrolling
    this.segments = [
      { x: 0, width },
      { x: width, width },
      { x: width * 2, width }
    ];
    
    // Load ground image if this is a ground layer
    if (isGround) {
      this.groundImage = new Image();
      this.groundImage.src = 'assets/sprites/base.png';
    }
  }
  
  /**
   * Update layer position based on speed factor
   */
  update(deltaTime: number, currentSpeed: number = GAME_SPEED): void {
    // Skip update for static layers (speed factor 0)
    if (this.speedFactor === 0) return;
    
    // Move each segment
    for (let i = 0; i < this.segments.length; i++) {
      // Move segment based on current game speed and speed factor
      this.segments[i].x -= currentSpeed * this.speedFactor * deltaTime;
      
      // If segment has moved off-screen to the left, move it to the right
      if (this.segments[i].x <= -this.width) {
        // Move it to the end of the last segment
        const lastSegmentIndex = (i === 0) ? this.segments.length - 1 : i - 1;
        this.segments[i].x = this.segments[lastSegmentIndex].x + this.width;
      }
    }
  }
  
  /**
   * Render the layer
   */
  render(context: CanvasRenderingContext2D): void {
    // Draw ground using the ground image
    if (this.isGround && this.groundImage) {
      for (const segment of this.segments) {
        // Calculate how many times to repeat the ground image horizontally
        const groundWidth = this.groundImage.width;
        const repetitions = Math.ceil(segment.width / groundWidth) + 1;
        
        for (let i = 0; i < repetitions; i++) {
          const x = segment.x + (i * groundWidth);
          // Only draw if it would be visible on screen
          if (x < -groundWidth || x > segment.width) continue;
          
          context.drawImage(
            this.groundImage,
            x,
            this.y,
            groundWidth,
            this.height
          );
        }
      }
      return;
    }
    
    // For other layer types (not used with the image assets)
    context.fillStyle = this.color;
    
    // Draw sky (full background)
    if (this.speedFactor === 0) {
      context.fillRect(0, 0, this.width, this.height);
      return;
    }
  }
} 