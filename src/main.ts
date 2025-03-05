import { Game } from './core/Game';

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize the game
  const game = new Game();
  
  // Get UI elements
  const startScreen = document.getElementById('start-screen') as HTMLDivElement;
  const gameOverScreen = document.getElementById('game-over-screen') as HTMLDivElement;
  const startButton = document.getElementById('start-button') as HTMLButtonElement;
  const restartButton = document.getElementById('restart-button') as HTMLButtonElement;
  const finalScoreElement = document.getElementById('final-score') as HTMLSpanElement;
  const highScoreElement = document.getElementById('high-score') as HTMLSpanElement;
  
  // Add event listeners for game controls
  startButton.addEventListener('click', () => {
    startScreen.style.display = 'none';
    game.start();
  });
  
  restartButton.addEventListener('click', () => {
    gameOverScreen.style.display = 'none';
    game.restart();
  });
  
  // Listen for game over event
  document.addEventListener('gameOver', (e: Event) => {
    const customEvent = e as CustomEvent;
    const score = customEvent.detail.score;
    const highScore = customEvent.detail.highScore;
    
    finalScoreElement.textContent = score.toString();
    highScoreElement.textContent = highScore.toString();
    
    gameOverScreen.style.display = 'flex';
  });
}); 