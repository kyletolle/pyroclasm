export default function ActionLog({ log }: { log: string[] }) {
  return (
    <div className="col-span-full mt-6">
      <h2 className="text-xl font-bold mb-2">Action Log</h2>
      <ul className="space-y-1 bg-gray-100 p-3 rounded h-48 overflow-y-auto">
        {log.map((entry, i) => (
          <li key={i} className="text-sm text-gray-700">
            {entry}
          </li>
        ))}
      </ul>
    </div>
  );
}
