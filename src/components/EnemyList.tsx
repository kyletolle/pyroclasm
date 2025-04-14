import { useTheme } from '../context/ThemeContext';
import { Enemy } from '../game/models/Enemy';
import { useEffect } from 'react';

// CSS keyframes for animations
const pulseRingStyle = `
  @keyframes pulseRing {
    0% {
      box-shadow: 0 0 0 0 rgba(var(--ring-color), 0.7);
    }
    70% {
      box-shadow: 0 0 0 4px rgba(var(--ring-color), 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(var(--ring-color), 0);
    }
  }
`;

const pulseArrowStyle = `
  @keyframes pulseArrow {
    0% {
      opacity: 0.7;
      transform: scale(0.95);
    }
    50% {
      opacity: 1;
      transform: scale(1.05);
    }
    100% {
      opacity: 0.7;
      transform: scale(0.95);
    }
  }
`;

interface Props {
  enemies: Enemy[];
  selected: Enemy | null;
  onSelect: (e: Enemy) => void;
}

export function EnemyList({ enemies, selected, onSelect }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!selected || !enemies.some(e => !e.isDead)) return;

      const aliveEnemies = enemies.filter(e => !e.isDead);
      const currentIndex = aliveEnemies.findIndex(e => e.id === selected.id);

      if (currentIndex === -1) return;

      let newIndex = currentIndex;

      switch (event.key) {
        case 'ArrowDown':
        case 'j':
          newIndex = (currentIndex + 1) % aliveEnemies.length;
          break;
        case 'ArrowUp':
        case 'k':
          newIndex =
            (currentIndex - 1 + aliveEnemies.length) % aliveEnemies.length;
          break;
      }

      if (newIndex !== currentIndex) {
        onSelect(aliveEnemies[newIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selected, enemies, onSelect]);

  // Get tier-specific styling for enemies
  const getTierStyles = (enemy: Enemy) => {
    // Base styles that apply to all tiers
    const baseStyles = {
      border: '',
      background: '',
      icon: '',
      ringColor: '60, 163, 59', // Default green (RGB format for animation)
    };

    if (enemy.isDead) {
      return {
        ...baseStyles,
        border: isDark ? 'border-gray-700' : 'border-gray-400',
        background: isDark ? 'bg-gray-900' : 'bg-gray-100',
        ringColor: '75, 85, 99', // gray
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
        ringColor: '249, 115, 22', // orange
      };
    }

    switch (enemy.tier) {
      case 'fodder':
        return {
          ...baseStyles,
          border: isDark ? 'border-gray-600' : 'border-gray-300',
          background: '',
          icon: '👤',
          ringColor: '107, 114, 128', // gray
        };
      case 'medium':
        return {
          ...baseStyles,
          border: isDark ? 'border-blue-700' : 'border-blue-300',
          background: isDark ? 'bg-blue-900 bg-opacity-20' : 'bg-blue-50',
          icon: '🛡️',
          ringColor: '59, 130, 246', // blue
        };
      case 'elite':
        return {
          ...baseStyles,
          border: isDark ? 'border-purple-700' : 'border-purple-300',
          background: isDark ? 'bg-purple-900 bg-opacity-20' : 'bg-purple-50',
          icon: '⚔️',
          ringColor: '139, 92, 246', // purple
        };
      case 'boss':
        return {
          ...baseStyles,
          border: isDark
            ? 'border-red-700 border-2'
            : 'border-red-500 border-2',
          background: isDark ? 'bg-red-900 bg-opacity-30' : 'bg-red-50',
          icon: '👑',
          ringColor: '239, 68, 68', // red
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
    <>
      <style>{pulseRingStyle}</style>
      <style>{pulseArrowStyle}</style>
      <div>
        <h2 className="text-xl font-bold mb-2">Enemies</h2>
        <ul className="space-y-2" role="listbox" aria-label="Enemy list">
          {enemies.map(enemy => {
            const tierStyles = getTierStyles(enemy);
            const statusEffects = getStatusEffects(enemy);
            const isSelected = selected?.id === enemy.id && !enemy.isDead;

            return (
              <li
                key={enemy.id}
                className={`p-2 border rounded ${enemy.isDead ? 'cursor-default opacity-70' : 'cursor-pointer'} ${
                  isSelected ? `ring-2 ring-offset-1` : ''
                } ${
                  isSelected
                    ? isDark
                      ? 'bg-red-900 border-red-500'
                      : 'bg-red-200 border-red-500'
                    : `${tierStyles.border} ${tierStyles.background}`
                }`}
                onClick={() => !enemy.isDead && onSelect(enemy)}
                role="option"
                aria-selected={isSelected}
                style={
                  isSelected
                    ? ({
                        '--ring-color': tierStyles.ringColor,
                        animation:
                          'pulseRing 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite',
                      } as React.CSSProperties)
                    : undefined
                }
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    {isSelected && (
                      <span
                        className="text-green-500 mr-2"
                        style={{
                          animation: 'pulseArrow 1.5s ease-in-out infinite',
                          display: 'inline-block',
                        }}
                      >
                        ▶
                      </span>
                    )}
                    {!enemy.isDead && tierStyles.icon && (
                      <span
                        className="mr-2"
                        title={`${enemy.tier.charAt(0).toUpperCase() + enemy.tier.slice(1)} enemy`}
                      >
                        {tierStyles.icon}
                      </span>
                    )}
                    <span>
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
    </>
  );
}
