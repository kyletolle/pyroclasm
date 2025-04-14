import { Enemy, EnemyTier } from '../models/Enemy';
import { DamageEffect } from '../models/DamageEffect';
import { BASE_DAMAGE, STATUS_EFFECTS } from '../constants/DamageValues';
import { capitalize } from '../../utils';
import { random } from '../../utils/random';

// Interface for the result of an attack
export interface AttackResult {
  updatedEnemies: Enemy[];
  message: string;
  deathMessages: string[];
  effectMessages: string[];
}

// Interface for the result of skipping a turn
export interface SkipTurnResult {
  updatedEnemies: Enemy[];
  totalDamageDealt: number;
  enemiesAffected: number;
  message: string;
  deathMessages: string[];
  effectMessages: string[];
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
        burnStacks: 0,
        scorchLevel: 0,
        infernoLevel: 0,
        hasPyroclasm: false,
        isDead: true,
      },
      hasDied: true,
    };
  }

  return { enemy, hasDied: false };
}

/**
 * Rolls a probability check
 */
function rollProbability(chance: number): boolean {
  return random() < chance;
}

/**
 * Get random enemy from a list excluding a specific enemy
 */
function getRandomEnemy(enemies: Enemy[], excludeId: number): Enemy | null {
  const liveEnemies = enemies.filter(e => !e.isDead && e.id !== excludeId);
  if (liveEnemies.length === 0) return null;
  return liveEnemies[Math.floor(random() * liveEnemies.length)];
}

/**
 * Process scorch proc chance based on burn stacks
 */
function processScorchProc(enemy: Enemy, effectMessages: string[]): Enemy {
  if (enemy.isDead) return enemy;

  // Each burn stack has a chance to proc scorch
  const scorchChance = STATUS_EFFECTS.burn.chanceToProc.scorch;
  const procCount = Array(enemy.burnStacks)
    .fill(0)
    .filter(() => rollProbability(scorchChance)).length;

  if (procCount > 0) {
    const newScorchLevel = Math.min(
      enemy.scorchLevel + procCount,
      STATUS_EFFECTS.scorch.maxLevel
    );
    if (newScorchLevel > enemy.scorchLevel) {
      // Add additional burn stacks from scorch
      const additionalBurnStacks =
        STATUS_EFFECTS.scorch.additionalBurnStacks *
        (newScorchLevel - enemy.scorchLevel);

      effectMessages.push(
        `🔥🔥 ${enemy.name} is scorched! Burn damage increased by ${Math.round((STATUS_EFFECTS.scorch.burnDamageMultiplier - 1) * 100)}%!`
      );

      return {
        ...enemy,
        scorchLevel: newScorchLevel,
        burnStacks: enemy.burnStacks + additionalBurnStacks,
      };
    }
  }

  return enemy;
}

/**
 * Process inferno proc chance based on scorch level
 * (Inferno = 3rd derivative of damage, like jerk in physics)
 */
function processInfernoProc(
  enemy: Enemy,
  allEnemies: Enemy[],
  effectMessages: string[]
): { updatedTarget: Enemy; updatedEnemies: Enemy[] } {
  if (enemy.isDead || enemy.scorchLevel === 0) {
    return { updatedTarget: enemy, updatedEnemies: allEnemies };
  }

  const infernoChance = STATUS_EFFECTS.inferno.chanceToProc.inferno;
  const procCount = Array(enemy.scorchLevel)
    .fill(0)
    .filter(() => rollProbability(infernoChance)).length;

  if (procCount > 0) {
    const newInfernoLevel = Math.min(
      enemy.infernoLevel + procCount,
      STATUS_EFFECTS.inferno.maxLevel
    );
    if (newInfernoLevel > enemy.infernoLevel) {
      effectMessages.push(
        `⚡🔥 ${enemy.name} experiences inferno! Scorch accelerates and burn spreads!`
      );

      let updatedEnemies = [...allEnemies];
      const targetEnemy = {
        ...enemy,
        infernoLevel: newInfernoLevel,
      };

      // Spread burn to other enemies when inferno procs
      const spreadCount = STATUS_EFFECTS.inferno.spreadRadius * procCount;
      const burnStacksToSpread = STATUS_EFFECTS.inferno.burnStacksToSpread;

      // Try to spread to random enemies
      for (let i = 0; i < spreadCount; i++) {
        const targetToSpreadTo = getRandomEnemy(updatedEnemies, enemy.id);
        if (targetToSpreadTo) {
          effectMessages.push(
            `🔥➡️ Burn spreads from ${enemy.name} to ${targetToSpreadTo.name}!`
          );

          // Update the target in the array
          updatedEnemies = updatedEnemies.map(e =>
            e.id === targetToSpreadTo.id
              ? { ...e, burnStacks: e.burnStacks + burnStacksToSpread }
              : e
          );
        }
      }

      return {
        updatedTarget: targetEnemy,
        updatedEnemies: updatedEnemies.map(e =>
          e.id === targetEnemy.id ? targetEnemy : e
        ),
      };
    }
  }

  return { updatedTarget: enemy, updatedEnemies: allEnemies };
}

/**
 * Process pyroclasm proc chance
 * (Pyroclasm is a special case effect, not strictly a 4th derivative)
 */
function processPyroclasmProc(
  enemy: Enemy,
  allEnemies: Enemy[],
  effectMessages: string[]
): Enemy[] {
  if (enemy.isDead || enemy.burnStacks === 0) return allEnemies;

  // Each burn stack has a small chance to trigger pyroclasm
  const pyroclasmChance = STATUS_EFFECTS.inferno.chanceToProc.pyroclasm;
  const pyroclasmProc = Array(enemy.burnStacks)
    .fill(0)
    .some(() => rollProbability(pyroclasmChance));

  if (pyroclasmProc) {
    // Catastrophic effect that hits all enemies
    effectMessages.push(
      `🌋🌋🌋 PYROCLASM TRIGGERED from ${enemy.name}! The battlefield is engulfed in flames!`
    );

    return allEnemies.map(e => {
      if (e.isDead) return e;

      return {
        ...e,
        burnStacks: e.burnStacks + STATUS_EFFECTS.pyroclasm.burnStacksApplied,
        scorchLevel: Math.min(
          e.scorchLevel + STATUS_EFFECTS.pyroclasm.scorchLevelApplied,
          STATUS_EFFECTS.scorch.maxLevel
        ),
        infernoLevel: Math.min(
          e.infernoLevel + STATUS_EFFECTS.pyroclasm.infernoLevelApplied,
          STATUS_EFFECTS.inferno.maxLevel
        ),
        hasPyroclasm: true,
      };
    });
  }

  return allEnemies;
}

/**
 * Calculate burn damage based on enemy's status effects
 */
function calculateBurnDamage(enemy: Enemy): number {
  if (enemy.burnStacks <= 0) return 0;

  let damage = enemy.burnStacks * STATUS_EFFECTS.burn.baseDamagePerStack;

  // Apply scorch multiplier if applicable
  if (enemy.scorchLevel > 0) {
    const scorchMultiplier = Math.pow(
      STATUS_EFFECTS.scorch.burnDamageMultiplier,
      enemy.scorchLevel
    );
    damage *= scorchMultiplier;
  }

  // Apply inferno multiplier if applicable
  if (enemy.infernoLevel > 0) {
    const infernoMultiplier = Math.pow(
      STATUS_EFFECTS.inferno.scorchMultiplier,
      enemy.infernoLevel
    );
    damage *= infernoMultiplier;
  }

  // Pyroclasm adds an additional flat bonus
  if (enemy.hasPyroclasm) {
    damage *= 1.5;
  }

  return Math.round(damage);
}

/**
 * Handles a basic single-target attack (fire, fireBolt, emberSpark)
 */
function handleBasicAttack(
  enemies: Enemy[],
  targetEnemy: Enemy,
  effect: DamageEffect,
  damage: number,
  burnStacksToAdd: number
): AttackResult {
  const deathMessages: string[] = [];
  const effectMessages: string[] = [];

  // Apply damage to target enemy
  let updatedEnemies = enemies.map(enemy => {
    if (enemy.id === targetEnemy.id) {
      // Apply damage
      const damagedEnemy = {
        ...enemy,
        hp: Math.max(0, enemy.hp - damage),
        burnStacks: enemy.burnStacks + burnStacksToAdd,
      };

      // Check if enemy died from this attack
      const { enemy: afterDeathCheck, hasDied } = checkForDeath(damagedEnemy);

      if (hasDied) {
        deathMessages.push(`${enemy.name} has been defeated! 💀`);
      }

      return afterDeathCheck;
    }
    return enemy;
  });

  // Process derivative effects if enemy is still alive
  const attackedEnemy = updatedEnemies.find(e => e.id === targetEnemy.id);
  if (attackedEnemy && !attackedEnemy.isDead) {
    // Process scorch (2nd derivative)
    const afterScorch = processScorchProc(attackedEnemy, effectMessages);

    // Update enemy in array
    updatedEnemies = updatedEnemies.map(e =>
      e.id === attackedEnemy.id ? afterScorch : e
    );

    // Process inferno (3rd derivative)
    const { updatedTarget: afterInferno, updatedEnemies: afterInfernoEnemies } =
      processInfernoProc(afterScorch, updatedEnemies, effectMessages);

    updatedEnemies = afterInfernoEnemies;

    // Process pyroclasm (special case)
    updatedEnemies = processPyroclasmProc(
      afterInferno,
      updatedEnemies,
      effectMessages
    );
  }

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
    effectMessages,
  };
}

/**
 * Handles the flameWave attack which hits all enemies
 */
function handleFlameWaveAttack(
  enemies: Enemy[],
  damage: number,
  burnStacksToAdd: number
): AttackResult {
  const deathMessages: string[] = [];
  const effectMessages: string[] = [];

  let updatedEnemies = [...enemies];
  const livingEnemies = enemies.filter(e => !e.isDead);
  const affectedEnemyNames: string[] = [];

  // Apply damage and burn to all living enemies
  livingEnemies.forEach(enemy => {
    const enemyIndex = updatedEnemies.findIndex(e => e.id === enemy.id);
    if (enemyIndex !== -1) {
      // Apply damage
      const damagedEnemy = {
        ...enemy,
        hp: Math.max(0, enemy.hp - damage),
        burnStacks: enemy.burnStacks + burnStacksToAdd,
      };

      // Check if enemy died from this attack
      const { enemy: afterDeathCheck, hasDied } = checkForDeath(damagedEnemy);

      if (hasDied) {
        deathMessages.push(`${enemy.name} has been defeated! 💀`);
      }

      updatedEnemies[enemyIndex] = afterDeathCheck;
      affectedEnemyNames.push(enemy.name);
    }
  });

  // Process derivative effects for all living enemies
  for (const enemy of updatedEnemies.filter(e => !e.isDead)) {
    // Process scorch (2nd derivative)
    const afterScorch = processScorchProc(enemy, effectMessages);

    // Update enemy in array
    updatedEnemies = updatedEnemies.map(e =>
      e.id === enemy.id ? afterScorch : e
    );

    // Process inferno (3rd derivative)
    const { updatedTarget: afterInferno, updatedEnemies: afterInfernoEnemies } =
      processInfernoProc(afterScorch, updatedEnemies, effectMessages);

    updatedEnemies = afterInfernoEnemies;

    // Process pyroclasm (special case)
    updatedEnemies = processPyroclasmProc(
      afterInferno,
      updatedEnemies,
      effectMessages
    );
  }

  // Construct result message
  const message = `Used Flame Wave, hitting ${livingEnemies.length} enemies for ${damage} damage each and applying ${burnStacksToAdd} burn stacks.`;

  return {
    updatedEnemies,
    message,
    deathMessages,
    effectMessages,
  };
}

/**
 * Handles the Heat Intensify attack which doubles burn stacks
 */
function handleHeatIntensifyAttack(
  enemies: Enemy[],
  targetEnemy: Enemy
): AttackResult {
  const deathMessages: string[] = [];
  const effectMessages: string[] = [];

  let updatedEnemies = [...enemies];
  const targetIndex = updatedEnemies.findIndex(e => e.id === targetEnemy.id);

  // Make sure we're working with the most current version of the target enemy
  const currentTargetEnemy = updatedEnemies[targetIndex];

  // Log the enemy's current burn stacks for debugging
  console.log(
    `Heat Intensify on ${currentTargetEnemy.name} with burn stacks: ${currentTargetEnemy.burnStacks}`
  );

  if (currentTargetEnemy.burnStacks <= 0) {
    // Try using a basic fire attack instead to apply burn stacks
    const fireAttack: DamageEffect = 'fire';
    const damage = BASE_DAMAGE[fireAttack];
    const burnStacksToAdd = STATUS_EFFECTS.burn.stacksApplied[fireAttack] || 0;

    return handleFireAttackFallback(
      updatedEnemies,
      currentTargetEnemy,
      damage,
      burnStacksToAdd,
      'Heat Intensify'
    );
  }

  const oldBurnStacks = currentTargetEnemy.burnStacks;
  const newBurnStacks = oldBurnStacks * 2;

  // Create a copy to avoid reference issues
  const updatedEnemy = {
    ...currentTargetEnemy,
    burnStacks: newBurnStacks,
  };

  // Update the enemy in the array
  updatedEnemies[targetIndex] = updatedEnemy;

  effectMessages.push(
    `🔆 Burn intensifies on ${targetEnemy.name}! Burn stacks doubled from ${oldBurnStacks} to ${newBurnStacks}.`
  );

  // Process derivative effects (but ensure burn stacks remain at least doubled)
  const afterScorch = processScorchProc(
    updatedEnemies[targetIndex],
    effectMessages
  );

  // Make sure burn stacks don't go below the doubled value due to processing
  if (afterScorch.burnStacks < newBurnStacks) {
    afterScorch.burnStacks = newBurnStacks;
  }

  updatedEnemies[targetIndex] = afterScorch;

  const { updatedTarget: afterInferno, updatedEnemies: afterInfernoEnemies } =
    processInfernoProc(afterScorch, updatedEnemies, effectMessages);

  // Make sure burn stacks don't go below the doubled value
  if (afterInferno.burnStacks < newBurnStacks) {
    afterInferno.burnStacks = newBurnStacks;
  }

  updatedEnemies = afterInfernoEnemies.map(e =>
    e.id === afterInferno.id ? afterInferno : e
  );

  updatedEnemies = processPyroclasmProc(
    afterInferno,
    updatedEnemies,
    effectMessages
  );

  return {
    updatedEnemies,
    message: `Used Heat Intensify on ${targetEnemy.name}, doubling burn stacks from ${oldBurnStacks} to ${newBurnStacks}!`,
    deathMessages,
    effectMessages,
  };
}

/**
 * A helper function for when skills fall back to fire attack
 */
function handleFireAttackFallback(
  enemies: Enemy[],
  targetEnemy: Enemy,
  damage: number,
  burnStacksToAdd: number,
  originalAttackName: string
): AttackResult {
  const effectMessages: string[] = [];
  let updatedEnemies = [...enemies];
  const targetIndex = updatedEnemies.findIndex(e => e.id === targetEnemy.id);

  // Apply damage and burn stacks
  const updatedEnemy = {
    ...targetEnemy,
    hp: Math.max(0, targetEnemy.hp - damage),
    burnStacks: targetEnemy.burnStacks + burnStacksToAdd,
  };

  updatedEnemies[targetIndex] = updatedEnemy;

  // Process derivative effects
  const afterScorch = processScorchProc(updatedEnemy, effectMessages);
  updatedEnemies[targetIndex] = afterScorch;

  const { updatedTarget: afterInferno, updatedEnemies: afterInfernoEnemies } =
    processInfernoProc(afterScorch, updatedEnemies, effectMessages);

  updatedEnemies = afterInfernoEnemies.map(e =>
    e.id === afterInferno.id ? afterInferno : e
  );

  updatedEnemies = processPyroclasmProc(
    afterInferno,
    updatedEnemies,
    effectMessages
  );

  return {
    updatedEnemies,
    message: `${originalAttackName} converted to Fire attack on ${targetEnemy.name} for ${damage} damage and ${burnStacksToAdd} burn stacks!`,
    deathMessages: [],
    effectMessages,
  };
}

/**
 * Handles the Combustion attack which converts burn stacks to damage
 */
function handleCombustionAttack(
  enemies: Enemy[],
  targetEnemy: Enemy
): AttackResult {
  const deathMessages: string[] = [];
  const effectMessages: string[] = [];

  let updatedEnemies = [...enemies];
  const targetIndex = updatedEnemies.findIndex(e => e.id === targetEnemy.id);

  // Make sure we're working with the most current version of the target enemy
  const currentTargetEnemy = updatedEnemies[targetIndex];

  // Log the enemy's current burn stacks for debugging
  console.log(
    `Combustion on ${currentTargetEnemy.name} with burn stacks: ${currentTargetEnemy.burnStacks}`
  );

  if (currentTargetEnemy.burnStacks === 0) {
    // Try using a basic fire attack instead to apply burn stacks
    const fireAttack: DamageEffect = 'fire';
    const damage = BASE_DAMAGE[fireAttack];
    const burnStacksToAdd = STATUS_EFFECTS.burn.stacksApplied[fireAttack] || 0;

    return handleFireAttackFallback(
      updatedEnemies,
      currentTargetEnemy,
      damage,
      burnStacksToAdd,
      'Combustion'
    );
  }

  const burnStacksToConvert = Math.floor(currentTargetEnemy.burnStacks / 2);
  const remainingBurnStacks =
    currentTargetEnemy.burnStacks - burnStacksToConvert;

  // Calculate combustion damage with modifiers from status effects
  const combustionDamage = calculateCombustionDamage(
    burnStacksToConvert,
    currentTargetEnemy.scorchLevel,
    currentTargetEnemy.infernoLevel
  );

  // Create a new enemy object with updated HP and burn stacks
  const updatedEnemy = {
    ...currentTargetEnemy,
    burnStacks: remainingBurnStacks,
    hp: Math.max(0, currentTargetEnemy.hp - combustionDamage),
  };

  // Update the enemy in the array
  updatedEnemies[targetIndex] = updatedEnemy;

  effectMessages.push(
    `💥 Burn stacks combust on ${currentTargetEnemy.name}! ${burnStacksToConvert} stacks converted to ${combustionDamage} immediate damage!`
  );

  // Check if enemy died from combustion damage
  const { enemy: afterDeathCheck, hasDied } = checkForDeath(updatedEnemy);

  if (hasDied) {
    deathMessages.push(
      `${currentTargetEnemy.name} has been burned to death by Combustion! 💀🔥`
    );
  }

  updatedEnemies[targetIndex] = afterDeathCheck;

  // Only process derivative effects if enemy is still alive
  if (!afterDeathCheck.isDead) {
    const afterScorch = processScorchProc(afterDeathCheck, effectMessages);
    updatedEnemies[targetIndex] = afterScorch;

    const { updatedTarget: afterInferno, updatedEnemies: afterInfernoEnemies } =
      processInfernoProc(afterScorch, updatedEnemies, effectMessages);

    updatedEnemies = afterInfernoEnemies;

    updatedEnemies = processPyroclasmProc(
      afterInferno,
      updatedEnemies,
      effectMessages
    );
  }

  return {
    updatedEnemies,
    message: `Used Combustion on ${currentTargetEnemy.name}, converting ${burnStacksToConvert} burn stacks to ${combustionDamage} immediate damage!`,
    deathMessages,
    effectMessages,
  };
}

/**
 * Calculate combustion damage based on burn stacks and status effects
 */
function calculateCombustionDamage(
  burnStacks: number,
  scorchLevel: number,
  infernoLevel: number
): number {
  let combustionDamage = burnStacks * STATUS_EFFECTS.burn.baseDamagePerStack;

  // Apply scorch multiplier if applicable
  if (scorchLevel > 0) {
    const scorchMultiplier = Math.pow(
      STATUS_EFFECTS.scorch.burnDamageMultiplier,
      scorchLevel
    );
    combustionDamage *= scorchMultiplier;
  }

  // Apply inferno multiplier if applicable
  if (infernoLevel > 0) {
    const infernoMultiplier = Math.pow(
      STATUS_EFFECTS.inferno.scorchMultiplier,
      infernoLevel
    );
    combustionDamage *= infernoMultiplier;
  }

  // Round the final damage value
  return Math.round(combustionDamage);
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
      effectMessages: [],
    };
  }

  // Don't allow attacks on dead enemies
  if (targetEnemy.isDead) {
    return {
      updatedEnemies: enemies,
      message: `${targetEnemy.name} is already defeated!`,
      deathMessages: [],
      effectMessages: [],
    };
  }

  // Calculate direct damage
  const damage = BASE_DAMAGE[effect];
  const burnStacksToAdd = STATUS_EFFECTS.burn.stacksApplied[effect] || 0;

  // Handle special cases for attacks with unique effects
  if (effect === 'flameWave') {
    return handleFlameWaveAttack(enemies, damage, burnStacksToAdd);
  } else if (effect === 'heatIntensify') {
    return handleHeatIntensifyAttack(enemies, targetEnemy);
  } else if (effect === 'combustion') {
    return handleCombustionAttack(enemies, targetEnemy);
  }

  // For single target attacks (fire, fireBolt, emberSpark)
  return handleBasicAttack(
    enemies,
    targetEnemy,
    effect,
    damage,
    burnStacksToAdd
  );
}

/**
 * Applies burn damage to an enemy and processes any death
 */
function applyBurnDamage(enemy: Enemy): {
  updatedEnemy: Enemy;
  damage: number;
  hasDied: boolean;
} {
  if (enemy.isDead || enemy.burnStacks <= 0) {
    return { updatedEnemy: enemy, damage: 0, hasDied: false };
  }

  // Calculate burn damage with all modifiers
  const burnDamage = calculateBurnDamage(enemy);

  // Apply burn damage and reduce burn stacks
  const updatedBurnStacks = Math.max(0, enemy.burnStacks - 1);

  // If burn stacks reach 0, reset scorch and inferno levels
  const updatedScorchLevel = updatedBurnStacks === 0 ? 0 : enemy.scorchLevel;
  const updatedInfernoLevel = updatedBurnStacks === 0 ? 0 : enemy.infernoLevel;

  const damagedEnemy = {
    ...enemy,
    hp: Math.max(0, enemy.hp - burnDamage),
    burnStacks: updatedBurnStacks,
    scorchLevel: updatedScorchLevel,
    infernoLevel: updatedInfernoLevel,
    hasPyroclasm: enemy.hasPyroclasm ? updatedBurnStacks > 0 : false, // Pyroclasm fades when burn stacks are gone
  };

  // Check if enemy died from this burn damage
  const { enemy: finalEnemy, hasDied } = checkForDeath(damagedEnemy);

  return { updatedEnemy: finalEnemy, damage: burnDamage, hasDied };
}

/**
 * Processes status effects for all living enemies with burn stacks
 */
function processStatusEffects(
  enemies: Enemy[],
  effectMessages: string[]
): Enemy[] {
  let updatedEnemies = [...enemies];

  // Process each living enemy with burn stacks
  for (const enemy of updatedEnemies.filter(
    e => !e.isDead && e.burnStacks > 0
  )) {
    // Process scorch proc
    const afterScorch = processScorchProc(enemy, effectMessages);

    // Update enemy in array
    updatedEnemies = updatedEnemies.map(e =>
      e.id === enemy.id ? afterScorch : e
    );

    // Process inferno proc
    const { updatedTarget: afterInferno, updatedEnemies: afterInfernoEnemies } =
      processInfernoProc(afterScorch, updatedEnemies, effectMessages);

    updatedEnemies = afterInfernoEnemies;

    // Process pyroclasm
    updatedEnemies = processPyroclasmProc(
      afterInferno,
      updatedEnemies,
      effectMessages
    );
  }

  return updatedEnemies;
}

/**
 * Processes a turn skip, applying status effects like burn damage
 */
export function skipTurn(enemies: Enemy[]): SkipTurnResult {
  let totalDamageDealt = 0;
  let enemiesWithEffects = 0;
  const deathMessages: string[] = [];
  const effectMessages: string[] = [];

  // First apply burn damage to all enemies
  let updatedEnemies = enemies.map(enemy => {
    // Skip processing for dead enemies
    if (enemy.isDead) return enemy;

    if (enemy.burnStacks > 0) {
      const { updatedEnemy, damage, hasDied } = applyBurnDamage(enemy);

      // Track stats
      if (damage > 0) {
        enemiesWithEffects++;
        totalDamageDealt += damage;
      }

      // Add death message if needed
      if (hasDied) {
        deathMessages.push(`${enemy.name} has been burned to death! 💀🔥`);
      }

      return updatedEnemy;
    }

    return enemy;
  });

  // Then process all derivative effects (scorch, inferno, pyroclasm)
  updatedEnemies = processStatusEffects(updatedEnemies, effectMessages);

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
    effectMessages,
  };
}

/**
 * Enemy registry with details for all potential enemy types by tier
 */
const ENEMY_REGISTRY = {
  fodder: [
    { name: 'Imp', baseHp: 100 }, // Up from 50
    { name: 'Kobold', baseHp: 120 }, // Up from 60
    { name: 'Fire Sprite', baseHp: 90 }, // Up from 45
    { name: 'Ember Rat', baseHp: 80 }, // Up from 40
    { name: 'Cinder Bug', baseHp: 70 }, // Up from 35
    { name: 'Ash Elemental', baseHp: 110 }, // Up from 55
  ],
  medium: [
    { name: 'Goblin', baseHp: 200 }, // Up from 100
    { name: 'Orc', baseHp: 300 }, // Up from 150
    { name: 'Fire Elemental', baseHp: 260 }, // Up from 130
    { name: 'Magma Hound', baseHp: 280 }, // Up from 140
    { name: 'Flame Cultist', baseHp: 220 }, // Up from 110
    { name: 'Lava Guardian', baseHp: 320 }, // Up from 160
  ],
  elite: [
    { name: 'Dragon Whelp', baseHp: 500 }, // Up from 250
    { name: 'Stone Golem', baseHp: 600 }, // Up from 300
    { name: 'Flame Titan', baseHp: 560 }, // Up from 280
    { name: 'Inferno Mage', baseHp: 480 }, // Up from 240
    { name: 'Molten Giant', baseHp: 640 }, // Up from 320
    { name: 'Hellhound', baseHp: 520 }, // Up from 260
  ],
  boss: [
    { name: 'Drakorath the Scorcher', baseHp: 1000 }, // Up from 500
    { name: 'Pyromus the Incinerator', baseHp: 1100 }, // Up from 550
    { name: 'Cinereus, Lord of Ash', baseHp: 1200 }, // Up from 600
    { name: 'Emberstrike the Infernal', baseHp: 1300 }, // Up from 650
    { name: 'Vulkaris the Molten King', baseHp: 1400 }, // Up from 700
  ],
};

/**
 * Creates a single enemy instance with specified properties
 */
function createEnemy(
  id: number,
  name: string,
  hp: number,
  tier: EnemyTier,
  modifier: string = ''
): Enemy {
  return {
    id,
    name: modifier ? `${name} ${modifier}` : name,
    hp,
    maxHp: hp,
    burnStacks: 0,
    scorchLevel: 0,
    infernoLevel: 0,
    hasPyroclasm: false,
    isDead: false,
    tier,
  };
}

/**
 * Selects a random enemy from a specified tier
 */
function selectRandomEnemyFromTier(tier: EnemyTier): {
  name: string;
  baseHp: number;
} {
  const registry = ENEMY_REGISTRY[tier];
  return registry[Math.floor(random() * registry.length)];
}

/**
 * Creates enemies for a given tier, count, and HP multiplier
 */
function createEnemiesForTier(
  tier: EnemyTier,
  count: number,
  hpMultiplier: number,
  baseId: number,
  modifier: string = ''
): Enemy[] {
  const enemies: Enemy[] = [];

  for (let i = 0; i < count; i++) {
    const randomEnemy = selectRandomEnemyFromTier(tier);
    const hp = Math.round(randomEnemy.baseHp * hpMultiplier);
    const id = baseId + enemies.length;

    enemies.push(createEnemy(id, randomEnemy.name, hp, tier, modifier));
  }

  return enemies;
}

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
  enemies.push(
    ...createEnemiesForTier('fodder', fodderCount, hpMultiplier, timeNow)
  );

  // Add medium enemies
  enemies.push(
    ...createEnemiesForTier(
      'medium',
      mediumCount,
      hpMultiplier,
      timeNow + enemies.length
    )
  );

  // Add elite enemies
  enemies.push(
    ...createEnemiesForTier(
      'elite',
      eliteCount,
      hpMultiplier,
      timeNow + enemies.length,
      ' (Elite)'
    )
  );

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
  enemies.push(createEnemy(timeNow, boss.name, bossHp, 'boss'));

  // Add some fodder minions to accompany the boss
  const minionCount = Math.min(2 + Math.floor(wave / 5), 4); // More minions in higher waves

  for (let i = 0; i < minionCount; i++) {
    // Alternate between fodder and medium tiers for minions
    const tier = i % 2 === 0 ? 'fodder' : 'medium';
    const registry =
      tier === 'fodder' ? ENEMY_REGISTRY.fodder : ENEMY_REGISTRY.medium;
    const randomMinion = registry[Math.floor(random() * registry.length)];
    const hp = Math.round(randomMinion.baseHp * hpMultiplier * 0.8); // Minions are slightly weaker

    enemies.push(
      createEnemy(timeNow + i + 1, `${randomMinion.name} Minion`, hp, tier)
    );
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
  const tierRoll = random();
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
  const randomEnemy = registry[Math.floor(random() * registry.length)];

  // Apply some randomness to HP based on current wave
  const baseHp = randomEnemy.baseHp;
  const waveMultiplier = 1 + (currentWave - 1) * 0.3; // Less scaling than normal waves
  const hpVariance = 0.2; // 20% variance
  const randomHp = Math.round(
    baseHp * waveMultiplier * (1 - hpVariance / 2 + random() * hpVariance)
  );

  return createEnemy(
    Date.now(),
    randomEnemy.name +
      (tier === 'elite' ? ' (Elite)' : tier === 'boss' ? '' : ''),
    randomHp,
    tier
  );
}

/**
 * Creates initial enemies for the game
 * Randomly selects from easier enemies to ensure a balanced start
 */
export function createInitialEnemies(): Enemy[] {
  const enemies: Enemy[] = [];
  const timeNow = Date.now();

  // Select 2-3 fodder enemies for the initial wave
  const fodderCount = 2 + Math.floor(random() * 2); // 2-3 fodder enemies

  // Add fodder enemies
  enemies.push(...createEnemiesForTier('fodder', fodderCount, 0.8, timeNow));

  // 50% chance to add a medium enemy if we only have 2 fodder enemies
  if (fodderCount === 2 && random() > 0.5) {
    const randomMedium = selectRandomEnemyFromTier('medium');
    const hp = Math.floor(randomMedium.baseHp * 0.7); // Reduced HP for the initial medium enemy

    enemies.push(
      createEnemy(timeNow + fodderCount, randomMedium.name, hp, 'medium')
    );
  }

  return enemies;
}

/**
 * Checks if all enemies have been defeated
 */
export function areAllEnemiesDefeated(enemies: Enemy[]): boolean {
  return enemies.every(enemy => enemy.isDead);
}
