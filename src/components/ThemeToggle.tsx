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
    >
      {isDark ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          className="w-6 h-6"
        >
          {/* Completely different sun design with irregular rays */}
          <circle cx="12" cy="12" r="3.5" />
          {/* Diagonal rays */}
          <line x1="7" y1="7" x2="5" y2="5" strokeLinecap="round" />
          <line x1="17" y1="7" x2="19" y2="5" strokeLinecap="round" />
          <line x1="7" y1="17" x2="5" y2="19" strokeLinecap="round" />
          <line x1="17" y1="17" x2="19" y2="19" strokeLinecap="round" />

          {/* Horizontal and vertical rays with different lengths */}
          <line x1="12" y1="2" x2="12" y2="4.5" strokeLinecap="round" />
          <line x1="12" y1="19.5" x2="12" y2="22" strokeLinecap="round" />
          <line x1="4.5" y1="12" x2="2" y2="12" strokeLinecap="round" />
          <line x1="19.5" y1="12" x2="22" y2="12" strokeLinecap="round" />

          {/* Additional shorter rays for unique appearance */}
          <line x1="9" y1="3.5" x2="8" y2="2.5" strokeLinecap="round" />
          <line x1="15" y1="3.5" x2="16" y2="2.5" strokeLinecap="round" />
          <line x1="3.5" y1="9" x2="2.5" y2="8" strokeLinecap="round" />
          <line x1="20.5" y1="9" x2="21.5" y2="8" strokeLinecap="round" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
          />
        </svg>
      )}
    </button>
  );
}
