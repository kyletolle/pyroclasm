import { useState } from "react";
import { EnemyList, type Enemy}  from "./components/EnemyList";
import { type DamageEffect, AttackPanel  } from "./components/AttackPanel";
import ActionLog from "./components/ActionLog";
import { capitalize } from "./utils";

const baseDamageMap: Record<DamageEffect, number> = {
  fire: 30,
  burn: 5,
  scorch: 10,
  inferno: 20,
  pyroclasm: 50,
};

function App() {
  const [enemies, setEnemies] = useState<Enemy[]>([
    { id: 1, name: "Goblin", hp: 100 },
    { id: 2, name: "Orc", hp: 150 },
    { id: 3, name: "Dragon Whelp", hp: 200 },
  ]);
  const [selectedEnemy, setSelectedEnemy] = useState<Enemy | null>(null);
  const [log, setLog] = useState<string[]>([]);

  const useAttack = (effect: DamageEffect) => {
    if (!selectedEnemy) {
      setLog((prev) => [...prev, "No enemy selected!"]);
      return;
    }

    const damage = baseDamageMap[effect];
    setEnemies((prev) =>
      prev.map((e) =>
        e.id === selectedEnemy.id ? { ...e, hp: Math.max(0, e.hp - damage) } : e
      )
    );
    setLog((prev) => [
      ...prev,
      `Used ${capitalize(effect)} on ${selectedEnemy.name} for ${damage} damage.`,
    ]);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
      <EnemyList enemies={enemies} selected={selectedEnemy} onSelect={setSelectedEnemy} />
      <AttackPanel onAttack={useAttack} />
      <ActionLog log={log} />
    </div>
  );
}

export default App;
