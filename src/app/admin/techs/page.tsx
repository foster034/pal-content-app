'use client';

import { useState } from 'react';

interface Tech {
  id: number;
  name: string;
  email: string;
  phone: string;
  franchiseeId: number;
  franchiseeName: string;
  specialties: string[];
  status: 'Active' | 'Inactive' | 'On Leave';
  hireDate: string;
  rating: number;
  completedJobs: number;
}

const initialTechs: Tech[] = [
  { 
    id: 1, 
    name: 'Alex Rodriguez', 
    email: 'alex@popalock.com', 
    phone: '(555) 111-2222', 
    franchiseeId: 1,
    franchiseeName: 'Downtown',
    specialties: ['Automotive Locksmith', 'Roadside Assistance'], 
    status: 'Active', 
    hireDate: '2024-01-20', 
    rating: 4.8,
    completedJobs: 156
  },
  { 
    id: 2, 
    name: 'Maria Garcia', 
    email: 'maria@popalock.com', 
    phone: '(555) 222-3333', 
    franchiseeId: 2,
    franchiseeName: 'Westside',
    specialties: ['Commercial Locksmith', 'Access Control'], 
    status: 'Active', 
    hireDate: '2024-02-15', 
    rating: 4.9,
    completedJobs: 203
  },
  { 
    id: 3, 
    name: 'David Chen', 
    email: 'david@popalock.com', 
    phone: '(555) 333-4444', 
    franchiseeId: 1,
    franchiseeName: 'Downtown',
    specialties: ['Residential Locksmith', 'Key Programming'], 
    status: 'On Leave', 
    hireDate: '2024-03-01', 
    rating: 4.5,
    completedJobs: 89
  },
  { 
    id: 4, 
    name: 'Jennifer Lee', 
    email: 'jennifer@popalock.com', 
    phone: '(555) 444-5555', 
    franchiseeId: 4,
    franchiseeName: 'Northside',
    specialties: ['Safe Services', 'Emergency Services'], 
    status: 'Active', 
    hireDate: '2024-04-10', 
    rating: 4.7,
    completedJobs: 124
  },
];

const franchisees = [
  { id: 1, name: 'Downtown' },
  { id: 2, name: 'Westside' },
  { id: 3, name: 'Eastside' },
  { id: 4, name: 'Northside' },
];

const specialtyOptions = ['Automotive Locksmith', 'Commercial Locksmith', 'Residential Locksmith', 'Roadside Assistance', 'Key Programming', 'Safe Services', 'Access Control', 'Emergency Services'];

export default function TechsPage() {
  const [techs, setTechs] = useState<Tech[]>(initialTechs);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTech, setEditingTech] = useState<Tech | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    franchiseeId: 1,
    specialties: [] as string[],
    status: 'Active' as const,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedFranchisee = franchisees.find(f => f.id === formData.franchiseeId);
    
    if (editingTech) {
      setTechs(prev => prev.map(t => 
        t.id === editingTech.id 
          ? { 
              ...t, 
              ...formData,
              franchiseeName: selectedFranchisee?.name || ''
            }
          : t
      ));
      setEditingTech(null);
    } else {
      const newTech: Tech = {
        id: Math.max(...techs.map(t => t.id)) + 1,
        ...formData,
        franchiseeName: selectedFranchisee?.name || '',
        hireDate: new Date().toISOString().split('T')[0],
        rating: 0,
        completedJobs: 0,
      };
      setTechs(prev => [...prev, newTech]);
    }
    setFormData({ name: '', email: '', phone: '', franchiseeId: 1, specialties: [], status: 'Active' });
    setShowCreateForm(false);
  };

  const handleEdit = (tech: Tech) => {
    setEditingTech(tech);
    setFormData({
      name: tech.name,
      email: tech.email,
      phone: tech.phone,
      franchiseeId: tech.franchiseeId,
      specialties: tech.specialties,
      status: tech.status,
    });
    setShowCreateForm(true);
  };

  const handleDelete = (id: number) => {
    setTechs(prev => prev.filter(t => t.id !== id));
  };

  const handleSpecialtyChange = (specialty: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({ ...prev, specialties: [...prev.specialties, specialty] }));
    } else {
      setFormData(prev => ({ ...prev, specialties: prev.specialties.filter(s => s !== specialty) }));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Inactive': return 'bg-red-100 text-red-800';
      case 'On Leave': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStars = (rating: number) => {
    return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Technicians</h1>
        <button 
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add Technician
        </button>
      </div>

      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingTech ? 'Edit Technician' : 'Create New Technician'}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Franchisee</label>
                <select
                  value={formData.franchiseeId}
                  onChange={(e) => setFormData(prev => ({ ...prev, franchiseeId: parseInt(e.target.value) }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {franchisees.map(franchisee => (
                    <option key={franchisee.id} value={franchisee.id}>
                      {franchisee.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Specialties</label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {specialtyOptions.map(specialty => (
                    <label key={specialty} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.specialties.includes(specialty)}
                        onChange={(e) => handleSpecialtyChange(specialty, e.target.checked)}
                        className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">{specialty}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'Active' | 'Inactive' | 'On Leave' }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="On Leave">On Leave</option>
                </select>
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingTech ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingTech(null);
                    setFormData({ name: '', email: '', phone: '', franchiseeId: 1, specialties: [], status: 'Active' });
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
                Technician
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Franchisee
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Specialties
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Performance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {techs.map((tech) => (
              <tr key={tech.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{tech.name}</div>
                    <div className="text-sm text-gray-500">Hired {new Date(tech.hireDate).toLocaleDateString()}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{tech.email}</div>
                  <div className="text-sm text-gray-500">{tech.phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {tech.franchiseeName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-wrap gap-1">
                    {tech.specialties.map(specialty => (
                      <span key={specialty} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        {specialty}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(tech.status)}`}>
                    {tech.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    <div className="text-yellow-400">{renderStars(tech.rating)}</div>
                    <div className="text-xs text-gray-500">{tech.completedJobs} jobs completed</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button 
                    onClick={() => handleEdit(tech)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(tech.id)}
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