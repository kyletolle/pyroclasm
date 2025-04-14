import { useState, useEffect } from 'react';
import { EnemyList } from './components/EnemyList';
import { AttackPanel } from './components/AttackPanel';
import ActionLog from './components/ActionLog';
import { ThemeToggle } from './components/ThemeToggle';
import { AutoTicker } from './components/AutoTicker';
import { WaveControls } from './components/WaveControls';
import { useTheme } from './context/ThemeContext';
import {
  type Enemy,
  type DamageEffect,
  applyAttack,
  skipTurn,
  createInitialEnemies,
  areAllEnemiesDefeated,
  spawnNextWave,
  spawnRandomEnemy,
} from './game';

function App() {
  // Initialize game state with enemies from our service
  const [enemies, setEnemies] = useState<Enemy[]>(createInitialEnemies());
  const [selectedEnemy, setSelectedEnemy] = useState<Enemy | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [autoTickEnabled, setAutoTickEnabled] = useState<boolean>(true); // Auto-tick enabled by default
  const [tickSpeed, setTickSpeed] = useState<number>(1000); // milliseconds
  const [waveNumber, setWaveNumber] = useState<number>(1); // Track the current wave
  const [autoSpawnWaves, setAutoSpawnWaves] = useState<boolean>(true); // Auto-spawn new waves by default
  const { theme } = useTheme();

  // Function to select enemy with highest health
  const selectHighestHealthEnemy = (enemyList: Enemy[]) => {
    const livingEnemies = enemyList.filter(e => !e.isDead);
    if (livingEnemies.length === 0) return null;

    // Find the enemy with the highest HP
    const highestHealthEnemy = livingEnemies.reduce(
      (highest, enemy) => (enemy.hp > highest.hp ? enemy : highest),
      livingEnemies[0]
    );

    return highestHealthEnemy;
  };

  // Auto-select highest health enemy on initial load
  useEffect(() => {
    if (!selectedEnemy) {
      setSelectedEnemy(selectHighestHealthEnemy(enemies));
    }
  }, []); // Only run once on initial load

  // Check if all enemies are defeated
  const allEnemiesDefeated = areAllEnemiesDefeated(enemies);

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

        // Add effect messages (for derivative system)
        if (result.effectMessages.length > 0) {
          setLog(prev => [...prev, ...result.effectMessages]);
        }

        // Auto-select another enemy if the selected enemy died
        if (
          selectedEnemy &&
          result.updatedEnemies.find(e => e.id === selectedEnemy.id)?.isDead
        ) {
          const newSelected = selectHighestHealthEnemy(result.updatedEnemies);
          setSelectedEnemy(newSelected);
        }

        // Check if all enemies are defeated after this turn
        const allDefeated = areAllEnemiesDefeated(result.updatedEnemies);
        if (allDefeated && autoSpawnWaves) {
          handleNextWave();
        }
      }, tickSpeed);
    }

    // Cleanup function to clear interval when component unmounts or autoTickEnabled changes
    return () => {
      if (intervalId !== null) {
        clearInterval(intervalId);
      }
    };
  }, [autoTickEnabled, tickSpeed, enemies, selectedEnemy, autoSpawnWaves]); // Re-run effect when these dependencies change

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

      // Auto-select another enemy if the selected enemy died
      if (
        selectedEnemy &&
        result.updatedEnemies.find(e => e.id === selectedEnemy.id)?.isDead
      ) {
        const newSelected = selectHighestHealthEnemy(result.updatedEnemies);
        setSelectedEnemy(newSelected);
      }
    }

    // Add effect messages from derivative effects
    if (result.effectMessages && result.effectMessages.length > 0) {
      setLog(prev => [...prev, ...result.effectMessages]);
    }

    // Check if all enemies are defeated after this attack
    const allDefeated = areAllEnemiesDefeated(result.updatedEnemies);
    if (allDefeated && autoSpawnWaves) {
      handleNextWave();
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

  // Handler for spawning next wave
  const handleNextWave = () => {
    const { enemies: newEnemies, waveNumber: newWaveNumber } = spawnNextWave();
    setEnemies(newEnemies);
    setWaveNumber(newWaveNumber);
    setLog(prev => [...prev, `Wave ${newWaveNumber} has arrived!`]);

    // Auto-select enemy with highest health in the new wave
    const newSelected = selectHighestHealthEnemy(newEnemies);
    setSelectedEnemy(newSelected);
  };

  // Handler for manually adding a single random enemy
  const handleAddEnemy = () => {
    const newEnemy = spawnRandomEnemy();
    const updatedEnemies = [...enemies, newEnemy];
    setEnemies(updatedEnemies);
    setLog(prev => [...prev, `A ${newEnemy.name} has appeared!`]);

    // If no enemy is currently selected, select the newly spawned one
    if (!selectedEnemy) {
      setSelectedEnemy(newEnemy);
    }
  };

  // Handler for toggling auto-spawn waves setting
  const toggleAutoSpawnWaves = () => {
    setAutoSpawnWaves(prev => !prev);
  };

  // Handler for clearing the action log
  const handleClearLog = () => {
    setLog([]);
  };

  // Handler for processing a single turn manually
  const handleManualTick = () => {
    // Process a single turn using the skipTurn function
    const result = skipTurn(enemies);
    setEnemies(result.updatedEnemies);

    // Add messages to the log
    if (result.enemiesAffected > 0) {
      setLog(prev => [...prev, result.message]);
    }

    if (result.deathMessages.length > 0) {
      setLog(prev => [...prev, ...result.deathMessages]);
    }

    if (result.effectMessages.length > 0) {
      setLog(prev => [...prev, ...result.effectMessages]);
    }

    // Auto-select another enemy if the selected enemy died
    if (
      selectedEnemy &&
      result.updatedEnemies.find(e => e.id === selectedEnemy.id)?.isDead
    ) {
      const newSelected = selectHighestHealthEnemy(result.updatedEnemies);
      setSelectedEnemy(newSelected);
    }

    // Check if all enemies are defeated after this turn
    const allDefeated = areAllEnemiesDefeated(result.updatedEnemies);
    if (allDefeated && autoSpawnWaves) {
      handleNextWave();
    }
  };

  return (
    <div
      className={`w-full min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-black'} flex justify-center`}
    >
      <div className="p-6 max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-6">
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
          <AttackPanel onAttack={handleAttack} selectedEnemy={selectedEnemy} />

          <div className="mt-2">
            <WaveControls
              waveNumber={waveNumber}
              allDefeated={allEnemiesDefeated}
              onNextWave={handleNextWave}
              onAddEnemy={handleAddEnemy}
              autoSpawn={autoSpawnWaves}
              onToggleAutoSpawn={toggleAutoSpawnWaves}
            />
          </div>

          <div className="mt-2">
            <AutoTicker
              isRunning={autoTickEnabled}
              onToggle={toggleAutoTick}
              tickSpeed={tickSpeed}
              onSpeedChange={handleTickSpeedChange}
              onManualTick={handleManualTick} // Add the new prop for manual tick advancement
            />
          </div>
        </div>

        <ActionLog
          log={log}
          onClear={handleClearLog} // Add the new prop for clearing the log
        />
        
        {/* Copyright and credit footer */}
        <footer className="col-span-full mt-8 text-center text-sm border-t pt-4">
          <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            © 2025 Kyle Tolle · <a 
              href="https://kyletolle.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className={`hover:underline ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}
            >
              Vibe crafted by Kyle Tolle
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
