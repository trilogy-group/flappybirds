import { Vector2 } from '../utils/Vector2';

/**
 * Interface for all game entities
 */
export interface Entity {
  position: Vector2;
  velocity: Vector2;
  width: number;
  height: number;
  
  /**
   * Update the entity's state
   * @param deltaTime Time elapsed since the last update in seconds
   */
  update(deltaTime: number): void;
  
  /**
   * Render the entity to the canvas
   * @param context The canvas rendering context
   */
  render(context: CanvasRenderingContext2D): void;
  
  /**
   * Check if this entity collides with another entity
   * @param other The other entity to check collision with
   */
  collidesWith(other: Entity): boolean;
} 