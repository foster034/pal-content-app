export function Chart() {
  const data = [
    { month: 'Jan', value: 400 },
    { month: 'Feb', value: 300 },
    { month: 'Mar', value: 500 },
    { month: 'Apr', value: 700 },
    { month: 'May', value: 600 },
    { month: 'Jun', value: 800 },
  ];

  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
      <div className="flex items-end justify-between h-48 space-x-2">
        {data.map((item) => (
          <div key={item.month} className="flex flex-col items-center flex-1">
            <div
              className="bg-blue-500 rounded-t w-full transition-all duration-500"
              style={{ height: `${(item.value / maxValue) * 100}%` }}
            />
            <span className="text-xs text-gray-500 mt-2">{item.month}</span>
          </div>
        ))}
      </div>
    </div>
  );
}