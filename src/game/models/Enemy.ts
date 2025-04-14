// Enemy tiers defining their relative strength
export type EnemyTier = 'fodder' | 'medium' | 'elite' | 'boss';

// Base interface for all enemies in the game
export interface Enemy {
  id: number;
  name: string;
  hp: number;
  maxHp: number;
  burnStacks: number; // 1st derivative - damage over time
  scorchLevel: number; // 2nd derivative - accelerates burn damage
  jerkLevel: number; // 3rd derivative - accelerates scorch and causes spread
  hasPyroclasm: boolean; // 4th derivative - catastrophic effect trigger
  isDead: boolean;
  tier: EnemyTier;
}

// Factory function to create a new enemy instance
export function createEnemy(id: number, tier: EnemyTier = 'fodder'): Enemy {
  let hp: number;
  let name: string;

  switch (tier) {
    case 'boss':
      hp = 100;
      name = `Boss ${id}`;
      break;
    case 'elite':
      hp = 50;
      name = `Elite ${id}`;
      break;
    case 'medium':
      hp = 25;
      name = `Fighter ${id}`;
      break;
    case 'fodder':
    default:
      hp = 10;
      name = `Minion ${id}`;
      break;
  }

  return {
    id,
    name,
    tier,
    hp,
    maxHp: hp,
    burnStacks: 0,
    scorchLevel: 0,
    jerkLevel: 0,
    hasPyroclasm: false,
    isDead: false,
  };
}
