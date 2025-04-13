import { Enemy } from '../models/Enemy';
import { DamageEffect } from '../models/DamageEffect';
import { BASE_DAMAGE, STATUS_EFFECTS } from '../constants/DamageValues';
import { capitalize } from '../../utils';

// Interface for the result of an attack
export interface AttackResult {
  updatedEnemies: Enemy[];
  message: string;
  deathMessages: string[];
}

// Interface for the result of skipping a turn
export interface SkipTurnResult {
  updatedEnemies: Enemy[];
  totalDamageDealt: number;
  enemiesAffected: number;
  message: string;
  deathMessages: string[];
}

/**
 * Checks if an enemy has died and updates its state accordingly
 */
function checkForDeath(enemy: Enemy): { enemy: Enemy; hasDied: boolean } {
  // If HP is 0 and enemy wasn't already dead, mark as dead and clear status effects
  if (enemy.hp <= 0 && !enemy.isDead) {
    return {
      enemy: {
        ...enemy,
        hp: 0,
        burnStacks: 0, // Clear burn stacks on death
        isDead: true,
      },
      hasDied: true,
    };
  }

  return { enemy, hasDied: false };
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
      deathMessages: [],
    };
  }

  // Don't allow attacks on dead enemies
  if (targetEnemy.isDead) {
    return {
      updatedEnemies: enemies,
      message: `${targetEnemy.name} is already defeated!`,
      deathMessages: [],
    };
  }

  // Calculate damage and burn stacks to apply
  const damage = BASE_DAMAGE[effect];
  const burnStacksToAdd = STATUS_EFFECTS.burn.stacksApplied[effect] || 0;
  const deathMessages: string[] = [];

  // Update enemies array with new damage and burn stacks
  const updatedEnemies = enemies.map(enemy => {
    if (enemy.id === targetEnemy.id) {
      // Apply damage
      const damagedEnemy = {
        ...enemy,
        hp: Math.max(0, enemy.hp - damage),
        burnStacks: enemy.burnStacks + burnStacksToAdd,
      };

      // Check if enemy died from this attack
      const { enemy: finalEnemy, hasDied } = checkForDeath(damagedEnemy);

      if (hasDied) {
        deathMessages.push(`${enemy.name} has been defeated! 💀`);
      }

      return finalEnemy;
    }
    return enemy;
  });

  // Construct result message
  let message = `Used ${capitalize(effect)} on ${targetEnemy.name} for ${damage} damage.`;
  if (
    burnStacksToAdd > 0 &&
    !updatedEnemies.find(e => e.id === targetEnemy.id)?.isDead
  ) {
    message += ` Added ${burnStacksToAdd} burn stack${burnStacksToAdd > 1 ? 's' : ''}.`;
  }

  return {
    updatedEnemies,
    message,
    deathMessages,
  };
}

/**
 * Processes a turn skip, applying status effects like burn damage
 */
export function skipTurn(enemies: Enemy[]): SkipTurnResult {
  let totalDamageDealt = 0;
  let enemiesWithEffects = 0;
  const deathMessages: string[] = [];

  // Process status effects for each enemy
  const updatedEnemies = enemies.map(enemy => {
    // Skip processing for dead enemies
    if (enemy.isDead) return enemy;

    if (enemy.burnStacks > 0) {
      // Calculate burn damage
      const burnDamage = enemy.burnStacks * STATUS_EFFECTS.burn.damagePerStack;
      enemiesWithEffects++;
      totalDamageDealt += burnDamage;

      // Apply burn damage
      const damagedEnemy = {
        ...enemy,
        hp: Math.max(0, enemy.hp - burnDamage),
        burnStacks: enemy.burnStacks - 1,
      };

      // Check if enemy died from this burn damage
      const { enemy: finalEnemy, hasDied } = checkForDeath(damagedEnemy);

      if (hasDied) {
        deathMessages.push(`${enemy.name} has been burned to death! 💀🔥`);
      }

      return finalEnemy;
    }
    return enemy;
  });

  // Create appropriate message based on effects applied
  const message =
    enemiesWithEffects > 0
      ? `Turn processed. Burn effects dealt ${totalDamageDealt} total damage to ${enemiesWithEffects} enemies.`
      : 'Turn processed. No status effects to resolve.';

  return {
    updatedEnemies,
    totalDamageDealt,
    enemiesAffected: enemiesWithEffects,
    message,
    deathMessages,
  };
}

/**
 * Creates initial enemies for the game
 */
export function createInitialEnemies(): Enemy[] {
  return [
    { id: 1, name: 'Goblin', hp: 100, burnStacks: 0, isDead: false },
    { id: 2, name: 'Orc', hp: 150, burnStacks: 0, isDead: false },
    { id: 3, name: 'Dragon Whelp', hp: 200, burnStacks: 0, isDead: false },
  ];
}

/**
 * Checks if all enemies have been defeated
 */
export function areAllEnemiesDefeated(enemies: Enemy[]): boolean {
  return enemies.every(enemy => enemy.isDead);
}

/**
 * Current wave number
 */
let currentWave = 1;

/**
 * Generates enemies for a specific wave
 */
export function generateWaveEnemies(wave: number): Enemy[] {
  // Adjust enemy difficulty based on wave number
  const baseHP = 100;
  const hpMultiplier = 1 + (wave - 1) * 0.5; // Increase HP by 50% per wave
  const count = Math.min(3 + Math.floor((wave - 1) / 2), 6); // Add more enemies in later waves, max 6

  const enemies: Enemy[] = [];
  const enemyTypes = [
    { name: 'Goblin', baseHp: baseHP },
    { name: 'Orc', baseHp: baseHP * 1.5 },
    { name: 'Dragon Whelp', baseHp: baseHP * 2 },
    { name: 'Fire Elemental', baseHp: baseHP * 1.8 },
    { name: 'Shadow Fiend', baseHp: baseHP * 1.7 },
    { name: 'Stone Golem', baseHp: baseHP * 2.5 },
  ];

  // Add enemies based on wave number
  for (let i = 0; i < count; i++) {
    // Cycle through enemy types, with more variety in later waves
    const availableTypes = Math.min(
      enemyTypes.length,
      3 + Math.floor(wave / 2)
    );
    const typeIndex = i % availableTypes;
    const enemyType = enemyTypes[typeIndex];

    const hp = Math.round(enemyType.baseHp * hpMultiplier);
    const id = Date.now() + i; // Use timestamp + index to ensure unique IDs

    enemies.push({
      id,
      name: enemyType.name + (wave > 1 ? ` (Wave ${wave})` : ''),
      hp,
      burnStacks: 0,
      isDead: false,
    });
  }

  return enemies;
}

/**
 * Spawns a new wave of enemies
 */
export function spawnNextWave(): { enemies: Enemy[]; waveNumber: number } {
  currentWave++;
  return {
    enemies: generateWaveEnemies(currentWave),
    waveNumber: currentWave,
  };
}

/**
 * Spawns a random single enemy (for manual addition)
 */
export function spawnRandomEnemy(): Enemy {
  const enemyTypes = [
    { name: 'Goblin', hp: 100 },
    { name: 'Orc', hp: 150 },
    { name: 'Dragon Whelp', hp: 200 },
    { name: 'Fire Elemental', hp: 180 },
    { name: 'Shadow Fiend', hp: 170 },
    { name: 'Stone Golem', hp: 250 },
  ];

  // Pick a random enemy type
  const randomType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];

  // Apply some randomness to HP
  const hpVariance = 0.2; // 20% variance
  const baseHp = randomType.hp;
  const randomHp = Math.round(
    baseHp * (1 - hpVariance / 2 + Math.random() * hpVariance)
  );

  return {
    id: Date.now(),
    name: randomType.name,
    hp: randomHp,
    burnStacks: 0,
    isDead: false,
  };
}
