import { useTheme } from '../context/ThemeContext';

interface Props {
  log: string[];
}

export default function ActionLog({ log }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="col-span-full mt-6">
      <h2 className="text-xl font-bold mb-2">Action Log</h2>
      <ul
        className={`space-y-1 p-3 rounded h-48 overflow-y-auto ${
          isDark ? 'bg-gray-800' : 'bg-gray-100'
        }`}
      >
        {log.map((entry, i) => (
          <li
            key={i}
            className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
          >
            {entry}
          </li>
        ))}
      </ul>
    </div>
  );
}
