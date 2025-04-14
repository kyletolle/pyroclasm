import { DamageEffect, DerivativeType } from '../game/models/DamageEffect';
import { useTheme } from '../context/ThemeContext';
import { capitalize } from '../utils';

interface Props {
  onAttack: (effect: DamageEffect) => void;
}

export function AttackPanel({ onAttack }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Display information about derivative damage system
  const derivativeInfo = [
    {
      name: DerivativeType.DIRECT,
      description: 'Direct damage from fire attack',
      emoji: '🔥',
    },
    {
      name: DerivativeType.BURN,
      description: 'Damage over time effect from fire',
      emoji: '🔥',
    },
    {
      name: DerivativeType.SCORCH,
      description: 'Accelerates burn damage (15% chance per burn stack)',
      emoji: '🔥🔥',
    },
    {
      name: DerivativeType.JERK,
      description:
        'Accelerates scorch and spreads burns (10% chance per scorch level)',
      emoji: '⚡',
    },
    {
      name: DerivativeType.PYROCLASM,
      description:
        'Cataclysmic effect that engulfs all enemies (2% chance per burn stack)',
      emoji: '🌋',
    },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Attack</h2>

      <div className="grid grid-cols-1 gap-2">
        <button
          onClick={() => onAttack('fire')}
          className={`py-2 px-4 rounded ${
            isDark
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-red-500 hover:bg-red-600 text-white'
          } transition-colors`}
        >
          {capitalize('fire')} 🔥
        </button>
      </div>

      {/* Derivative damage info panel */}
      <div
        className={`mt-4 p-2 rounded ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}
      >
        <h3 className="font-semibold mb-1">Derivative Damage System</h3>
        <ul className="text-sm">
          {derivativeInfo.map((info, index) => (
            <li key={index} className="mb-1 flex gap-1 items-start">
              <span className="mr-1">{info.emoji}</span>
              <div>
                <span className="font-semibold">{capitalize(info.name)}:</span>{' '}
                <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                  {info.description}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
