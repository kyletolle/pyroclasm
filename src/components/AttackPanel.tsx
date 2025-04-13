import { capitalize } from '../utils';

export type DamageEffect = 'fire' | 'burn' | 'scorch' | 'inferno' | 'pyroclasm';

const effects: DamageEffect[] = [
  'fire',
  'burn',
  'scorch',
  'inferno',
  'pyroclasm',
];

interface Props {
  onAttack: (e: DamageEffect) => void;
  theme: 'light' | 'dark';
}

export function AttackPanel({ onAttack, theme }: Props) {
  const isDark = theme === 'dark';

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Attacks</h2>
      <div className="flex flex-wrap gap-2">
        {effects.map(effect => (
          <button
            key={effect}
            className={`text-white px-4 py-2 rounded ${
              isDark
                ? 'bg-orange-700 hover:bg-orange-800'
                : 'bg-orange-600 hover:bg-orange-700'
            }`}
            onClick={() => onAttack(effect)}
          >
            {capitalize(effect)}
          </button>
        ))}
      </div>
    </div>
  );
}
