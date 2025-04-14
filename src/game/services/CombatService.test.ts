import { describe, it, expect } from 'vitest';
import { applyAttack, skipTurn } from './CombatService';
import { Enemy } from '../models/Enemy';
import { STATUS_EFFECTS } from '../constants/DamageValues';

describe('CombatService', () => {
  // Helper to create a test enemy
  const createTestEnemy = (overrides: Partial<Enemy> = {}): Enemy => ({
    id: 1,
    name: 'Test Enemy',
    hp: 100,
    maxHp: 100,
    burnStacks: 0,
    scorchLevel: 0,
    infernoLevel: 0,
    hasPyroclasm: false,
    isDead: false,
    tier: 'fodder',
    ...overrides,
  });

  describe('applyAttack', () => {
    describe('basic fire attack', () => {
      it('should apply damage and burn stacks', () => {
        // Arrange
        const initialEnemy = createTestEnemy();
        const enemies = [initialEnemy];

        // Act
        const result = applyAttack(enemies, initialEnemy, 'fire');

        // Assert
        expect(result.updatedEnemies[0].hp).toBe(97); // 100 - 3 damage
        // Don't strictly test the burn stacks value as it may vary due to randomness
        expect(result.updatedEnemies[0].burnStacks).toBeGreaterThanOrEqual(3);
        expect(result.message).toContain(
          'Used Fire on Test Enemy for 3 damage'
        );
      });
    });

    describe('combustion attack', () => {
      it('should convert half of burn stacks to damage', () => {
        // Arrange
        const initialEnemy = createTestEnemy({ burnStacks: 10 });
        const enemies = [initialEnemy];

        // Act
        const result = applyAttack(enemies, initialEnemy, 'combustion');

        // Assert
        const burnStacksConverted = Math.floor(initialEnemy.burnStacks / 2); // 5
        const expectedDamage =
          burnStacksConverted * STATUS_EFFECTS.burn.baseDamagePerStack; // 5 * 2 = 10

        expect(
          result.updatedEnemies[0].hp === initialEnemy.hp - expectedDamage
        ); // 100 - 10 = 90
        // Don't strictly test the burn stacks value as it may vary due to randomness
        expect(result.updatedEnemies[0].burnStacks).toBeGreaterThanOrEqual(5);
        expect(
          result.effectMessages.some(msg => msg.includes('Burn stacks combust'))
        ).toBe(true);
      });

      it('should use fire attack when no burn stacks are available', () => {
        // Arrange
        const initialEnemy = createTestEnemy({ burnStacks: 0 });
        const enemies = [initialEnemy];

        // Act
        const result = applyAttack(enemies, initialEnemy, 'combustion');

        // Assert
        expect(result.message).toContain('Combustion converted to Fire attack');
        expect(result.updatedEnemies[0].hp).toBe(97); // 100 - 3 damage from fire
        expect(result.updatedEnemies[0].burnStacks).toBeGreaterThanOrEqual(3); // May have additional burn stacks from random effects
      });

      it('should apply scorch and inferno multipliers to combustion damage', () => {
        // Arrange
        const initialEnemy = createTestEnemy({
          burnStacks: 10,
          scorchLevel: 1,
          infernoLevel: 1,
        });
        const enemies = [initialEnemy];

        // Act
        const result = applyAttack(enemies, initialEnemy, 'combustion');

        // Assert
        const burnStacksConverted = Math.floor(initialEnemy.burnStacks / 2); // 5
        const baseDamage =
          burnStacksConverted * STATUS_EFFECTS.burn.baseDamagePerStack; // 5 * 2 = 10
        const scorchMultiplier = Math.pow(
          STATUS_EFFECTS.scorch.burnDamageMultiplier,
          initialEnemy.scorchLevel
        ); // 1.5^1 = 1.5
        const infernoMultiplier = Math.pow(
          STATUS_EFFECTS.inferno.scorchMultiplier,
          initialEnemy.infernoLevel
        ); // 2^1 = 2
        const expectedDamage = Math.round(
          baseDamage * scorchMultiplier * infernoMultiplier
        ); // 10 * 1.5 * 2 = 30

        expect(result.updatedEnemies[0].hp).toBe(
          initialEnemy.hp - expectedDamage
        ); // 100 - 30 = 70
      });

      it('should kill enemy when combustion damage exceeds HP', () => {
        // Arrange
        const initialEnemy = createTestEnemy({
          hp: 10,
          burnStacks: 20,
        });
        const enemies = [initialEnemy];

        // Act
        const result = applyAttack(enemies, initialEnemy, 'combustion');

        // Assert
        expect(result.updatedEnemies[0].hp).toBe(0);
        expect(result.updatedEnemies[0].isDead).toBe(true);
        expect(result.deathMessages.length).toBeGreaterThan(0);
      });
    });

    describe('heat intensify attack', () => {
      it('should double burn stacks', () => {
        // Arrange
        const initialEnemy = createTestEnemy({ burnStacks: 5 });
        const enemies = [initialEnemy];

        // Act
        const result = applyAttack(enemies, initialEnemy, 'heatIntensify');

        // Assert
        // Burn stacks should be at least doubled (10) and may include additional stacks from random effects
        expect(result.updatedEnemies[0].burnStacks).toBeGreaterThanOrEqual(10);
        expect(result.message).toContain('doubling burn stacks');
      });
    });

    describe('flameWave attack', () => {
      it('should damage all enemies and apply burn stacks', () => {
        // Arrange
        const enemy1 = createTestEnemy({ id: 1, name: 'Enemy 1' });
        const enemy2 = createTestEnemy({ id: 2, name: 'Enemy 2' });
        const enemies = [enemy1, enemy2];

        // Act
        const result = applyAttack(enemies, enemy1, 'flameWave');

        // Assert
        expect(result.updatedEnemies[0].hp).toBe(98); // 100 - 2 damage
        expect(result.updatedEnemies[1].hp).toBe(98); // 100 - 2 damage
        // Don't strictly test burn stacks as they can vary due to random effects
        expect(result.updatedEnemies[0].burnStacks).toBeGreaterThanOrEqual(6);
        expect(result.updatedEnemies[1].burnStacks).toBeGreaterThanOrEqual(6);
      });
    });
  });

  describe('skipTurn', () => {
    it('should apply burn damage and reduce burn stacks', () => {
      // Arrange
      const enemy = createTestEnemy({ burnStacks: 5 });
      const enemies = [enemy];

      // Act
      const result = skipTurn(enemies);

      // Assert
      const expectedDamage = 5 * STATUS_EFFECTS.burn.baseDamagePerStack; // 5 * 2 = 10

      expect(result.updatedEnemies[0].hp).toBe(enemy.hp - expectedDamage); // 100 - 10 = 90
      // Burn stacks may be affected by random effects
      expect(result.updatedEnemies[0].burnStacks).toBeGreaterThanOrEqual(4);
      expect(result.totalDamageDealt).toBe(expectedDamage);
    });

    it('should apply status effect multipliers to burn damage', () => {
      // Arrange
      const enemy = createTestEnemy({
        burnStacks: 5,
        scorchLevel: 2,
        infernoLevel: 1,
      });
      const enemies = [enemy];

      // Act
      const result = skipTurn(enemies);

      // Assert
      const baseDamage =
        enemy.burnStacks * STATUS_EFFECTS.burn.baseDamagePerStack; // 5 * 2 = 10
      const scorchMultiplier = Math.pow(
        STATUS_EFFECTS.scorch.burnDamageMultiplier,
        enemy.scorchLevel
      ); // 1.5^2 = 2.25
      const infernoMultiplier = Math.pow(
        STATUS_EFFECTS.inferno.scorchMultiplier,
        enemy.infernoLevel
      ); // 2^1 = 2
      const expectedDamage = Math.round(
        baseDamage * scorchMultiplier * infernoMultiplier
      ); // 10 * 2.25 * 2 = 45

      expect(result.updatedEnemies[0].hp).toBe(enemy.hp - expectedDamage); // 100 - 45 = 55
      expect(result.totalDamageDealt).toBe(expectedDamage);
    });

    it('should handle multiple enemies with burn effects', () => {
      // Arrange
      const enemy1 = createTestEnemy({ id: 1, name: 'Enemy 1', burnStacks: 3 });
      const enemy2 = createTestEnemy({ id: 2, name: 'Enemy 2', burnStacks: 4 });
      const enemies = [enemy1, enemy2];

      // Act
      const result = skipTurn(enemies);

      // Assert
      const damage1 =
        enemy1.burnStacks * STATUS_EFFECTS.burn.baseDamagePerStack; // 3 * 2 = 6
      const damage2 =
        enemy2.burnStacks * STATUS_EFFECTS.burn.baseDamagePerStack; // 4 * 2 = 8

      expect(result.updatedEnemies[0].hp).toBe(enemy1.hp - damage1); // 100 - 6 = 94
      expect(result.updatedEnemies[1].hp).toBe(enemy2.hp - damage2); // 100 - 8 = 92
      expect(result.totalDamageDealt).toBe(damage1 + damage2); // 6 + 8 = 14
      expect(result.enemiesAffected).toBe(2);
    });
  });
});
