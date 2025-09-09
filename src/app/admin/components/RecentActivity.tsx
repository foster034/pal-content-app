const activities = [
  { id: 1, user: 'John Doe', action: 'Created new account', time: '2 minutes ago' },
  { id: 2, user: 'Jane Smith', action: 'Updated profile', time: '15 minutes ago' },
  { id: 3, user: 'Mike Johnson', action: 'Made a purchase', time: '1 hour ago' },
  { id: 4, user: 'Sarah Wilson', action: 'Logged in', time: '2 hours ago' },
  { id: 5, user: 'Tom Brown', action: 'Changed password', time: '3 hours ago' },
];

export function RecentActivity() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-gray-900">{activity.user}</p>
              <p className="text-sm text-gray-500">{activity.action}</p>
            </div>
            <span className="text-xs text-gray-400">{activity.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}