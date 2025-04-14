import { useTheme } from '../context/ThemeContext';
import { useEffect, useRef } from 'react';

interface Props {
  log: string[];
  onClear: () => void; // Added prop for clearing the log
}

export default function ActionLog({ log, onClear }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const logContainerRef = useRef<HTMLUListElement>(null);

  // Auto-scroll to bottom when log updates
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [log]);

  return (
    <div className="col-span-full mt-6">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold">Action Log</h2>
        <button
          onClick={onClear}
          className={`text-sm px-3 py-1 rounded ${
            isDark 
              ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          }`}
          title="Clear the action log"
        >
          Clear Log
        </button>
      </div>
      <ul
        ref={logContainerRef}
        className={`space-y-1 p-3 rounded h-48 overflow-y-auto ${
          isDark ? 'bg-gray-800' : 'bg-gray-100'
        }`}
      >
        {log.length === 0 ? (
          <li className={`text-sm italic ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            No actions recorded yet
          </li>
        ) : (
          log.map((entry, i) => (
            <li
              key={i}
              className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
            >
              {entry}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
