/**
 * A 2D vector class for handling positions, velocities, and other 2D values
 */
export class Vector2 {
  constructor(public x: number = 0, public y: number = 0) {}

  /**
   * Add another vector to this one
   */
  add(v: Vector2): Vector2 {
    return new Vector2(this.x + v.x, this.y + v.y);
  }

  /**
   * Subtract another vector from this one
   */
  subtract(v: Vector2): Vector2 {
    return new Vector2(this.x - v.x, this.y - v.y);
  }

  /**
   * Multiply this vector by a scalar value
   */
  multiply(scalar: number): Vector2 {
    return new Vector2(this.x * scalar, this.y * scalar);
  }

  /**
   * Calculate the magnitude (length) of this vector
   */
  magnitude(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  /**
   * Normalize this vector (make it a unit vector)
   */
  normalize(): Vector2 {
    const mag = this.magnitude();
    if (mag === 0) {
      return new Vector2();
    }
    return new Vector2(this.x / mag, this.y / mag);
  }

  /**
   * Calculate the distance between this vector and another
   */
  distance(v: Vector2): number {
    return this.subtract(v).magnitude();
  }

  /**
   * Create a copy of this vector
   */
  clone(): Vector2 {
    return new Vector2(this.x, this.y);
  }
} 