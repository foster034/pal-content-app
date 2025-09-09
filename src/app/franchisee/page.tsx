import Link from 'next/link';
import { StatsCard } from '../admin/components/StatsCard';

const recentJobs = [
  { id: 1, customer: 'Johnson Auto Dealership', tech: 'Alex Rodriguez', service: 'Automotive Lockout', status: 'Completed', date: '2024-09-08' },
  { id: 2, customer: 'Metro Office Complex', tech: 'David Chen', service: 'Commercial Lock Repair', status: 'In Progress', date: '2024-09-09' },
  { id: 3, customer: 'Smith Residence', tech: 'Alex Rodriguez', service: 'Residential Rekey', status: 'Scheduled', date: '2024-09-10' },
];

export default function FranchiseeDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pop-A-Lock Franchise Dashboard</h1>
          <p className="text-gray-600">Welcome back, John! Here's your locksmith territory overview.</p>
        </div>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Active Locksmiths"
          value="2"
          change="+1 this month"
          trend="up"
        />
        <StatsCard
          title="Service Calls"
          value="47"
          change="+23%"
          trend="up"
        />
        <StatsCard
          title="Monthly Revenue"
          value="$12,450"
          change="+15%"
          trend="up"
        />
        <StatsCard
          title="Customer Rating"
          value="4.8★"
          change="+0.2"
          trend="up"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Jobs</h3>
            <Link 
              href="/franchisee/jobs"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {recentJobs.map((job) => (
              <div key={job.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{job.customer}</p>
                  <p className="text-sm text-gray-500">{job.tech} • {job.service}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    job.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    job.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {job.status}
                  </span>
                  <p className="text-xs text-gray-400 mt-1">{new Date(job.date).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link
              href="/franchisee/techs"
              className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add New Locksmith
            </Link>
            <Link
              href="/franchisee/jobs"
              className="block w-full bg-green-600 text-white text-center py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              Schedule Service Call
            </Link>
            <Link
              href="/franchisee/reports"
              className="block w-full bg-purple-600 text-white text-center py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              View Reports
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

