import { capitalize } from '../utils';

export type DamageEffect = 'fire' | 'burn' | 'scorch' | 'inferno' | 'pyroclasm';

const effects: DamageEffect[] = [
  'fire',
  'burn',
  'scorch',
  'inferno',
  'pyroclasm',
];

export function AttackPanel({
  onAttack,
}: {
  onAttack: (e: DamageEffect) => void;
}) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Attacks</h2>
      <div className="flex flex-wrap gap-2">
        {effects.map(effect => (
          <button
            key={effect}
            className="bg-orange-600 hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-800 text-white px-4 py-2 rounded"
            onClick={() => onAttack(effect)}
          >
            {capitalize(effect)}
          </button>
        ))}
      </div>
    </div>
  );
}
