// Base interface for all enemies in the game
export interface Enemy {
  id: number;
  name: string;
  hp: number;
  burnStacks: number;
}

// Factory function to create a new enemy instance
export function createEnemy(id: number, name: string, hp: number): Enemy {
  return {
    id,
    name,
    hp,
    burnStacks: 0,
  };
}
