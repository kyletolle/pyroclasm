import { Enemy, EnemyTier } from '../models/Enemy';
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
 * Enemy registry with details for all potential enemy types by tier
 */
const ENEMY_REGISTRY = {
  fodder: [
    { name: 'Imp', baseHp: 50 },
    { name: 'Kobold', baseHp: 60 },
    { name: 'Fire Sprite', baseHp: 45 },
    { name: 'Ember Rat', baseHp: 40 },
    { name: 'Cinder Bug', baseHp: 35 },
    { name: 'Ash Elemental', baseHp: 55 },
  ],
  medium: [
    { name: 'Goblin', baseHp: 100 },
    { name: 'Orc', baseHp: 150 },
    { name: 'Fire Elemental', baseHp: 130 },
    { name: 'Magma Hound', baseHp: 140 },
    { name: 'Flame Cultist', baseHp: 110 },
    { name: 'Lava Guardian', baseHp: 160 },
  ],
  elite: [
    { name: 'Dragon Whelp', baseHp: 250 },
    { name: 'Stone Golem', baseHp: 300 },
    { name: 'Flame Titan', baseHp: 280 },
    { name: 'Inferno Mage', baseHp: 240 },
    { name: 'Molten Giant', baseHp: 320 },
    { name: 'Hellhound', baseHp: 260 },
  ],
  boss: [
    { name: 'Drakorath the Scorcher', baseHp: 500 },
    { name: 'Pyromus the Incinerator', baseHp: 550 },
    { name: 'Cinereus, Lord of Ash', baseHp: 600 },
    { name: 'Emberstrike the Infernal', baseHp: 650 },
    { name: 'Vulkaris the Molten King', baseHp: 700 },
  ],
};

/**
 * Current wave number
 */
let currentWave = 1;

/**
 * Determines if a wave should be a boss wave
 */
function isBossWave(wave: number): boolean {
  // Every fifth wave is a boss wave
  return wave % 5 === 0 && wave > 0;
}

/**
 * Generates enemies for a specific wave
 */
export function generateWaveEnemies(wave: number): Enemy[] {
  // Base values for scaling
  const hpMultiplier = 1 + (wave - 1) * 0.5; // Increase HP by 50% per wave

  // Generate enemies based on wave characteristics
  if (isBossWave(wave)) {
    return generateBossWave(wave, hpMultiplier);
  } else {
    return generateStandardWave(wave, hpMultiplier);
  }
}

/**
 * Generates a standard enemy wave
 */
function generateStandardWave(wave: number, hpMultiplier: number): Enemy[] {
  const enemies: Enemy[] = [];
  const timeNow = Date.now();

  // Determine enemy count and distribution
  const totalEnemies = Math.min(3 + Math.floor((wave - 1) / 2), 8); // Max 8 enemies per wave

  // Calculate distribution of enemy types based on wave
  let eliteCount = Math.min(Math.floor(wave / 3), 2); // Max 2 elites per standard wave
  let mediumCount = Math.min(Math.floor(wave / 2) + 1, 3); // More medium enemies as waves progress
  let fodderCount = totalEnemies - eliteCount - mediumCount;

  // Add fodder enemies
  for (let i = 0; i < fodderCount; i++) {
    const randomFodder =
      ENEMY_REGISTRY.fodder[
        Math.floor(Math.random() * ENEMY_REGISTRY.fodder.length)
      ];
    const hp = Math.round(randomFodder.baseHp * hpMultiplier);
    enemies.push({
      id: timeNow + enemies.length,
      name: randomFodder.name,
      hp,
      burnStacks: 0,
      isDead: false,
      tier: 'fodder' as EnemyTier,
    });
  }

  // Add medium enemies
  for (let i = 0; i < mediumCount; i++) {
    const randomMedium =
      ENEMY_REGISTRY.medium[
        Math.floor(Math.random() * ENEMY_REGISTRY.medium.length)
      ];
    const hp = Math.round(randomMedium.baseHp * hpMultiplier);
    enemies.push({
      id: timeNow + enemies.length,
      name: randomMedium.name,
      hp,
      burnStacks: 0,
      isDead: false,
      tier: 'medium' as EnemyTier,
    });
  }

  // Add elite enemies
  for (let i = 0; i < eliteCount; i++) {
    const randomElite =
      ENEMY_REGISTRY.elite[
        Math.floor(Math.random() * ENEMY_REGISTRY.elite.length)
      ];
    const hp = Math.round(randomElite.baseHp * hpMultiplier);
    enemies.push({
      id: timeNow + enemies.length,
      name: randomElite.name + ' (Elite)',
      hp,
      burnStacks: 0,
      isDead: false,
      tier: 'elite' as EnemyTier,
    });
  }

  // Tag enemies with wave number if beyond wave 1
  if (wave > 1) {
    enemies.forEach(enemy => {
      enemy.name = enemy.name + ` (Wave ${wave})`;
    });
  }

  return enemies;
}

/**
 * Generates a boss wave
 */
function generateBossWave(wave: number, hpMultiplier: number): Enemy[] {
  const enemies: Enemy[] = [];
  const timeNow = Date.now();

  // Select boss (cycle through available bosses)
  const bossIndex = Math.floor(wave / 5) % ENEMY_REGISTRY.boss.length;
  const boss = ENEMY_REGISTRY.boss[bossIndex];

  // Calculate boss HP with extra scaling for boss waves
  const bossHp = Math.round(boss.baseHp * hpMultiplier * 1.2);

  // Add the boss
  enemies.push({
    id: timeNow,
    name: boss.name,
    hp: bossHp,
    burnStacks: 0,
    isDead: false,
    tier: 'boss' as EnemyTier,
  });

  // Add some fodder minions to accompany the boss
  const minionCount = Math.min(2 + Math.floor(wave / 5), 4); // More minions in higher waves

  for (let i = 0; i < minionCount; i++) {
    // Alternate between fodder and medium tiers for minions
    const tier = i % 2 === 0 ? 'fodder' : 'medium';
    const registry =
      tier === 'fodder' ? ENEMY_REGISTRY.fodder : ENEMY_REGISTRY.medium;
    const randomMinion = registry[Math.floor(Math.random() * registry.length)];

    enemies.push({
      id: timeNow + i + 1,
      name: `${randomMinion.name} Minion`,
      hp: Math.round(randomMinion.baseHp * hpMultiplier * 0.8), // Minions are slightly weaker
      burnStacks: 0,
      isDead: false,
      tier: tier as EnemyTier,
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
  // Determine enemy tier with weighted probability
  const tierRoll = Math.random();
  let tier: EnemyTier;

  if (tierRoll < 0.5) {
    tier = 'fodder';
  } else if (tierRoll < 0.85) {
    tier = 'medium';
  } else if (tierRoll < 0.98) {
    tier = 'elite';
  } else {
    tier = 'boss';
  }

  // Get registry for selected tier
  const registry = ENEMY_REGISTRY[tier];

  // Select random enemy from tier
  const randomEnemy = registry[Math.floor(Math.random() * registry.length)];

  // Apply some randomness to HP based on current wave
  const baseHp = randomEnemy.baseHp;
  const waveMultiplier = 1 + (currentWave - 1) * 0.3; // Less scaling than normal waves
  const hpVariance = 0.2; // 20% variance
  const randomHp = Math.round(
    baseHp * waveMultiplier * (1 - hpVariance / 2 + Math.random() * hpVariance)
  );

  return {
    id: Date.now(),
    name:
      randomEnemy.name +
      (tier === 'elite' ? ' (Elite)' : tier === 'boss' ? '' : ''),
    hp: randomHp,
    burnStacks: 0,
    isDead: false,
    tier,
  };
}

/**
 * Creates initial enemies for the game
 */
export function createInitialEnemies(): Enemy[] {
  return [
    {
      id: 1,
      name: 'Kobold',
      hp: 60,
      burnStacks: 0,
      isDead: false,
      tier: 'fodder',
    },
    {
      id: 2,
      name: 'Goblin',
      hp: 100,
      burnStacks: 0,
      isDead: false,
      tier: 'medium',
    },
    {
      id: 3,
      name: 'Dragon Whelp',
      hp: 200,
      burnStacks: 0,
      isDead: false,
      tier: 'elite',
    },
  ];
}

/**
 * Checks if all enemies have been defeated
 */
export function areAllEnemiesDefeated(enemies: Enemy[]): boolean {
  return enemies.every(enemy => enemy.isDead);
}
