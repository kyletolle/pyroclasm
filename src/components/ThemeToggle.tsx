import { useTheme } from '../context/ThemeContext';

interface Props {
  className?: string;
}

export function ThemeToggle({ className = '' }: Props) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-full transition-colors ${className} ${
        isDark
          ? 'bg-gray-800 text-yellow-300 hover:bg-gray-700'
          : 'bg-blue-100 text-gray-800 hover:bg-blue-200'
      }`}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className="text-xl">
        {isDark ? '🌞' : '🌜'}
      </span>
    </button>
  );
}
