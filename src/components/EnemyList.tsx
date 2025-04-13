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

  // Get tier-specific styling for enemies
  const getTierStyles = (enemy: Enemy) => {
    // Base styles that apply to all tiers
    const baseStyles = {
      border: '',
      background: '',
      icon: '',
    };
    
    if (enemy.isDead) {
      return {
        ...baseStyles,
        border: isDark ? 'border-gray-700' : 'border-gray-400',
        background: isDark ? 'bg-gray-900' : 'bg-gray-100',
      };
    }
    
    switch (enemy.tier) {
      case 'fodder':
        return {
          ...baseStyles,
          border: isDark ? 'border-gray-600' : 'border-gray-300',
          background: '',
          icon: '👤',
        };
      case 'medium':
        return {
          ...baseStyles,
          border: isDark ? 'border-blue-700' : 'border-blue-300',
          background: isDark ? 'bg-blue-900 bg-opacity-20' : 'bg-blue-50',
          icon: '🛡️',
        };
      case 'elite':
        return {
          ...baseStyles,
          border: isDark ? 'border-purple-700' : 'border-purple-300',
          background: isDark ? 'bg-purple-900 bg-opacity-20' : 'bg-purple-50',
          icon: '⚔️',
        };
      case 'boss':
        return {
          ...baseStyles,
          border: isDark ? 'border-red-700 border-2' : 'border-red-500 border-2',
          background: isDark ? 'bg-red-900 bg-opacity-30' : 'bg-red-50',
          icon: '👑',
        };
      default:
        return baseStyles;
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Enemies</h2>
      <ul className="space-y-2">
        {enemies.map(enemy => {
          const tierStyles = getTierStyles(enemy);
          
          return (
            <li
              key={enemy.id}
              className={`p-2 border rounded ${enemy.isDead ? 'cursor-default opacity-70' : 'cursor-pointer'} ${
                selected?.id === enemy.id && !enemy.isDead
                  ? isDark
                    ? 'bg-red-900 border-red-500'
                    : 'bg-red-200 border-red-500'
                  : `${tierStyles.border} ${tierStyles.background}`
              }`}
              onClick={() => !enemy.isDead && onSelect(enemy)}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  {!enemy.isDead && tierStyles.icon && (
                    <span className="mr-2" title={`${enemy.tier.charAt(0).toUpperCase() + enemy.tier.slice(1)} enemy`}>
                      {tierStyles.icon}
                    </span>
                  )}
                  <span>
                    {enemy.name} {enemy.isDead ? (
                      <span className="font-bold">💀 Defeated</span>
                    ) : (
                      <span>(HP: {enemy.hp})</span>
                    )}
                  </span>
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
          );
        })}
      </ul>
    </div>
  );
}
