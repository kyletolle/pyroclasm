import { useTheme } from '../context/ThemeContext';

interface Props {
  waveNumber: number;
  allDefeated: boolean;
  onNextWave: () => void;
  onAddEnemy: () => void;
  autoSpawn: boolean;
  onToggleAutoSpawn: () => void;
}

export function WaveControls({
  waveNumber,
  allDefeated,
  onNextWave,
  onAddEnemy,
  autoSpawn,
  onToggleAutoSpawn,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div
      className={`flex flex-col gap-2 border rounded p-3 ${
        isDark
          ? 'bg-gray-800 bg-opacity-20 border-gray-700'
          : 'bg-blue-50 border-blue-200'
      }`}
    >
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Wave {waveNumber}</h2>
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="auto-spawn"
              checked={autoSpawn}
              onChange={onToggleAutoSpawn}
              className="mr-2"
            />
            <label htmlFor="auto-spawn" className="text-sm">
              Auto-spawn waves
            </label>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onNextWave}
          disabled={!allDefeated && autoSpawn}
          className={`flex-1 px-3 py-2 rounded text-white font-medium ${
            allDefeated
              ? isDark
                ? 'bg-purple-700 hover:bg-purple-800'
                : 'bg-purple-600 hover:bg-purple-700'
              : 'bg-gray-500 opacity-50 cursor-not-allowed'
          }`}
          title={
            !allDefeated && autoSpawn
              ? 'Next wave will spawn automatically when all enemies are defeated'
              : ''
          }
        >
          {allDefeated ? 'Spawn Next Wave' : 'Defeat all enemies first'}
        </button>

        <button
          onClick={onAddEnemy}
          className={`px-3 py-2 rounded text-white font-medium ${
            isDark
              ? 'bg-blue-700 hover:bg-blue-800'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          + Add Enemy
        </button>
      </div>

      {allDefeated && (
        <div className="mt-1 text-center text-sm font-medium text-green-600 dark:text-green-400">
          All enemies defeated! Ready for next wave.
        </div>
      )}
    </div>
  );
}
