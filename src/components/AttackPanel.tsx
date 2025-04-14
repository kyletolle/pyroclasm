import { DamageEffect, DerivativeType } from '../game/models/DamageEffect';
import { useTheme } from '../context/ThemeContext';
import { capitalize } from '../utils';
import { Enemy } from '../game/models/Enemy';

interface Props {
  onAttack: (effect: DamageEffect) => void;
  selectedEnemy: Enemy | null;
}

export function AttackPanel({ onAttack, selectedEnemy }: Props) {
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
      description: 'Damage over time effect from fire (velocity)',
      emoji: '🔥',
    },
    {
      name: DerivativeType.SCORCH,
      description:
        'Accelerates burn damage (acceleration - 15% chance per burn stack)',
      emoji: '🔥🔥',
    },
    {
      name: DerivativeType.INFERNO,
      description:
        'Accelerates scorch and spreads burns (inferno - 10% chance per scorch level)',
      emoji: '⚡',
    },
    {
      name: DerivativeType.PYROCLASM,
      description:
        'Cataclysmic effect that engulfs all enemies (special case - 2% chance per burn stack)',
      emoji: '🌋',
    },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Attack</h2>

      <div className="grid grid-cols-1 gap-2">
        <button
          onClick={() => onAttack('fire')}
          disabled={!selectedEnemy}
          className={`py-2 px-4 rounded ${
            isDark
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-red-500 hover:bg-red-600 text-white'
          } transition-colors ${
            !selectedEnemy ? 'opacity-50 cursor-not-allowed' : ''
          }`}
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
