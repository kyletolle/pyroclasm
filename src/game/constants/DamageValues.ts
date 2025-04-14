import { DamageEffect } from '../models/DamageEffect';

/**
 * Base damage values for each damage effect
 */
export const BASE_DAMAGE: Record<DamageEffect, number> = {
  fire: 3,
  fireBolt: 7, // High damage single target
  flameWave: 2, // Low damage multi-target
};

/**
 * Constants for status effects in the derivative damage system
 */
export const STATUS_EFFECTS = {
  // 1st derivative - Damage over time
  burn: {
    baseDamagePerStack: 2,
    stacksApplied: {
      fire: 3,
      fireBolt: 4, // Medium burn application
      flameWave: 6, // High burn application
    },
    // Chance for burn to proc scorch (per stack)
    chanceToProc: {
      scorch: 0.15, // 15% chance per burn stack
    },
  },

  // 2nd derivative - Accelerate burn damage
  scorch: {
    burnDamageMultiplier: 1.5, // Each level increases burn damage by 50%
    maxLevel: 5,
    additionalBurnStacks: 1, // Each scorch level add adds this many burn stacks
    decayRate: 0.05, // 5% chance to decay each turn (significantly reduced from original)
  },

  // 3rd derivative - Accelerate scorch and spread burn
  inferno: {
    scorchMultiplier: 2, // Multiplier for scorch effectiveness
    maxLevel: 3,
    spreadRadius: 1, // Number of other enemies to potentially spread to
    burnStacksToSpread: 2, // Number of burn stacks to spread to other enemies
    decayRate: 0.03, // 3% chance to decay each turn (significantly reduced from original)
    // Chance for inferno effects to proc (per scorch level)
    chanceToProc: {
      inferno: 0.1, // 10% chance per scorch level
      pyroclasm: 0.005, // 0.5% chance per burn stack (dramatically increased from 0.005%)
    },
  },

  // 4th derivative - Catastrophic effect
  pyroclasm: {
    burnStacksApplied: 8, // Apply this many burn stacks to all enemies
    scorchLevelApplied: 2, // Apply this many scorch levels to all enemies
    infernoLevelApplied: 1, // Apply this many inferno levels to all enemies
  },
};
