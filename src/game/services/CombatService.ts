import { Enemy } from '../models/Enemy';
import { DamageEffect } from '../models/DamageEffect';
import { BASE_DAMAGE, STATUS_EFFECTS } from '../constants/DamageValues';
import { capitalize } from '../../utils';

// Interface for the result of an attack
export interface AttackResult {
  updatedEnemies: Enemy[];
  message: string;
}

// Interface for the result of skipping a turn
export interface SkipTurnResult {
  updatedEnemies: Enemy[];
  totalDamageDealt: number;
  enemiesAffected: number;
  message: string;
}

/**
 * Applies an attack of a specific damage effect to a target enemy
 */
export function applyAttack(
  enemies: Enemy[],
  targetEnemy: Enemy | null,
  effect: DamageEffect
): AttackResult {
  if (!targetEnemy) {
    return {
      updatedEnemies: enemies,
      message: 'No enemy selected!',
    };
  }

  // Calculate damage and burn stacks to apply
  const damage = BASE_DAMAGE[effect];
  const burnStacksToAdd = STATUS_EFFECTS.burn.stacksApplied[effect] || 0;

  // Update enemies array with new damage and burn stacks
  const updatedEnemies = enemies.map(enemy =>
    enemy.id === targetEnemy.id
      ? {
          ...enemy,
          hp: Math.max(0, enemy.hp - damage),
          burnStacks: enemy.burnStacks + burnStacksToAdd,
        }
      : enemy
  );

  // Construct result message
  let message = `Used ${capitalize(effect)} on ${targetEnemy.name} for ${damage} damage.`;
  if (burnStacksToAdd > 0) {
    message += ` Added ${burnStacksToAdd} burn stack${burnStacksToAdd > 1 ? 's' : ''}.`;
  }

  return {
    updatedEnemies,
    message,
  };
}

/**
 * Processes a turn skip, applying status effects like burn damage
 */
export function skipTurn(enemies: Enemy[]): SkipTurnResult {
  let totalDamageDealt = 0;
  let enemiesWithEffects = 0;

  // Process status effects for each enemy
  const updatedEnemies = enemies.map(enemy => {
    if (enemy.burnStacks > 0) {
      // Calculate burn damage
      const burnDamage = enemy.burnStacks * STATUS_EFFECTS.burn.damagePerStack;
      enemiesWithEffects++;
      totalDamageDealt += burnDamage;

      // Update enemy with damage and reduced burn stacks
      return {
        ...enemy,
        hp: Math.max(0, enemy.hp - burnDamage),
        burnStacks: enemy.burnStacks - 1,
      };
    }
    return enemy;
  });

  // Create appropriate message based on effects applied
  const message =
    enemiesWithEffects > 0
      ? `Skipped turn. Burn effects dealt ${totalDamageDealt} total damage to ${enemiesWithEffects} enemies.`
      : 'Skipped turn. No status effects to resolve.';

  return {
    updatedEnemies,
    totalDamageDealt,
    enemiesAffected: enemiesWithEffects,
    message,
  };
}

/**
 * Creates initial enemies for the game
 */
export function createInitialEnemies(): Enemy[] {
  return [
    { id: 1, name: 'Goblin', hp: 100, burnStacks: 0 },
    { id: 2, name: 'Orc', hp: 150, burnStacks: 0 },
    { id: 3, name: 'Dragon Whelp', hp: 200, burnStacks: 0 },
  ];
}
