// Enemy tiers defining their relative strength
export type EnemyTier = 'fodder' | 'medium' | 'elite' | 'boss';

// Base interface for all enemies in the game
export interface Enemy {
  id: number;
  name: string;
  hp: number;
  burnStacks: number;
  isDead: boolean;
  tier: EnemyTier;
}

// Factory function to create a new enemy instance
export function createEnemy(
  id: number,
  name: string,
  hp: number,
  tier: EnemyTier = 'medium'
): Enemy {
  return {
    id,
    name,
    hp,
    burnStacks: 0,
    isDead: false,
    tier,
  };
}
