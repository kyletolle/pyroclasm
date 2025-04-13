import { useTheme } from '../context/ThemeContext';
import { Enemy } from '../game/models/Enemy';

interface Props {
  enemies: Enemy[];
  selected: Enemy | null;
  onSelect: (e: Enemy) => void;
}

export function EnemyList({ enemies, selected, onSelect }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Enemies</h2>
      <ul className="space-y-2">
        {enemies.map(enemy => (
          <li
            key={enemy.id}
            className={`p-2 border rounded ${enemy.isDead ? 'cursor-default opacity-70' : 'cursor-pointer'} ${
              selected?.id === enemy.id && !enemy.isDead
                ? isDark
                  ? 'bg-red-900 border-red-500'
                  : 'bg-red-200 border-red-500'
                : enemy.isDead
                  ? isDark
                    ? 'bg-gray-900 border-gray-700'
                    : 'bg-gray-100 border-gray-400'
                  : isDark
                    ? 'bg-gray-800 border-gray-700'
                    : 'bg-white border-gray-300'
            }`}
            onClick={() => !enemy.isDead && onSelect(enemy)}
          >
            <div className="flex justify-between items-center">
              <div>
                {enemy.name}{' '}
                {enemy.isDead ? (
                  <span className="font-bold">💀 Defeated</span>
                ) : (
                  <span>(HP: {enemy.hp})</span>
                )}
              </div>
              {enemy.burnStacks > 0 && !enemy.isDead && (
                <span
                  className={`ml-2 ${isDark ? 'text-orange-400' : 'text-orange-600'}`}
                >
                  🔥 {enemy.burnStacks}
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
