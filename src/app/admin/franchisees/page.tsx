'use client';

import { useState } from 'react';

interface Franchisee {
  id: number;
  name: string;
  email: string;
  phone: string;
  territory: string;
  status: 'Active' | 'Inactive' | 'Pending';
  joinDate: string;
  revenue: string;
}

const initialFranchisees: Franchisee[] = [
  { id: 1, name: 'John Smith', email: 'john@franchise1.com', phone: '(555) 123-4567', territory: 'Downtown', status: 'Active', joinDate: '2024-01-15', revenue: '$45,000' },
  { id: 2, name: 'Sarah Johnson', email: 'sarah@franchise2.com', phone: '(555) 234-5678', territory: 'Westside', status: 'Active', joinDate: '2024-02-20', revenue: '$38,500' },
  { id: 3, name: 'Mike Davis', email: 'mike@franchise3.com', phone: '(555) 345-6789', territory: 'Eastside', status: 'Pending', joinDate: '2024-03-10', revenue: '$12,000' },
  { id: 4, name: 'Lisa Wilson', email: 'lisa@franchise4.com', phone: '(555) 456-7890', territory: 'Northside', status: 'Active', joinDate: '2024-04-05', revenue: '$52,300' },
];

export default function FranchiseesPage() {
  const [franchisees, setFranchisees] = useState<Franchisee[]>(initialFranchisees);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingFranchisee, setEditingFranchisee] = useState<Franchisee | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    territory: '',
    status: 'Active' as const,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingFranchisee) {
      setFranchisees(prev => prev.map(f => 
        f.id === editingFranchisee.id 
          ? { ...f, ...formData }
          : f
      ));
      setEditingFranchisee(null);
    } else {
      const newFranchisee: Franchisee = {
        id: Math.max(...franchisees.map(f => f.id)) + 1,
        ...formData,
        joinDate: new Date().toISOString().split('T')[0],
        revenue: '$0',
      };
      setFranchisees(prev => [...prev, newFranchisee]);
    }
    setFormData({ name: '', email: '', phone: '', territory: '', status: 'Active' });
    setShowCreateForm(false);
  };

  const handleEdit = (franchisee: Franchisee) => {
    setEditingFranchisee(franchisee);
    setFormData({
      name: franchisee.name,
      email: franchisee.email,
      phone: franchisee.phone,
      territory: franchisee.territory,
      status: franchisee.status,
    });
    setShowCreateForm(true);
  };

  const handleDelete = (id: number) => {
    setFranchisees(prev => prev.filter(f => f.id !== id));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Inactive': return 'bg-red-100 text-red-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Franchisees</h1>
        <button 
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add Franchisee
        </button>
      </div>

      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingFranchisee ? 'Edit Franchisee' : 'Create New Franchisee'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Territory</label>
                <input
                  type="text"
                  value={formData.territory}
                  onChange={(e) => setFormData(prev => ({ ...prev, territory: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'Active' | 'Inactive' | 'Pending' }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingFranchisee ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingFranchisee(null);
                    setFormData({ name: '', email: '', phone: '', territory: '', status: 'Active' });
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Franchisee
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Territory
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Revenue
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {franchisees.map((franchisee) => (
              <tr key={franchisee.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{franchisee.name}</div>
                    <div className="text-sm text-gray-500">Joined {new Date(franchisee.joinDate).toLocaleDateString()}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{franchisee.email}</div>
                  <div className="text-sm text-gray-500">{franchisee.phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {franchisee.territory}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(franchisee.status)}`}>
                    {franchisee.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {franchisee.revenue}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button 
                    onClick={() => handleEdit(franchisee)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(franchisee.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}