import { useState, useEffect } from 'react';
import { EnemyList } from './components/EnemyList';
import { AttackPanel } from './components/AttackPanel';
import ActionLog from './components/ActionLog';
import { ThemeToggle } from './components/ThemeToggle';
import { AutoTicker } from './components/AutoTicker';
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
  const [autoTickEnabled, setAutoTickEnabled] = useState<boolean>(true); // Auto-tick enabled by default
  const [tickSpeed, setTickSpeed] = useState<number>(1000); // milliseconds
  const { theme } = useTheme();

  // Auto-ticker interval effect
  useEffect(() => {
    let intervalId: number | null = null;

    if (autoTickEnabled) {
      intervalId = window.setInterval(() => {
        // Process a turn tick
        const result = skipTurn(enemies);
        setEnemies(result.updatedEnemies);

        // Add turn message if any effects were applied
        if (result.enemiesAffected > 0) {
          setLog(prev => [...prev, result.message]);
        }

        // Add death messages if any enemies died this turn
        if (result.deathMessages.length > 0) {
          setLog(prev => [...prev, ...result.deathMessages]);
        }

        // Clear selection if the selected enemy died
        if (
          selectedEnemy &&
          result.updatedEnemies.find(e => e.id === selectedEnemy.id)?.isDead
        ) {
          setSelectedEnemy(null);
        }
      }, tickSpeed);
    }

    // Cleanup function to clear interval when component unmounts or autoTickEnabled changes
    return () => {
      if (intervalId !== null) {
        clearInterval(intervalId);
      }
    };
  }, [autoTickEnabled, tickSpeed, enemies, selectedEnemy]); // Re-run effect when these dependencies change

  const handleAttack = (effect: DamageEffect) => {
    // Use our combat service to handle the attack
    const result = applyAttack(enemies, selectedEnemy, effect);

    // Update state with the result
    setEnemies(result.updatedEnemies);

    // Add attack message
    setLog(prev => [...prev, result.message]);

    // Add death messages if any enemies died from this attack
    if (result.deathMessages.length > 0) {
      setLog(prev => [...prev, ...result.deathMessages]);

      // Clear selection if the selected enemy died
      if (
        selectedEnemy &&
        result.updatedEnemies.find(e => e.id === selectedEnemy.id)?.isDead
      ) {
        setSelectedEnemy(null);
      }
    }

    // Ensure auto-tick is enabled when an attack is made
    if (!autoTickEnabled) {
      setAutoTickEnabled(true);
    }
  };

  const toggleAutoTick = () => {
    setAutoTickEnabled(prev => !prev);
  };

  const handleTickSpeedChange = (speed: number) => {
    setTickSpeed(speed);
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

        <div className="flex flex-col gap-4">
          <AttackPanel onAttack={handleAttack} />

          <div className="mt-2">
            <AutoTicker
              isRunning={autoTickEnabled}
              onToggle={toggleAutoTick}
              tickSpeed={tickSpeed}
              onSpeedChange={handleTickSpeedChange}
            />
          </div>
        </div>

        <ActionLog log={log} />
      </div>
    </div>
  );
}

export default App;
