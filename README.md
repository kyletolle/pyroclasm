# Pyroclasm

![Pyroclasm Icon](/public/pyroclasm.svg)

A turn-based game featuring a unique derivative damage system based on fire and burn effects.

## Game Features

### Derivative Damage System

Pyroclasm uses a mathematically-inspired derivative damage system with cascading effects:

- **Direct Damage (0th Derivative)**: Immediate damage from fire attacks
- **Burn (1st Derivative)**: Damage over time, like velocity - deals damage each turn
- **Scorch (2nd Derivative)**: Accelerates burn damage, like acceleration - 15% chance to proc per burn stack
- **Inferno (3rd Derivative)**: Accelerates scorch and spreads burn to other enemies - 10% chance to proc per scorch level
- **Pyroclasm (4th Derivative)**: Catastrophic chain reaction affecting all enemies - 0.5% chance to trigger per burn stack

### Enemy Types

- **Fodder**: Low HP enemies that are easy to defeat
- **Medium**: Moderate HP enemies with balanced stats
- **Elite**: High HP enemies that present a significant challenge
- **Boss**: Extremely tough enemies that appear every 5 waves

### User Interface

- **Health Visualization**: Dynamic health bars with color transitions (green → yellow → red)
- **Toggle between Linear and Pie Chart health displays**
- **Turn-based Progression**: Auto-ticking system with speed controls
- **Manual Turn Advancement**: Advance one turn at a time when paused
- **Enemy Selection**: Click to select targets or use keyboard navigation
- **Wave System**: Progress through increasingly difficult waves of enemies
- **Action Log**: Track combat events with clear logging
- **Dark/Light Mode**: Toggle between visual themes
- **Custom Animations**: Visual feedback for damage, status effects, and selection

## Development Setup

This project uses React with TypeScript and Vite for a modern development experience.

### Prerequisites

- Node.js (v22+)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/pyroclasm.git
cd pyroclasm

# Install dependencies
npm install
# or
yarn
```

### Running the Development Server

```bash
npm run dev
# or
yarn dev
```

Visit `http://localhost:5173` to see the game in action.

### Building for Production

```bash
npm run build
# or
yarn build
```

## Technologies Used

- **React**: UI components and state management
- **TypeScript**: Type-safe code
- **Vite**: Fast development and building
- **TailwindCSS**: Styling and theming
- **SVG**: Custom game icon and animations

## Project Structure

- `src/game/`: Core game logic and models
  - `constants/`: Game balance and configuration values
  - `models/`: TypeScript interfaces and types
  - `services/`: Combat and wave generation logic
- `src/components/`: React UI components
- `src/context/`: React context providers (e.g., theme)
- `src/utils/`: Utility functions

## Future Enhancements

- Player progression system with upgrades
- Additional attack types
- More enemy variety
- Visual enhancements for effects
- Sound effects and music
- Save/load functionality

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests.

## License

[MIT](LICENSE)
