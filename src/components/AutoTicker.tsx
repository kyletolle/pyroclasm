import { useTheme } from '../context/ThemeContext';

interface Props {
  isRunning: boolean;
  onToggle: () => void;
  tickSpeed: number;
  onSpeedChange: (speed: number) => void;
  onManualTick: () => void; // Added prop for manual tick advancement
}

export function AutoTicker({
  isRunning,
  onToggle,
  tickSpeed,
  onSpeedChange,
  onManualTick,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Available tick speed options in milliseconds
  const speedOptions = [
    { value: 10000, label: '0.1x' },
    { value: 4000, label: '0.25x' },
    { value: 2000, label: '0.5x' },
    { value: 1000, label: '1x' },
    { value: 500, label: '2x' },
    { value: 250, label: '4x' },
  ];

  return (
    <div
      className={`flex flex-col gap-2 border rounded p-3 ${
        isDark
          ? 'bg-gray-800 bg-opacity-20 border-gray-700'
          : 'bg-blue-50 border-blue-200'
      }`}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Turn Progression</h2>
        <button
          onClick={onToggle}
          className={`px-4 py-1 rounded font-medium ${
            isRunning
              ? isDark
                ? 'bg-red-700 hover:bg-red-800 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
              : isDark
                ? 'bg-green-700 hover:bg-green-800 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {isRunning ? 'Pause' : 'Resume'}
        </button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm">Speed:</span>
        <div className="grid grid-cols-3 gap-1">
          {speedOptions.map(option => (
            <button
              key={option.value}
              onClick={() => onSpeedChange(option.value)}
              className={`px-2 py-1 text-xs rounded ${
                tickSpeed === option.value
                  ? isDark
                    ? 'bg-blue-700 text-white'
                    : 'bg-blue-600 text-white'
                  : isDark
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {isRunning ? (
        <div className="mt-1 flex items-center">
          <div className="animate-pulse mr-2 w-2 h-2 bg-orange-500 rounded-full"></div>
          <span className="text-sm">
            Processing turns every {tickSpeed / 1000} seconds
          </span>
        </div>
      ) : (
        <div className="mt-2 flex items-center justify-between">
          <span
            className={`text-sm ${isDark ? 'text-amber-400' : 'text-amber-700'}`}
          >
            Turn processing paused
          </span>
          <button
            onClick={onManualTick}
            className={`px-3 py-1 rounded text-sm font-medium ${
              isDark
                ? 'bg-blue-700 hover:bg-blue-800 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
            title="Process a single turn manually"
          >
            Next Turn →
          </button>
        </div>
      )}
    </div>
  );
}
