export interface Enemy {
  id: number;
  name: string;
  hp: number;
  burnStacks: number;
}

interface Props {
  enemies: Enemy[];
  selected: Enemy | null;
  onSelect: (e: Enemy) => void;
}

export function EnemyList({ enemies, selected, onSelect }: Props) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Enemies</h2>
      <ul className="space-y-2">
        {enemies.map(enemy => (
          <li
            key={enemy.id}
            className={`p-2 border rounded cursor-pointer ${
              selected?.id === enemy.id
                ? 'bg-red-200 border-red-500'
                : 'bg-white'
            }`}
            onClick={() => onSelect(enemy)}
          >
            {enemy.name} (HP: {enemy.hp})
            {enemy.burnStacks > 0 && (
              <span className="ml-2 text-orange-600">
                🔥 {enemy.burnStacks}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
