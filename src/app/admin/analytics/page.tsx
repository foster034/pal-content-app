import { StatsCard } from '../components/StatsCard';

const analyticsData = {
  pageViews: { value: '124,567', change: '+15.3%', trend: 'up' as const },
  uniqueVisitors: { value: '23,456', change: '+8.7%', trend: 'up' as const },
  bounceRate: { value: '34.2%', change: '-2.1%', trend: 'up' as const },
  avgSessionDuration: { value: '3m 42s', change: '+12s', trend: 'up' as const },
};

const topPages = [
  { page: '/home', views: 15420, percentage: 25.4 },
  { page: '/products', views: 12340, percentage: 20.3 },
  { page: '/about', views: 8765, percentage: 14.4 },
  { page: '/contact', views: 5432, percentage: 8.9 },
  { page: '/blog', views: 4321, percentage: 7.1 },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <div className="flex space-x-2">
          <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 3 months</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Page Views"
          value={analyticsData.pageViews.value}
          change={analyticsData.pageViews.change}
          trend={analyticsData.pageViews.trend}
        />
        <StatsCard
          title="Unique Visitors"
          value={analyticsData.uniqueVisitors.value}
          change={analyticsData.uniqueVisitors.change}
          trend={analyticsData.uniqueVisitors.trend}
        />
        <StatsCard
          title="Bounce Rate"
          value={analyticsData.bounceRate.value}
          change={analyticsData.bounceRate.change}
          trend={analyticsData.bounceRate.trend}
        />
        <StatsCard
          title="Avg Session"
          value={analyticsData.avgSessionDuration.value}
          change={analyticsData.avgSessionDuration.change}
          trend={analyticsData.avgSessionDuration.trend}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Pages</h3>
          <div className="space-y-4">
            {topPages.map((page, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">{page.page}</span>
                    <span className="text-sm text-gray-500">{page.views.toLocaleString()} views</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${page.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Traffic Sources</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Direct</span>
              <span className="text-sm font-medium">45.2%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Google</span>
              <span className="text-sm font-medium">32.1%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Social Media</span>
              <span className="text-sm font-medium">15.7%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Email</span>
              <span className="text-sm font-medium">4.8%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Other</span>
              <span className="text-sm font-medium">2.2%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}