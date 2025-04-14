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

    // If enemy has pyroclasm, override with pyroclasm styling
    if (enemy.hasPyroclasm) {
      return {
        ...baseStyles,
        border: isDark
          ? 'border-orange-700 border-2'
          : 'border-orange-500 border-2',
        background: isDark ? 'bg-red-900 bg-opacity-40' : 'bg-red-100',
        icon: '🌋',
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
          border: isDark
            ? 'border-red-700 border-2'
            : 'border-red-500 border-2',
          background: isDark ? 'bg-red-900 bg-opacity-30' : 'bg-red-50',
          icon: '👑',
        };
      default:
        return baseStyles;
    }
  };

  // Get status effect display info
  const getStatusEffects = (enemy: Enemy) => {
    const effects = [];

    if (enemy.burnStacks > 0) {
      effects.push({
        icon: '🔥',
        value: enemy.burnStacks,
        className: isDark ? 'text-orange-400' : 'text-orange-600',
      });
    }

    if (enemy.scorchLevel > 0) {
      effects.push({
        icon: '🔥🔥',
        value: enemy.scorchLevel,
        className: isDark ? 'text-red-400' : 'text-red-600',
        tooltip: `Scorch Lv${enemy.scorchLevel}: Burn damage increased by ${Math.round((Math.pow(1.5, enemy.scorchLevel) - 1) * 100)}%`,
      });
    }

    if (enemy.infernoLevel > 0) {
      effects.push({
        icon: '⚡',
        value: enemy.infernoLevel,
        className: isDark ? 'text-yellow-400' : 'text-yellow-600',
        tooltip: `Inferno Lv${enemy.infernoLevel}: Scorch effect amplified by ${Math.pow(2, enemy.infernoLevel)}x and burn spreads to other enemies`,
      });
    }

    return effects;
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Enemies</h2>
      <ul className="space-y-2">
        {enemies.map(enemy => {
          const tierStyles = getTierStyles(enemy);
          const statusEffects = getStatusEffects(enemy);
          const isSelected = selected?.id === enemy.id && !enemy.isDead;

          return (
            <li
              key={enemy.id}
              className={`p-2 border rounded ${enemy.isDead ? 'cursor-default opacity-70' : 'cursor-pointer'} ${
                isSelected ? 'ring-2 ring-offset-1 ring-green-500' : ''
              } ${
                isSelected
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
                    <span
                      className="mr-2"
                      title={`${enemy.tier.charAt(0).toUpperCase() + enemy.tier.slice(1)} enemy`}
                    >
                      {tierStyles.icon}
                    </span>
                  )}
                  <span>
                    {isSelected && (
                      <span className="text-green-500 mr-1">▶</span>
                    )}
                    {enemy.name}{' '}
                    {enemy.isDead ? (
                      <span className="font-bold">💀 Defeated</span>
                    ) : (
                      <span>(HP: {enemy.hp})</span>
                    )}
                  </span>
                </div>

                {/* Status effects display */}
                {statusEffects.length > 0 && !enemy.isDead && (
                  <div className="flex gap-2">
                    {statusEffects.map((effect, idx) => (
                      <span
                        key={idx}
                        className={`ml-2 ${effect.className}`}
                        title={effect.tooltip}
                      >
                        {effect.icon} {effect.value}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
