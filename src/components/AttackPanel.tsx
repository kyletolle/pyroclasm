import { DamageEffect, DerivativeType } from '../game/models/DamageEffect';
import { useTheme } from '../context/ThemeContext';
import { capitalize } from '../utils';
import { Enemy } from '../game/models/Enemy';
import { BASE_DAMAGE, STATUS_EFFECTS } from '../game/constants/DamageValues';

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
      emoji: '🔆',
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
        'Cataclysmic effect that engulfs all enemies (special case - 0.5% chance per burn stack)',
      emoji: '🌋',
    },
  ];

  // Attack types information
  const attackTypes = [
    {
      type: 'fire' as DamageEffect,
      name: 'Fire',
      description: 'Balanced attack with medium damage and burn',
      damage: BASE_DAMAGE.fire,
      burn: STATUS_EFFECTS.burn.stacksApplied.fire,
      emoji: '🔥',
      color: isDark
        ? 'bg-red-600 hover:bg-red-700'
        : 'bg-red-500 hover:bg-red-600',
    },
    {
      type: 'fireBolt' as DamageEffect,
      name: 'Fire Bolt',
      description: 'High damage single-target attack with medium burn',
      damage: BASE_DAMAGE.fireBolt,
      burn: STATUS_EFFECTS.burn.stacksApplied.fireBolt,
      emoji: '⚡🔥',
      color: isDark
        ? 'bg-orange-600 hover:bg-orange-700'
        : 'bg-orange-500 hover:bg-orange-600',
    },
    {
      type: 'flameWave' as DamageEffect,
      name: 'Flame Wave',
      description: 'Hits all enemies with low damage but high burn',
      damage: BASE_DAMAGE.flameWave,
      burn: STATUS_EFFECTS.burn.stacksApplied.flameWave,
      emoji: '〰️🔥',
      color: isDark
        ? 'bg-amber-600 hover:bg-amber-700'
        : 'bg-amber-500 hover:bg-amber-600',
    },
    {
      type: 'emberSpark' as DamageEffect,
      name: 'Ember Spark',
      description: 'Minimal damage but very high burn stacks',
      damage: BASE_DAMAGE.emberSpark,
      burn: STATUS_EFFECTS.burn.stacksApplied.emberSpark,
      emoji: '✨🔥',
      color: isDark
        ? 'bg-yellow-600 hover:bg-yellow-700'
        : 'bg-yellow-500 hover:bg-yellow-600',
    },
    {
      type: 'heatIntensify' as DamageEffect,
      name: 'Heat Intensify',
      description: 'Doubles the burn stacks on a target',
      damage: BASE_DAMAGE.heatIntensify,
      burn: 'x2',
      emoji: '🔆',
      color: isDark
        ? 'bg-red-700 hover:bg-red-800'
        : 'bg-red-600 hover:bg-red-700',
    },
    {
      type: 'combustion' as DamageEffect,
      name: 'Combustion',
      description: 'Converts half of burn stacks to immediate damage',
      damage: '?',
      burn: '÷2',
      emoji: '💥',
      color: isDark
        ? 'bg-purple-600 hover:bg-purple-700'
        : 'bg-purple-500 hover:bg-purple-600',
    },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Attack</h2>

      <div className="grid grid-cols-2 gap-2">
        {attackTypes.map(attack => (
          <button
            key={attack.type}
            onClick={() => onAttack(attack.type)}
            disabled={!selectedEnemy && attack.type !== 'flameWave'}
            className={`py-2 px-3 rounded text-white ${attack.color} transition-colors ${
              !selectedEnemy && attack.type !== 'flameWave'
                ? 'opacity-50 cursor-not-allowed'
                : ''
            }`}
            title={`${attack.name}: ${attack.description}`}
          >
            <div className="flex flex-col items-center">
              <span>
                {attack.name} {attack.emoji}
              </span>
              <span className="text-xs">
                {typeof attack.damage === 'number'
                  ? `${attack.damage} dmg`
                  : attack.damage}
                ,
                {typeof attack.burn === 'number'
                  ? `${attack.burn} burn`
                  : attack.burn}
              </span>
            </div>
          </button>
        ))}
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
