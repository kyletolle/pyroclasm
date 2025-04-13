import { useState } from 'react';
import { EnemyList } from './components/EnemyList';
import { AttackPanel } from './components/AttackPanel';
import ActionLog from './components/ActionLog';
import { ThemeToggle } from './components/ThemeToggle';
import { useTheme } from './context/ThemeContext';
import {
  type Enemy,
  type DamageEffect,
  applyAttack,
  skipTurn,
  createInitialEnemies,
} from './game';

function App() {
  // Initialize game state with enemies from our service
  const [enemies, setEnemies] = useState<Enemy[]>(createInitialEnemies());
  const [selectedEnemy, setSelectedEnemy] = useState<Enemy | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const { theme } = useTheme();

  const handleAttack = (effect: DamageEffect) => {
    // Use our combat service to handle the attack
    const result = applyAttack(enemies, selectedEnemy, effect);

    // Update state with the result
    setEnemies(result.updatedEnemies);
    setLog(prev => [...prev, result.message]);
  };

  const handleSkipTurn = () => {
    // Use our combat service to process the turn skip
    const result = skipTurn(enemies);

    // Update state with the result
    setEnemies(result.updatedEnemies);
    setLog(prev => [...prev, result.message]);
  };

  return (
    <div
      className={`w-full min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}
    >
      <div className="p-6 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex justify-between items-center col-span-1 md:col-span-2">
          <h1 className="text-2xl font-bold">Pyroclasm</h1>
          <ThemeToggle />
        </div>

        <EnemyList
          enemies={enemies}
          selected={selectedEnemy}
          onSelect={setSelectedEnemy}
        />
        <div>
          <AttackPanel onAttack={handleAttack} />
          <div className="mt-4">
            <button
              onClick={handleSkipTurn}
              className={`w-full px-4 py-2 rounded ${
                theme === 'dark'
                  ? 'bg-gray-700 hover:bg-gray-800 text-white'
                  : 'bg-gray-600 hover:bg-gray-700 text-white'
              }`}
            >
              Skip Turn
            </button>
          </div>
        </div>
        <ActionLog log={log} />
      </div>
    </div>
  );
}

export default App;
