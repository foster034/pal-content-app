'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface TechAuth {
  email: string;
  loginTime: string;
}

interface Job {
  id: number;
  customer: string;
  address: string;
  service: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  scheduledTime: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  description: string;
  estimatedDuration: string;
}

const sampleJobs: Job[] = [
  {
    id: 1,
    customer: 'Johnson Auto Dealership',
    address: '123 Main St, Downtown',
    service: 'Automotive Lockout',
    priority: 'High',
    scheduledTime: '2024-09-09T14:00:00',
    status: 'Scheduled',
    description: 'Customer locked keys in 2023 Honda Civic, needs immediate assistance',
    estimatedDuration: '30 minutes'
  },
  {
    id: 2,
    customer: 'Metro Office Complex',
    address: '456 Business Ave, Downtown',
    service: 'Commercial Lock Repair',
    priority: 'Medium',
    scheduledTime: '2024-09-09T16:30:00',
    status: 'Scheduled',
    description: 'Front door lock mechanism jammed, office cannot secure building',
    estimatedDuration: '1 hour'
  },
  {
    id: 3,
    customer: 'Smith Residence',
    address: '789 Oak St, Downtown',
    service: 'Residential Rekey',
    priority: 'Low',
    scheduledTime: '2024-09-10T09:00:00',
    status: 'Scheduled',
    description: 'Homeowner wants all locks rekeyed after moving in',
    estimatedDuration: '1.5 hours'
  },
  {
    id: 4,
    customer: 'Highway 95 - Mile Marker 42',
    address: 'Interstate 95, Southbound',
    service: 'Roadside Lockout',
    priority: 'Urgent',
    scheduledTime: '2024-09-09T18:00:00',
    status: 'Scheduled',
    description: 'Stranded motorist locked out of vehicle with child inside',
    estimatedDuration: '20 minutes'
  }
];

export default function TechDashboard() {
  const [techAuth, setTechAuth] = useState<TechAuth | null>(null);
  const [jobs, setJobs] = useState<Job[]>(sampleJobs);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const authData = localStorage.getItem('techAuth');
    if (!authData) {
      router.push('/tech/login');
      return;
    }

    try {
      const auth = JSON.parse(authData) as TechAuth;
      setTechAuth(auth);
    } catch (error) {
      localStorage.removeItem('techAuth');
      router.push('/tech/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('techAuth');
    router.push('/tech/login');
  };

  const handleJobAction = (jobId: number, newStatus: Job['status']) => {
    setJobs(prev => prev.map(job => 
      job.id === jobId ? { ...job, status: newStatus } : job
    ));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled': return 'bg-blue-100 text-blue-800';
      case 'In Progress': return 'bg-purple-100 text-purple-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const todaysJobs = jobs.filter(job => {
    const jobDate = new Date(job.scheduledTime).toDateString();
    const today = new Date().toDateString();
    return jobDate === today;
  });

  const upcomingJobs = jobs.filter(job => {
    const jobDate = new Date(job.scheduledTime);
    const today = new Date();
    return jobDate > today;
  });

  if (!techAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Image
                src="/images/pop-a-lock-logo.svg"
                alt="Pop-A-Lock"
                width={180}
                height={72}
                className="mr-4"
              />
              <h1 className="text-xl font-bold text-gray-900">Technician Portal</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Welcome, <span className="font-medium">{techAuth.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-blue-600 text-xl">📅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{todaysJobs.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-green-600 text-xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{jobs.filter(j => j.status === 'Completed').length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-purple-600 text-xl">🔄</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">{jobs.filter(j => j.status === 'In Progress').length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <span className="text-yellow-600 text-xl">⏰</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-gray-900">{upcomingJobs.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Today's Jobs */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Today's Jobs</h2>
          {todaysJobs.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <div className="text-gray-400 text-4xl mb-4">🎉</div>
              <p className="text-gray-500">No jobs scheduled for today!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {todaysJobs.map((job) => (
                <div key={job.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{job.customer}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(job.priority)}`}>
                          {job.priority} Priority
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(job.status)}`}>
                          {job.status}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-1">📍 {job.address}</p>
                      <p className="text-gray-600 mb-1">🔧 {job.service}</p>
                      <p className="text-gray-600 mb-1">⏱️ {job.estimatedDuration}</p>
                      <p className="text-gray-600 mb-3">📋 {job.description}</p>
                      <p className="text-sm text-gray-500">🕒 Scheduled: {formatDateTime(job.scheduledTime)}</p>
                    </div>
                    <div className="flex flex-col space-y-2 ml-4">
                      {job.status === 'Scheduled' && (
                        <button
                          onClick={() => handleJobAction(job.id, 'In Progress')}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          Start Job
                        </button>
                      )}
                      {job.status === 'In Progress' && (
                        <button
                          onClick={() => handleJobAction(job.id, 'Completed')}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Jobs */}
        {upcomingJobs.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Upcoming Jobs</h2>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer & Service
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Scheduled Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {upcomingJobs.map((job) => (
                    <tr key={job.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{job.customer}</div>
                          <div className="text-sm text-gray-500">{job.service}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDateTime(job.scheduledTime)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(job.priority)}`}>
                          {job.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {job.estimatedDuration}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}