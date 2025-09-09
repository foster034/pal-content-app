import { StatsCard } from './components/StatsCard';
import { RecentActivity } from './components/RecentActivity';
import { Chart } from './components/Chart';

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Users"
          value="1,234"
          change="+12%"
          trend="up"
        />
        <StatsCard
          title="Revenue"
          value="$45,678"
          change="+8%"
          trend="up"
        />
        <StatsCard
          title="Orders"
          value="2,345"
          change="-3%"
          trend="down"
        />
        <StatsCard
          title="Conversion Rate"
          value="3.2%"
          change="+0.5%"
          trend="up"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Chart />
        <RecentActivity />
      </div>
    </div>
  );
}