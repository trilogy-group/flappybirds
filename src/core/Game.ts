import { Bird, BirdColor } from '../entities/Bird';
import { Ground } from '../entities/Ground';
import { Pipe } from '../entities/Pipe';
import { Background } from '../entities/Background';
import { ScoreEffect } from '../entities/ScoreEffect';
import { PowerUp, PowerUpType } from '../entities/PowerUp';
import { PowerUpEffect } from '../entities/PowerUpEffect';
import { InputHandler } from '../managers/InputHandler';
import { Entity } from './Entity';

// Game constants
export const GAME_SPEED = 200; // Base speed in pixels per second
export const MAX_GAME_SPEED = 400; // Maximum game speed
export const MIN_PIPE_GAP = 100; // Minimum gap between pipes
export const INITIAL_PIPE_GAP = 150; // Initial gap between pipes
export const MIN_PIPE_INTERVAL = 0.8; // Minimum time between pipe spawns
export const INITIAL_PIPE_INTERVAL = 1.5; // Initial time between pipe spawns

/**
 * Main game class that manages the game state and entities
 */
export class Game {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private bird!: Bird; // Using the definite assignment assertion
  private grounds: Ground[] = [];
  private pipes: Pipe[] = [];
  private background!: Background;
  private scoreEffects: ScoreEffect[] = [];
  private powerUps: PowerUp[] = [];
  private powerUpEffects: PowerUpEffect[] = [];
  private entities: Entity[] = [];
  private inputHandler: InputHandler;
  private lastTime: number = 0;
  private score: number = 0;
  private highScore: number = 0;
  private gameOver: boolean = false;
  private isPaused: boolean = false;
  private pipeSpawnTimer: number = 0;
  private pipeSpawnInterval: number = INITIAL_PIPE_INTERVAL; // Seconds between pipe spawns
  private powerUpSpawnTimer: number = 0;
  private powerUpSpawnInterval: number = 10; // Seconds between power-up spawns
  private gameWidth: number;
  private gameHeight: number;
  private currentGameSpeed: number = GAME_SPEED; // Current game speed
  private currentPipeGap: number = INITIAL_PIPE_GAP; // Current gap between pipes
  private useSpecialPipes: boolean = false; // Whether to use special (red) pipes
  private selectedBirdColor: BirdColor = 'yellow'; // Default bird color
  
  // Power-up effects
  private hasSlowMotion: boolean = false;
  private slowMotionTimer: number = 0;
  private slowMotionDuration: number = 5; // Seconds
  private hasScoreBoost: boolean = false;
  private scoreBoostTimer: number = 0;
  private scoreBoostDuration: number = 10; // Seconds
  
  // Sound effects
  private sounds: {[key: string]: HTMLAudioElement} = {};
  private isSoundEnabled: boolean = true;
  
  constructor() {
    // Get the canvas element
    this.canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    this.context = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    
    // Set canvas size
    this.gameWidth = 480;  // Increased from 320
    this.gameHeight = 640; // Increased from 480
    this.canvas.width = this.gameWidth;
    this.canvas.height = this.gameHeight;
    
    // Load high score from local storage
    const savedHighScore = localStorage.getItem('flappyBirdHighScore');
    if (savedHighScore) {
      this.highScore = parseInt(savedHighScore);
    }
    
    // Load saved bird color from local storage
    const savedBirdColor = localStorage.getItem('flappyBirdColor');
    if (savedBirdColor && ['yellow', 'red', 'blue'].includes(savedBirdColor)) {
      this.selectedBirdColor = savedBirdColor as BirdColor;
      
      // Update the UI to reflect the saved color
      this.updateCharacterSelectionUI();
    }
    
    // Load sound effects
    this.loadSounds();
    
    // Initialize input handler
    this.inputHandler = new InputHandler();
    
    // Initialize the game
    this.init();
    
    // Set up event listeners
    this.setupEventListeners();
  }
  
  /**
   * Update the character selection UI to reflect the selected color
   */
  private updateCharacterSelectionUI(): void {
    // Remove 'selected' class from all options
    const options = document.querySelectorAll('.character-option');
    options.forEach(option => option.classList.remove('selected'));
    
    // Add 'selected' class to the selected color
    const selectedOption = document.querySelector(`.character-option[data-color="${this.selectedBirdColor}"]`);
    if (selectedOption) {
      selectedOption.classList.add('selected');
    }
  }
  
  /**
   * Load sound effects
   */
  private loadSounds(): void {
    const soundFiles = {
      flap: 'wing.ogg',
      score: 'point.ogg',
      hit: 'hit.ogg',
      die: 'die.ogg',
      swoosh: 'swoosh.ogg'
    };
    
    // Load each sound
    for (const [name, file] of Object.entries(soundFiles)) {
      const audio = this.loadSound(file);
      this.sounds[name] = audio;
    }
  }
  
  /**
   * Load a sound file
   */
  private loadSound(file: string): HTMLAudioElement {
    const audio = new Audio(`assets/audio/${file}`);
    return audio;
  }
  
  /**
   * Play a sound effect
   */
  private playSound(name: string): void {
    if (this.isSoundEnabled && this.sounds[name]) {
      // Clone the audio to allow overlapping sounds
      const sound = this.sounds[name].cloneNode() as HTMLAudioElement;
      sound.volume = 0.5; // Set volume to 50%
      sound.play().catch(e => console.log('Error playing sound:', e));
    }
  }
  
  /**
   * Toggle sound on/off
   */
  toggleSound(): void {
    this.isSoundEnabled = !this.isSoundEnabled;
  }
  
  /**
   * Initialize the game
   */
  private init(): void {
    // Reset difficulty settings
    this.currentGameSpeed = GAME_SPEED;
    this.currentPipeGap = INITIAL_PIPE_GAP;
    this.pipeSpawnInterval = INITIAL_PIPE_INTERVAL;
    this.useSpecialPipes = false;
    
    // Reset power-up effects
    this.hasSlowMotion = false;
    this.slowMotionTimer = 0;
    this.hasScoreBoost = false;
    this.scoreBoostTimer = 0;
    
    // Create the bird with the selected color
    this.bird = new Bird(this.gameWidth * 0.3, this.gameHeight / 2, this.selectedBirdColor);
    
    // Create the background
    this.background = new Background(this.gameWidth, this.gameHeight);
    
    // Create the ground segments
    const groundHeight = 112; // Height of the ground sprite
    const groundY = this.gameHeight - groundHeight / 2;
    
    // Create three ground segments for smooth scrolling
    this.grounds = []; // Clear existing grounds
    for (let i = 0; i < 3; i++) {
      const ground = new Ground(
        this.gameWidth / 2 + i * this.gameWidth,
        groundY,
        this.gameWidth,
        groundHeight,
        this.currentGameSpeed // Pass current game speed
      );
      this.grounds.push(ground);
    }
    
    // Reset game state
    this.score = 0;
    this.gameOver = false;
    this.isPaused = false;
    this.pipeSpawnTimer = 0;
    this.powerUpSpawnTimer = 0;
    this.pipes = [];
    this.powerUps = [];
    this.scoreEffects = [];
    this.powerUpEffects = [];
    
    // Add entities to the entities array
    this.entities = [
      this.background,
      this.bird,
      ...this.grounds
    ];
    
    // Show the start screen
    document.getElementById('start-screen')!.style.display = 'flex';
    document.getElementById('game-over-screen')!.style.display = 'none';
  }
  
  /**
   * Set up event listeners
   */
  private setupEventListeners(): void {
    // Start button
    document.getElementById('start-button')!.addEventListener('click', () => {
      this.start();
    });
    
    // Restart button
    document.getElementById('restart-button')!.addEventListener('click', () => {
      this.restart();
    });
    
    // Keyboard events for pausing
    window.addEventListener('keydown', (e) => {
      if (e.key === 'p' || e.key === 'P') {
        this.togglePause();
      }
    });
    
    // Character selection
    const characterOptions = document.querySelectorAll('.character-option');
    characterOptions.forEach(option => {
      option.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const color = target.getAttribute('data-color') as BirdColor;
        
        if (color) {
          // Update selected color
          this.selectedBirdColor = color;
          
          // Save to local storage
          localStorage.setItem('flappyBirdColor', color);
          
          // Update UI
          characterOptions.forEach(opt => opt.classList.remove('selected'));
          target.classList.add('selected');
          
          // Update bird if it exists
          if (this.bird) {
            this.bird.setColor(color);
          }
          
          // Play sound
          this.playSound('swoosh');
        }
      });
    });
  }
  
  /**
   * Start the game
   */
  start(): void {
    // Hide the start screen
    document.getElementById('start-screen')!.style.display = 'none';
    
    // Play swoosh sound
    this.playSound('swoosh');
    
    // Start the game loop
    this.lastTime = performance.now();
    requestAnimationFrame(this.gameLoop.bind(this));
  }
  
  /**
   * Restart the game
   */
  restart(): void {
    // Hide the game over screen
    document.getElementById('game-over-screen')!.style.display = 'none';
    
    // Play swoosh sound
    this.playSound('swoosh');
    
    // Re-initialize the game
    this.init();
    
    // Start the game
    this.start();
  }
  
  /**
   * Toggle pause state
   */
  togglePause(): void {
    this.isPaused = !this.isPaused;
    
    if (this.isPaused) {
      // Show pause message
      this.context.fillStyle = 'rgba(0, 0, 0, 0.5)';
      this.context.fillRect(0, 0, this.gameWidth, this.gameHeight);
      this.context.fillStyle = 'white';
      this.context.font = '36px Arial';
      this.context.textAlign = 'center';
      this.context.fillText('PAUSED', this.gameWidth / 2, this.gameHeight / 2);
      this.context.font = '24px Arial';
      this.context.fillText('Press P to resume', this.gameWidth / 2, this.gameHeight / 2 + 40);
    } else {
      // Resume game
      this.lastTime = performance.now();
      requestAnimationFrame(this.gameLoop.bind(this));
    }
  }
  
  /**
   * Handle bird flap
   */
  private handleFlap(): void {
    if (!this.gameOver && !this.isPaused) {
      this.bird.flap();
      this.playSound('flap');
    }
  }
  
  /**
   * Update difficulty based on score
   */
  private updateDifficulty(): void {
    // 1. Speed Acceleration: Every 5 points, increase speed by 10%
    const speedLevel = Math.floor(this.score / 5);
    const speedMultiplier = 1 + (speedLevel * 0.1);
    this.currentGameSpeed = Math.min(GAME_SPEED * speedMultiplier, MAX_GAME_SPEED);
    
    // 2. Pipe Gap Reduction: Every 10 points, decrease gap by 5 pixels
    const gapReduction = Math.floor(this.score / 10) * 5;
    this.currentPipeGap = Math.max(INITIAL_PIPE_GAP - gapReduction, MIN_PIPE_GAP);
    
    // 3. Pipe Frequency Increase: Every 15 points, decrease interval by 0.1 seconds
    const intervalReduction = Math.floor(this.score / 15) * 0.1;
    this.pipeSpawnInterval = Math.max(INITIAL_PIPE_INTERVAL - intervalReduction, MIN_PIPE_INTERVAL);
    
    // 4. Pipe Variation: After 25 points, introduce special pipes
    this.useSpecialPipes = this.score >= 25;
    
    // Update speed for existing entities
    this.updateEntitySpeeds();
  }
  
  /**
   * Update the speed of all entities that support speed changes
   */
  private updateEntitySpeeds(): void {
    // Update ground speed
    for (const ground of this.grounds) {
      ground.setSpeed(this.currentGameSpeed);
    }
    
    // Update background speed
    this.background.setSpeed(this.currentGameSpeed);
    
    // Update pipe speeds (only affects new pipes, existing ones keep their initial speed)
  }
  
  /**
   * Main game loop
   */
  private gameLoop(timestamp: number): void {
    // Calculate delta time
    const deltaTime = (timestamp - this.lastTime) / 1000; // Convert to seconds
    this.lastTime = timestamp;
    
    // Skip update if paused
    if (this.isPaused) return;
    
    // Clear the canvas
    this.context.clearRect(0, 0, this.gameWidth, this.gameHeight);
    
    // Handle input
    if (this.inputHandler.isFlapping) {
      this.handleFlap();
      this.inputHandler.isFlapping = false; // Reset flap state
    }
    
    // Update difficulty based on score
    this.updateDifficulty();
    
    // Update power-up effects
    this.updatePowerUpEffects(deltaTime);
    
    // Update pipe spawn timer
    if (!this.gameOver) {
      this.pipeSpawnTimer += deltaTime;
      if (this.pipeSpawnTimer >= this.pipeSpawnInterval) {
        this.pipeSpawnTimer = 0;
        this.spawnPipes();
      }
      
      // Update power-up spawn timer
      this.powerUpSpawnTimer += deltaTime;
      if (this.powerUpSpawnTimer >= this.powerUpSpawnInterval) {
        this.powerUpSpawnTimer = 0;
        this.spawnPowerUp();
      }
    }
    
    // Update all entities
    for (const entity of this.entities) {
      entity.update(deltaTime);
    }
    
    // Check for collisions
    if (!this.gameOver) {
      this.checkCollisions();
    }
    
    // Check if bird has passed a pipe
    if (!this.gameOver) {
      this.checkPipePassed();
    }
    
    // Check if bird has collected a power-up
    if (!this.gameOver) {
      this.checkPowerUpCollected();
    }
    
    // Clean up expired score effects
    this.cleanupScoreEffects();
    
    // Clean up expired power-up effects
    this.cleanupPowerUpEffects();
    
    // Clean up off-screen pipes
    this.cleanupPipes();
    
    // Clean up off-screen power-ups
    this.cleanupPowerUps();
    
    // Render all entities
    for (const entity of this.entities) {
      entity.render(this.context);
    }
    
    // Draw the score
    this.drawScore();
    
    // Draw active power-ups
    this.drawActivePowerUps();
    
    // Continue the game loop
    if (!this.gameOver) {
      requestAnimationFrame(this.gameLoop.bind(this));
    }
  }
  
  /**
   * Spawn a new pair of pipes
   */
  private spawnPipes(): void {
    // Calculate random gap position with more variation at higher scores
    const variationFactor = Math.min(1, this.score / 50); // Increases up to 1 at score 50
    const minGapY = this.gameHeight * (0.2 + variationFactor * 0.1); // Increases from 0.2 to 0.3
    const maxGapY = this.gameHeight * (0.8 - variationFactor * 0.1); // Decreases from 0.8 to 0.7
    const gapY = minGapY + Math.random() * (maxGapY - minGapY);
    
    // Use current pipe gap (affected by difficulty)
    const gapHeight = this.currentPipeGap;
    
    // Determine if this should be a special pipe
    const isSpecialPipe = this.useSpecialPipes && Math.random() < 0.2; // 20% chance for special pipe
    
    // Create top pipe
    const topPipeHeight = gapY;
    const topPipe = new Pipe(
      this.gameWidth + 100, // Start off-screen
      gapY - gapHeight / 2,
      topPipeHeight,
      true, // isTop
      isSpecialPipe, // isSpecial
      this.currentGameSpeed // Use current game speed
    );
    
    // Create bottom pipe
    const bottomPipeY = gapY + gapHeight / 2;
    const bottomPipeHeight = this.gameHeight - bottomPipeY;
    const bottomPipe = new Pipe(
      this.gameWidth + 100, // Start off-screen
      bottomPipeY,
      bottomPipeHeight,
      false, // isTop
      isSpecialPipe, // isSpecial
      this.currentGameSpeed // Use current game speed
    );
    
    // Add pipes to the game
    this.pipes.push(topPipe, bottomPipe);
    this.entities.push(topPipe, bottomPipe);
  }
  
  /**
   * Check for collisions between the bird and other entities
   */
  private checkCollisions(): void {
    // Check collision with ground
    for (const ground of this.grounds) {
      if (this.bird.collidesWith(ground)) {
        this.handleCollision();
        return;
      }
    }
    
    // Check collision with pipes
    for (const pipe of this.pipes) {
      if (this.bird.collidesWith(pipe)) {
        this.handleCollision();
        return;
      }
    }
    
    // Check if bird is out of bounds (top of screen)
    if (this.bird.position.y - this.bird.height / 2 < 0) {
      this.handleCollision();
      return;
    }
  }
  
  /**
   * Handle collision with an obstacle
   */
  private handleCollision(): void {
    // If bird has a shield, use it instead of game over
    if (this.bird.hasShield) {
      this.bird.hasShield = false;
      this.playSound('hit');
      return;
    }
    
    // Otherwise, game over
    this.handleGameOver();
  }
  
  /**
   * Check if the bird has passed a pipe
   */
  private checkPipePassed(): void {
    for (const pipe of this.pipes) {
      if (pipe.checkPassed(this.bird.position.x)) {
        // Increment score (double if score boost is active)
        const points = this.hasScoreBoost ? 2 : 1;
        this.score += points;
        
        // Update high score if needed
        if (this.score > this.highScore) {
          this.highScore = this.score;
          localStorage.setItem('flappyBirdHighScore', this.highScore.toString());
        }
        
        // Add score effect
        this.addScoreEffect(points);
        
        // Play score sound
        this.playSound('score');
        
        break; // Only count one pipe at a time
      }
    }
  }
  
  /**
   * Add a score effect
   */
  private addScoreEffect(points: number): void {
    // Create a score effect above the bird
    const effect = new ScoreEffect(
      this.bird.position.x,
      this.bird.position.y - 50,
      points === 1 ? '+1' : '+2'
    );
    
    // Add to the game
    this.scoreEffects.push(effect);
    this.entities.push(effect);
  }
  
  /**
   * Clean up expired score effects
   */
  private cleanupScoreEffects(): void {
    // Remove expired score effects
    for (let i = this.scoreEffects.length - 1; i >= 0; i--) {
      if (this.scoreEffects[i].isExpired()) {
        // Remove from entities array
        const entityIndex = this.entities.indexOf(this.scoreEffects[i]);
        if (entityIndex !== -1) {
          this.entities.splice(entityIndex, 1);
        }
        
        // Remove from score effects array
        this.scoreEffects.splice(i, 1);
      }
    }
  }
  
  /**
   * Clean up pipes that have moved off-screen
   */
  private cleanupPipes(): void {
    // Remove pipes that have moved off-screen
    for (let i = this.pipes.length - 1; i >= 0; i--) {
      if (this.pipes[i].position.x + this.pipes[i].width / 2 < 0) {
        // Remove from entities array
        const entityIndex = this.entities.indexOf(this.pipes[i]);
        if (entityIndex !== -1) {
          this.entities.splice(entityIndex, 1);
        }
        
        // Remove from pipes array
        this.pipes.splice(i, 1);
      }
    }
  }
  
  /**
   * Draw the score on the screen
   */
  private drawScore(): void {
    this.context.fillStyle = 'white';
    this.context.strokeStyle = 'black';
    this.context.lineWidth = 3;
    this.context.font = 'bold 36px Arial';
    this.context.textAlign = 'center';
    this.context.textBaseline = 'top';
    
    // Draw score with outline
    this.context.strokeText(this.score.toString(), this.gameWidth / 2, 20);
    this.context.fillText(this.score.toString(), this.gameWidth / 2, 20);
    
    // Draw difficulty indicator
    this.drawDifficultyIndicator();
    
    // Draw current difficulty level (for debugging)
    if (false) { // Set to true to enable debug info
      this.context.font = 'bold 14px Arial';
      this.context.textAlign = 'left';
      this.context.fillText(`Speed: ${Math.round(this.currentGameSpeed)}`, 10, 10);
      this.context.fillText(`Gap: ${this.currentPipeGap}`, 10, 30);
      this.context.fillText(`Interval: ${this.pipeSpawnInterval.toFixed(1)}s`, 10, 50);
      this.context.fillText(`Special: ${this.useSpecialPipes ? 'Yes' : 'No'}`, 10, 70);
    }
  }
  
  /**
   * Draw a visual indicator of the current difficulty level
   */
  private drawDifficultyIndicator(): void {
    // Calculate difficulty level (0-5)
    const maxDifficulty = 5;
    const difficultyLevel = Math.min(
      maxDifficulty,
      Math.floor(this.score / 10)
    );
    
    // Draw difficulty stars at the top right
    const starSize = 20;
    const starSpacing = 5;
    const startX = this.gameWidth - (starSize * maxDifficulty) - (starSpacing * (maxDifficulty - 1)) - 10;
    const startY = 20;
    
    // Draw empty stars first
    for (let i = 0; i < maxDifficulty; i++) {
      const x = startX + i * (starSize + starSpacing);
      this.drawStar(x, startY, starSize, '#333333');
    }
    
    // Draw filled stars based on current difficulty
    for (let i = 0; i < difficultyLevel; i++) {
      const x = startX + i * (starSize + starSpacing);
      this.drawStar(x, startY, starSize, '#FFD700');
    }
  }
  
  /**
   * Draw a star shape
   */
  private drawStar(x: number, y: number, size: number, color: string): void {
    const spikes = 5;
    const outerRadius = size / 2;
    const innerRadius = outerRadius / 2;
    
    this.context.beginPath();
    this.context.fillStyle = color;
    this.context.strokeStyle = 'black';
    this.context.lineWidth = 1;
    
    for (let i = 0; i < spikes * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (Math.PI / spikes) * i;
      const pointX = x + radius * Math.sin(angle);
      const pointY = y + radius * Math.cos(angle);
      
      if (i === 0) {
        this.context.moveTo(pointX, pointY);
      } else {
        this.context.lineTo(pointX, pointY);
      }
    }
    
    this.context.closePath();
    this.context.fill();
    this.context.stroke();
  }
  
  /**
   * Handle game over
   */
  private handleGameOver(): void {
    if (this.gameOver) return; // Prevent multiple calls
    
    this.gameOver = true;
    
    // Play hit sound
    this.playSound('hit');
    
    // Play die sound after a short delay
    setTimeout(() => {
      this.playSound('die');
    }, 500);
    
    // Update high score if needed
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('flappyBirdHighScore', this.highScore.toString());
    }
    
    // Update game over screen
    document.getElementById('final-score')!.textContent = this.score.toString();
    document.getElementById('high-score')!.textContent = this.highScore.toString();
    
    // Update difficulty stars
    this.updateDifficultyStars();
    
    // Show game over screen after a short delay
    setTimeout(() => {
      document.getElementById('game-over-screen')!.style.display = 'flex';
    }, 1000);
  }
  
  /**
   * Update the difficulty stars on the game over screen
   */
  private updateDifficultyStars(): void {
    // Calculate difficulty level (0-5)
    const maxDifficulty = 5;
    const difficultyLevel = Math.min(
      maxDifficulty,
      Math.floor(this.score / 10)
    );
    
    // Update star elements
    for (let i = 1; i <= maxDifficulty; i++) {
      const starElement = document.getElementById(`star-${i}`);
      if (starElement) {
        if (i <= difficultyLevel) {
          starElement.classList.add('filled');
        } else {
          starElement.classList.remove('filled');
        }
      }
    }
  }
  
  /**
   * Update power-up effects
   */
  private updatePowerUpEffects(deltaTime: number): void {
    // Update slow motion effect
    if (this.hasSlowMotion) {
      this.slowMotionTimer += deltaTime;
      if (this.slowMotionTimer >= this.slowMotionDuration) {
        this.hasSlowMotion = false;
        // Reset game speed when slow motion ends
        this.updateEntitySpeeds();
      }
    }
    
    // Update score boost effect
    if (this.hasScoreBoost) {
      this.scoreBoostTimer += deltaTime;
      if (this.scoreBoostTimer >= this.scoreBoostDuration) {
        this.hasScoreBoost = false;
      }
    }
  }
  
  /**
   * Spawn a power-up at a random position
   */
  private spawnPowerUp(): void {
    // Only spawn power-ups after a certain score
    if (this.score < 10) return;
    
    // Random position (avoiding ground and top of screen)
    const minY = this.gameHeight * 0.2;
    const maxY = this.gameHeight * 0.7;
    const y = minY + Math.random() * (maxY - minY);
    
    // Random power-up type
    const types: PowerUpType[] = ['shield', 'slowmo', 'score'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    
    // Create power-up
    const powerUp = new PowerUp(
      this.gameWidth + 100, // Start off-screen
      y,
      randomType
    );
    
    // Set the power-up's speed
    powerUp.setSpeed(this.currentGameSpeed);
    
    // Add to the game
    this.powerUps.push(powerUp);
    this.entities.push(powerUp);
  }
  
  /**
   * Check if the bird has collected a power-up
   */
  private checkPowerUpCollected(): void {
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const powerUp = this.powerUps[i];
      
      if (!powerUp.isCollected && this.bird.collidesWith(powerUp)) {
        // Mark as collected
        powerUp.isCollected = true;
        
        // Apply power-up effect
        this.applyPowerUpEffect(powerUp.type, powerUp.position.x, powerUp.position.y);
        
        // Play sound
        this.playSound('score'); // Reuse score sound for now
        
        // Remove from entities array
        const entityIndex = this.entities.indexOf(powerUp);
        if (entityIndex !== -1) {
          this.entities.splice(entityIndex, 1);
        }
        
        // Remove from power-ups array
        this.powerUps.splice(i, 1);
      }
    }
  }
  
  /**
   * Apply a power-up effect
   */
  private applyPowerUpEffect(type: PowerUpType, x: number, y: number): void {
    // Create a power-up effect
    const effect = new PowerUpEffect(x, y, type);
    this.powerUpEffects.push(effect);
    this.entities.push(effect);
    
    // Apply the effect based on type
    switch (type) {
      case 'shield':
        this.bird.activateShield();
        break;
      case 'slowmo':
        this.hasSlowMotion = true;
        this.slowMotionTimer = 0;
        // Slow down the game speed
        this.currentGameSpeed = GAME_SPEED * 0.5;
        this.updateEntitySpeeds();
        break;
      case 'score':
        this.hasScoreBoost = true;
        this.scoreBoostTimer = 0;
        break;
    }
  }
  
  /**
   * Clean up expired power-up effects
   */
  private cleanupPowerUpEffects(): void {
    // Remove expired power-up effects
    for (let i = this.powerUpEffects.length - 1; i >= 0; i--) {
      if (this.powerUpEffects[i].isExpired()) {
        // Remove from entities array
        const entityIndex = this.entities.indexOf(this.powerUpEffects[i]);
        if (entityIndex !== -1) {
          this.entities.splice(entityIndex, 1);
        }
        
        // Remove from power-up effects array
        this.powerUpEffects.splice(i, 1);
      }
    }
  }
  
  /**
   * Clean up power-ups that have moved off-screen
   */
  private cleanupPowerUps(): void {
    // Remove power-ups that have moved off-screen
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      if (this.powerUps[i].position.x + this.powerUps[i].width / 2 < 0) {
        // Remove from entities array
        const entityIndex = this.entities.indexOf(this.powerUps[i]);
        if (entityIndex !== -1) {
          this.entities.splice(entityIndex, 1);
        }
        
        // Remove from power-ups array
        this.powerUps.splice(i, 1);
      }
    }
  }
  
  /**
   * Draw active power-up indicators
   */
  private drawActivePowerUps(): void {
    // Position for the indicators
    const startX = 10;
    const startY = 60;
    const iconSize = 30;
    const spacing = 10;
    let currentY = startY;
    
    // Draw shield indicator
    if (this.bird.hasShield) {
      this.drawPowerUpIndicator(startX, currentY, iconSize, 'shield', this.bird.shieldTimer / this.bird.shieldDuration);
      currentY += iconSize + spacing;
    }
    
    // Draw slow motion indicator
    if (this.hasSlowMotion) {
      this.drawPowerUpIndicator(startX, currentY, iconSize, 'slowmo', this.slowMotionTimer / this.slowMotionDuration);
      currentY += iconSize + spacing;
    }
    
    // Draw score boost indicator
    if (this.hasScoreBoost) {
      this.drawPowerUpIndicator(startX, currentY, iconSize, 'score', this.scoreBoostTimer / this.scoreBoostDuration);
    }
  }
  
  /**
   * Draw a power-up indicator with timer
   */
  private drawPowerUpIndicator(x: number, y: number, size: number, type: PowerUpType, progress: number): void {
    const halfSize = size / 2;
    
    // Draw background circle
    this.context.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.context.beginPath();
    this.context.arc(x + halfSize, y + halfSize, halfSize, 0, Math.PI * 2);
    this.context.fill();
    
    // Draw progress arc
    this.context.strokeStyle = 'white';
    this.context.lineWidth = 2;
    this.context.beginPath();
    this.context.arc(x + halfSize, y + halfSize, halfSize - 2, -Math.PI / 2, -Math.PI / 2 + (1 - progress) * Math.PI * 2);
    this.context.stroke();
    
    // Draw icon
    this.context.fillStyle = 'white';
    this.context.strokeStyle = 'black';
    this.context.lineWidth = 1;
    
    switch (type) {
      case 'shield':
        // Draw a shield icon
        this.context.beginPath();
        this.context.moveTo(x + halfSize, y + halfSize * 0.5);
        this.context.lineTo(x + halfSize + halfSize * 0.6, y + halfSize + halfSize * 0.3);
        this.context.lineTo(x + halfSize, y + halfSize + halfSize * 0.7);
        this.context.lineTo(x + halfSize - halfSize * 0.6, y + halfSize + halfSize * 0.3);
        this.context.closePath();
        this.context.fill();
        this.context.stroke();
        break;
      case 'slowmo':
        // Draw a clock icon
        this.context.beginPath();
        this.context.arc(x + halfSize, y + halfSize, halfSize * 0.6, 0, Math.PI * 2);
        this.context.fill();
        this.context.stroke();
        
        // Draw clock hands
        this.context.beginPath();
        this.context.moveTo(x + halfSize, y + halfSize);
        this.context.lineTo(x + halfSize, y + halfSize - halfSize * 0.4);
        this.context.stroke();
        
        this.context.beginPath();
        this.context.moveTo(x + halfSize, y + halfSize);
        this.context.lineTo(x + halfSize + halfSize * 0.3, y + halfSize);
        this.context.stroke();
        break;
      case 'score':
        // Draw a star icon
        const spikes = 5;
        const outerRadius = halfSize * 0.7;
        const innerRadius = outerRadius * 0.4;
        
        this.context.beginPath();
        for (let i = 0; i < spikes * 2; i++) {
          const radius = i % 2 === 0 ? outerRadius : innerRadius;
          const angle = (Math.PI / spikes) * i - Math.PI / 2;
          const pointX = x + halfSize + radius * Math.cos(angle);
          const pointY = y + halfSize + radius * Math.sin(angle);
          
          if (i === 0) {
            this.context.moveTo(pointX, pointY);
          } else {
            this.context.lineTo(pointX, pointY);
          }
        }
        this.context.closePath();
        this.context.fill();
        this.context.stroke();
        break;
    }
  }
} 