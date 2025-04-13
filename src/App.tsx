import { useState } from 'react';
import { EnemyList, type Enemy } from './components/EnemyList';
import { type DamageEffect, AttackPanel } from './components/AttackPanel';
import ActionLog from './components/ActionLog';
import { capitalize } from './utils';

const baseDamageMap: Record<DamageEffect, number> = {
  fire: 30,
  burn: 5,
  scorch: 10,
  inferno: 20,
  pyroclasm: 50,
};

// Defines how status effects work
const statusEffects = {
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

function App() {
  const [enemies, setEnemies] = useState<Enemy[]>([
    { id: 1, name: 'Goblin', hp: 100, burnStacks: 0 },
    { id: 2, name: 'Orc', hp: 150, burnStacks: 0 },
    { id: 3, name: 'Dragon Whelp', hp: 200, burnStacks: 0 },
  ]);
  const [selectedEnemy, setSelectedEnemy] = useState<Enemy | null>(null);
  const [log, setLog] = useState<string[]>([]);

  const useAttack = (effect: DamageEffect) => {
    if (!selectedEnemy) {
      setLog(prev => [...prev, 'No enemy selected!']);
      return;
    }

    const damage = baseDamageMap[effect];
    const burnStacksToAdd = statusEffects.burn.stacksApplied[effect] || 0;

    setEnemies(prev =>
      prev.map(e =>
        e.id === selectedEnemy.id
          ? {
              ...e,
              hp: Math.max(0, e.hp - damage),
              burnStacks: e.burnStacks + burnStacksToAdd,
            }
          : e
      )
    );

    let message = `Used ${capitalize(effect)} on ${selectedEnemy.name} for ${damage} damage.`;
    if (burnStacksToAdd > 0) {
      message += ` Added ${burnStacksToAdd} burn stack${burnStacksToAdd > 1 ? 's' : ''}.`;
    }

    setLog(prev => [...prev, message]);
  };

  const skipTurn = () => {
    // Apply damage over time effects
    let totalDamageDealt = 0;
    let enemiesWithEffects = 0;

    // Calculate effects and create updated enemies array
    const updatedEnemies = enemies.map(enemy => {
      if (enemy.burnStacks > 0) {
        const burnDamage = enemy.burnStacks * statusEffects.burn.damagePerStack;
        enemiesWithEffects++;
        totalDamageDealt += burnDamage;

        // Burn stacks decrease by 1 each turn
        return {
          ...enemy,
          hp: Math.max(0, enemy.hp - burnDamage),
          burnStacks: enemy.burnStacks - 1,
        };
      }
      return enemy;
    });

    // Update the enemies state
    setEnemies(updatedEnemies);

    // Log the results
    if (enemiesWithEffects > 0) {
      setLog(prev => [
        ...prev,
        `Skipped turn. Burn effects dealt ${totalDamageDealt} total damage to ${enemiesWithEffects} enemies.`,
      ]);
    } else {
      setLog(prev => [...prev, 'Skipped turn. No status effects to resolve.']);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
      <EnemyList
        enemies={enemies}
        selected={selectedEnemy}
        onSelect={setSelectedEnemy}
      />
      <div>
        <AttackPanel onAttack={useAttack} />
        <div className="mt-4">
          <button
            onClick={skipTurn}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
          >
            Skip Turn
          </button>
        </div>
      </div>
      <ActionLog log={log} />
    </div>
  );
}

export default App;
