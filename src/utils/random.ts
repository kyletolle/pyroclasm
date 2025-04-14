/**
 * A simple seeded random number generator for consistent test outcomes
 * Based on a simple linear congruential generator algorithm
 */

let seed = 1234; // Default seed
let useSeededRandom = false;

/**
 * Enable seeded random number generation (for tests)
 * @param seedValue The seed to use (defaults to 1234)
 */
export function enableSeededRandom(seedValue: number = 1234): void {
  seed = seedValue;
  useSeededRandom = true;
}

/**
 * Disable seeded random number generation (use Math.random)
 */
export function disableSeededRandom(): void {
  useSeededRandom = false;
}

/**
 * Reset the seed to its original value
 */
export function resetRandomSeed(): void {
  seed = 1234;
}

/**
 * Get a random number between 0 and 1
 * Uses seeded random if enabled, otherwise Math.random
 * @returns A number between 0 and 1
 */
export function random(): number {
  if (!useSeededRandom) {
    return Math.random();
  }

  // Simple LCG parameters
  const a = 1664525;
  const c = 1013904223;
  const m = Math.pow(2, 32);

  // Update seed
  seed = (a * seed + c) % m;

  // Return a value between 0 and 1
  return seed / m;
}
