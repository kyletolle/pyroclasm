/**
 * Enum for the possible derivative types of damage effects
 */
export enum DerivativeType {
  DIRECT = 'direct', // 0th derivative - immediate damage
  BURN = 'burn', // 1st derivative - damage over time
  SCORCH = 'scorch', // 2nd derivative - accelerates burn damage
  INFERNO = 'inferno', // 3rd derivative - accelerates scorch and causes spread
  PYROCLASM = 'pyroclasm', // 4th derivative - catastrophic effect
}

/**
 * Union type for the available damage effects
 */
export type DamageEffect =
  | 'fire'
  | 'fireBolt'
  | 'flameWave'
  | 'emberSpark'
  | 'heatIntensify'
  | 'combustion';

/**
 * Array of all available damage effects
 */
export const allDamageEffects: DamageEffect[] = [
  'fire',
  'fireBolt',
  'flameWave',
  'emberSpark',
  'heatIntensify',
  'combustion',
];
