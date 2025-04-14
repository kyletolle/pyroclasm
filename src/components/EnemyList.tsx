import { useTheme } from '../context/ThemeContext';
import { Enemy } from '../game/models/Enemy';
import { useEffect, useRef, useState } from 'react';

interface Props {
  enemies: Enemy[];
  selected: Enemy | null;
  onSelect: (e: Enemy) => void;
}

export function EnemyList({ enemies, selected, onSelect }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const listRef = useRef<HTMLUListElement>(null);

  // Store previous health values for animations
  const [prevHealthValues, setPrevHealthValues] = useState<
    Record<number, number>
  >({});

  // Toggle between health bar styles (false = linear bar, true = pie chart)
  const [usePieChart, setUsePieChart] = useState<boolean>(false);

  // Update previous health values when enemies change
  useEffect(() => {
    const newHealthValues: Record<number, number> = {};

    enemies.forEach(enemy => {
      // If we already have a previous value, keep it; otherwise use current health
      if (prevHealthValues[enemy.id] === undefined) {
        newHealthValues[enemy.id] = enemy.hp;
      } else {
        newHealthValues[enemy.id] = prevHealthValues[enemy.id];
      }
    });

    setPrevHealthValues(newHealthValues);

    // After animation duration, update previous values to current
    const timeoutId = setTimeout(() => {
      const updatedValues: Record<number, number> = {};
      enemies.forEach(enemy => {
        updatedValues[enemy.id] = enemy.hp;
      });
      setPrevHealthValues(updatedValues);
    }, 500); // Match animation duration

    return () => clearTimeout(timeoutId);
  }, [enemies]);

  // Get health color based on percentage
  const getHealthColor = (percentage: number): string => {
    if (percentage > 60) {
      return 'var(--health-high)';
    } else if (percentage > 25) {
      return 'var(--health-medium)';
    } else {
      return 'var(--health-low)';
    }
  };

  // Get tier-specific styling for enemies
  const getTierStyles = (enemy: Enemy) => {
    // Base styles that apply to all tiers
    const baseStyles = {
      border: '',
      background: '',
      icon: '',
      ringColor: '', // Added for ring pulse color
      extraClasses: '', // For additional custom styling
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
        ringColor: isDark
          ? 'rgba(249, 115, 22, 0.7)'
          : 'rgba(249, 115, 22, 0.7)', // orange
      };
    }

    switch (enemy.tier) {
      case 'fodder':
        return {
          ...baseStyles,
          border: isDark ? 'border-gray-600' : 'border-gray-300',
          background: '',
          icon: '👤',
          ringColor: isDark
            ? 'rgba(156, 163, 175, 0.7)'
            : 'rgba(156, 163, 175, 0.7)', // gray
        };
      case 'medium':
        return {
          ...baseStyles,
          border: isDark ? 'border-blue-700' : 'border-blue-300',
          background: isDark ? 'bg-blue-900 bg-opacity-20' : 'bg-blue-50',
          icon: '🛡️',
          ringColor: isDark
            ? 'rgba(59, 130, 246, 0.7)'
            : 'rgba(59, 130, 246, 0.7)', // blue
        };
      case 'elite':
        return {
          ...baseStyles,
          border: isDark
            ? 'border-purple-400 border-2' // Lighter purple border in dark mode
            : 'border-purple-500',
          background: isDark
            ? 'bg-purple-800 bg-opacity-30' // More vibrant background
            : 'bg-purple-50',
          icon: '⚔️',
          ringColor: isDark
            ? 'rgba(216, 180, 254, 0.9)' // Much brighter, more saturated purple for dark mode
            : 'rgba(168, 85, 247, 0.7)', // Regular purple for light mode
          extraClasses: isDark ? 'shadow-[0_0_8px_rgba(192,132,252,0.4)]' : '', // Subtle purple glow in dark mode
        };
      case 'boss':
        return {
          ...baseStyles,
          border: isDark
            ? 'border-red-700 border-2'
            : 'border-red-500 border-2',
          background: isDark ? 'bg-red-900 bg-opacity-30' : 'bg-red-50',
          icon: '👑',
          ringColor: isDark
            ? 'rgba(239, 68, 68, 0.7)'
            : 'rgba(239, 68, 68, 0.7)', // red
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

  // Keyboard navigation handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selected || enemies.length === 0) return;

      const livingEnemies = enemies.filter(e => !e.isDead);
      if (livingEnemies.length === 0) return;

      const currentIndex = livingEnemies.findIndex(
        enemy => enemy.id === selected.id
      );
      let nextIndex = currentIndex;

      switch (e.key) {
        case 'ArrowUp':
        case 'ArrowLeft':
          nextIndex =
            currentIndex > 0 ? currentIndex - 1 : livingEnemies.length - 1;
          break;
        case 'ArrowDown':
        case 'ArrowRight':
          nextIndex =
            currentIndex < livingEnemies.length - 1 ? currentIndex + 1 : 0;
          break;
        default:
          return;
      }

      if (nextIndex !== currentIndex) {
        e.preventDefault();
        onSelect(livingEnemies[nextIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enemies, selected, onSelect]);

  // Scroll selected enemy into view
  useEffect(() => {
    if (selected && listRef.current) {
      const selectedElement = listRef.current.querySelector(
        `[data-enemy-id="${selected.id}"]`
      );
      selectedElement?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selected]);

  // Linear health bar component
  const LinearHealthBar = ({ enemy }: { enemy: Enemy }) => {
    if (enemy.isDead) return null;

    const healthPercentage = Math.max(
      0,
      Math.min(100, (enemy.hp / enemy.maxHp) * 100)
    );
    const prevPercentage = prevHealthValues[enemy.id]
      ? Math.max(
          0,
          Math.min(100, (prevHealthValues[enemy.id] / enemy.maxHp) * 100)
        )
      : healthPercentage;

    // Determine if we need animation
    const needsAnimation = prevPercentage !== healthPercentage;
    const barColor = getHealthColor(healthPercentage);

    const barStyle = {
      width: `${healthPercentage}%`,
      backgroundColor: barColor,
      '--prev-width': `${prevPercentage}%`,
      '--current-width': `${healthPercentage}%`,
    } as React.CSSProperties;

    return (
      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-2 overflow-hidden">
        <div
          className={`h-full ${needsAnimation ? 'animate-health-change' : 'health-bar-fill'}`}
          style={barStyle}
        ></div>
        <div className="text-xs text-center mt-1">
          {enemy.hp}/{enemy.maxHp} ({Math.round(healthPercentage)}%)
        </div>
      </div>
    );
  };

  // Pie chart health component
  const PieChartHealth = ({ enemy }: { enemy: Enemy }) => {
    if (enemy.isDead) return null;

    const healthPercentage = Math.max(
      0,
      Math.min(100, (enemy.hp / enemy.maxHp) * 100)
    );
    const prevPercentage = prevHealthValues[enemy.id]
      ? Math.max(
          0,
          Math.min(100, (prevHealthValues[enemy.id] / enemy.maxHp) * 100)
        )
      : healthPercentage;

    // Determine if we need animation
    const needsAnimation = prevPercentage !== healthPercentage;
    const pieColor = getHealthColor(healthPercentage);

    const pieStyle = {
      color: pieColor,
      '--p': healthPercentage,
      '--prev-percentage': prevPercentage,
      '--current-percentage': healthPercentage,
    } as React.CSSProperties;

    return (
      <div className="flex items-center mt-2 justify-between">
        <span
          className={`pie-chart ${needsAnimation ? 'animate-pie-change' : ''}`}
          style={pieStyle}
        ></span>
        <div className="text-xs flex-1 ml-2">
          {enemy.hp}/{enemy.maxHp} ({Math.round(healthPercentage)}%)
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold mb-2">Enemies</h2>
        <button
          onClick={() => setUsePieChart(!usePieChart)}
          className="text-xs py-1 px-2 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          {usePieChart ? 'Use Linear Bar' : 'Use Pie Chart'}
        </button>
      </div>
      <ul ref={listRef} className="space-y-4">
        {enemies.map(enemy => {
          const tierStyles = getTierStyles(enemy);
          const statusEffects = getStatusEffects(enemy);
          const isSelected = selected?.id === enemy.id && !enemy.isDead;

          // Style object for the ring pulse animation with color
          const customRingStyles =
            isSelected && tierStyles.ringColor
              ? ({
                  '--pulse-color': tierStyles.ringColor,
                } as React.CSSProperties)
              : {};

          // Get arrow color based on enemy tier
          const getArrowColor = () => {
            if (enemy.hasPyroclasm) return 'text-yellow-400';

            switch (enemy.tier) {
              case 'fodder':
                return 'text-white';
              case 'medium':
                return 'text-blue-300';
              case 'elite':
                return isDark ? 'text-purple-300' : 'text-purple-500'; // Brighter purple
              case 'boss':
                return 'text-yellow-300';
              default:
                return 'text-white';
            }
          };

          return (
            <li
              key={enemy.id}
              data-enemy-id={enemy.id}
              className={`p-3 border-2 rounded-md ${enemy.isDead ? 'cursor-default opacity-70' : 'cursor-pointer'} ${
                isSelected
                  ? `ring-2 ring-offset-2 ${isSelected && !enemy.isDead ? 'pulse-ring-custom' : ''}`
                  : ''
              } ${
                isSelected
                  ? isDark
                    ? 'bg-red-800 border-red-400 shadow-md shadow-red-900/50'
                    : 'bg-red-100 border-red-500 shadow-md shadow-red-500/30'
                  : `${tierStyles.border} ${tierStyles.background} ${tierStyles.extraClasses || ''}`
              }`}
              onClick={() => !enemy.isDead && onSelect(enemy)}
              style={customRingStyles}
              tabIndex={enemy.isDead ? -1 : 0}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  {/* Indicator arrow with tier-based color */}
                  {isSelected && !enemy.isDead && (
                    <span
                      className={`${getArrowColor()} mr-2 pulse-arrow font-bold`}
                    >
                      ▶
                    </span>
                  )}

                  {!enemy.isDead && tierStyles.icon && (
                    <span
                      className={`mr-2 ${enemy.tier === 'elite' && isDark ? 'text-purple-200' : ''}`}
                      title={`${enemy.tier.charAt(0).toUpperCase() + enemy.tier.slice(1)} enemy`}
                    >
                      {tierStyles.icon}
                    </span>
                  )}

                  <span
                    className={`${enemy.tier === 'elite' && !enemy.isDead && isDark ? 'text-purple-200' : ''}`}
                  >
                    {enemy.name}{' '}
                    {enemy.isDead ? (
                      <span className="font-bold">💀 Defeated</span>
                    ) : (
                      <span></span> // Removed HP text since it's now in the health bar
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

              {/* Health indicators */}
              {!enemy.isDead &&
                (usePieChart ? (
                  <PieChartHealth enemy={enemy} />
                ) : (
                  <LinearHealthBar enemy={enemy} />
                ))}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
