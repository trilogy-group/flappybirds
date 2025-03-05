# Flappy Birds TypeScript

A modern implementation of the classic Flappy Birds game built with TypeScript.

## Overview

This project recreates the popular Flappy Birds game with a focus on clean, type-safe code using TypeScript. The game features smooth animations, responsive controls, and a gradually increasing difficulty level.

## Features

- Responsive game loop with consistent physics
- Type-safe implementation with TypeScript
- Smooth animations and visual effects
- Local high score tracking
- Mobile and desktop support
- Original Flappy Bird assets and sounds
- Character customization with different bird colors
- Power-ups and progressive difficulty

## Development Phases

### Phase 1: Core Game Mechanics ✅
- Basic game engine
- Bird physics and controls
- Collision detection

### Phase 2: Game Environment and Obstacles ✅
- Scrolling background
- Pipe obstacles
- Scoring system
- Basic UI

### Phase 3: Visual and Audio Polish ✅
- Enhanced visuals and animations
- Sound effects and music
- Visual feedback

### Phase 4: Advanced Features ✅
- Difficulty progression
- Character customization
- Power-ups and achievements

## Game Mechanics

### Core Gameplay
The player controls a bird that continuously moves forward. The player can make the bird flap its wings to gain height, otherwise gravity pulls the bird downward. The objective is to navigate the bird through gaps between pairs of pipes without hitting them or the ground/ceiling.

### Scoring
- Each time the bird successfully passes through a pair of pipes, the player earns one point
- Visual and audio feedback is provided for each point earned
- The current score is displayed prominently at the top of the screen
- High scores are saved locally and displayed on the game over screen

### Controls
- Click/Tap or press Spacebar to make the bird flap
- Press 'P' to pause the game
- Press 'R' to restart after game over

### Difficulty Progression

The game implements a dynamic difficulty system that gradually increases as the player progresses:

#### 1. Speed Acceleration
- **Initial Speed**: The game starts at a base speed of 200 pixels per second
- **Acceleration**: Every 5 points scored, the game speed increases by 10%
- **Maximum Speed**: The speed caps at 400 pixels per second (double the initial speed)
- **Implementation**: The `GAME_SPEED` constant is dynamically adjusted based on the player's score

#### 2. Pipe Gap Reduction
- **Initial Gap**: Pipes start with a generous gap of 150 pixels
- **Gap Reduction**: Every 10 points, the gap between pipes decreases by 5 pixels
- **Minimum Gap**: The gap will never be smaller than 100 pixels (to keep the game playable)
- **Implementation**: The `gapHeight` variable in the `spawnPipes` method is adjusted based on score

#### 3. Pipe Frequency Increase
- **Initial Interval**: Pipes initially spawn every 1.5 seconds
- **Interval Reduction**: Every 15 points, the spawn interval decreases by 0.1 seconds
- **Minimum Interval**: The interval will never be less than 0.8 seconds
- **Implementation**: The `pipeSpawnInterval` property is adjusted as the score increases

#### 4. Pipe Variation
- **Standard Pipes**: Regular green pipes with consistent width
- **Special Pipes**: After 25 points, special red pipes may appear with slightly narrower gaps
- **Random Heights**: Pipe heights and gap positions become more varied at higher scores
- **Implementation**: The pipe generation algorithm introduces more randomness as the score increases

This progressive difficulty system ensures that:
- New players can learn the game mechanics at a manageable pace
- Experienced players face an increasing challenge that tests their skills
- The game becomes more engaging over time without becoming frustratingly difficult
- Each playthrough offers a slightly different experience

### Character Customization

The game allows players to choose from three different bird characters:

- **Yellow Bird**: The classic Flappy Bird character (default)
- **Red Bird**: An alternative character with red coloring
- **Blue Bird**: An alternative character with blue coloring

Players can select their preferred bird on the start screen before beginning the game. The selected bird is saved to local storage and will be remembered for future play sessions.

### Power-Ups

Power-ups appear randomly during gameplay (after reaching a score of 10) and provide temporary advantages:

#### 1. Shield Power-Up
- **Appearance**: Blue shield icon
- **Effect**: Protects the bird from one collision with pipes or the ground
- **Duration**: 5 seconds
- **Visual Indicator**: Blue shield glow around the bird

#### 2. Slow Motion Power-Up
- **Appearance**: Purple clock icon
- **Effect**: Slows down the game speed by 50%, making it easier to navigate through pipes
- **Duration**: 5 seconds
- **Visual Indicator**: Purple clock icon in the top-left corner

#### 3. Score Boost Power-Up
- **Appearance**: Yellow star icon
- **Effect**: Doubles points earned for passing through pipes
- **Duration**: 10 seconds
- **Visual Indicator**: Yellow star icon in the top-left corner

Active power-ups display a timer indicator showing the remaining duration. Multiple power-ups can be active simultaneously for combined effects.

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```
git clone https://github.com/yourusername/flappy-birds-ts.git
cd flappy-birds-ts
```

2. Install dependencies:
```
npm install
```

3. Start the development server:
```
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173` (or the port shown in your terminal)

## Project Structure

```
flappy-birds-ts/
├── src/                  # Source files
│   ├── core/             # Core game engine
│   ├── entities/         # Game entities (bird, pipes)
│   ├── managers/         # Game state and asset managers
│   ├── utils/            # Utility functions
│   └── main.ts           # Entry point
├── public/               # Static assets
│   ├── assets/           # Game sprites and audio
│   │   ├── sprites/      # Game sprites and images
│   │   └── audio/        # Sound effects and music
│   └── index.html        # HTML template
├── dist/                 # Compiled output
├── package.json          # Project dependencies
└── tsconfig.json         # TypeScript configuration
```

## Technologies Used

- TypeScript
- HTML5 Canvas
- Web Audio API
- Vite (for development and building)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Original Flappy Bird game by Dong Nguyen
- Assets from the original Flappy Bird game
- Inspired by various Flappy Bird clones and tutorials 