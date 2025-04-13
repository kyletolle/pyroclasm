// Export models
export { type Enemy, createEnemy } from './models/Enemy';
export { type DamageEffect, allDamageEffects } from './models/DamageEffect';

// Export constants
export { BASE_DAMAGE, STATUS_EFFECTS } from './constants/DamageValues';

// Export services
export {
  type AttackResult,
  type SkipTurnResult,
  applyAttack,
  skipTurn,
  createInitialEnemies,
} from './services/CombatService';
