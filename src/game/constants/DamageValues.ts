import { DamageEffect } from '../models/DamageEffect';

// Base damage values for each attack type
export const BASE_DAMAGE: Record<DamageEffect, number> = {
  fire: 30,
  burn: 5,
  scorch: 10,
  inferno: 20,
  pyroclasm: 50,
};

// Configuration for status effects
export const STATUS_EFFECTS = {
  burn: {
    damagePerStack: 3,
    stacksApplied: {
      fire: 2,
      burn: 1,
      scorch: 1,
      inferno: 3,
      pyroclasm: 5,
    },
  },
};
