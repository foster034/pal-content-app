interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
}

export function StatsCard({ title, value, change, trend }: StatsCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`flex items-center text-sm font-medium ${
          trend === 'up' ? 'text-green-600' : 'text-red-600'
        }`}>
          <span className="mr-1">
            {trend === 'up' ? '↗️' : '↘️'}
          </span>
          {change}
        </div>
      </div>
    </div>
  );
}