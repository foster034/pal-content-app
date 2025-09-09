'use client';

import { useState } from 'react';

interface Tech {
  id: number;
  name: string;
  email: string;
  phone: string;
  specialties: string[];
  status: 'Active' | 'Inactive' | 'On Leave';
  hireDate: string;
  rating: number;
  completedJobs: number;
}

interface LoginCode {
  code: string;
  email: string;
  expiresAt: Date;
  used: boolean;
}

interface GeneratedAuth {
  email: string;
  code: string;
  magicLink: string;
  expiresAt: Date;
}

interface TechUrls {
  dashboardUrl: string;
  loginUrl: string;
}

// Sample data for the current franchisee (John Smith - Downtown)
const initialTechs: Tech[] = [
  { 
    id: 1, 
    name: 'Alex Rodriguez', 
    email: 'alex@popalock.com', 
    phone: '(555) 111-2222', 
    specialties: ['Automotive Locksmith', 'Roadside Assistance'], 
    status: 'Active', 
    hireDate: '2024-01-20', 
    rating: 4.8,
    completedJobs: 156
  },
  { 
    id: 3, 
    name: 'David Chen', 
    email: 'david@popalock.com', 
    phone: '(555) 333-4444', 
    specialties: ['Residential Locksmith', 'Key Programming'], 
    status: 'On Leave', 
    hireDate: '2024-03-01', 
    rating: 4.5,
    completedJobs: 89
  },
];

const specialtyOptions = ['Automotive Locksmith', 'Commercial Locksmith', 'Residential Locksmith', 'Roadside Assistance', 'Key Programming', 'Safe Services', 'Access Control', 'Emergency Services'];

// Simulated database of active codes
let activeCodes: LoginCode[] = [];

export default function FranchiseeTechsPage() {
  const [techs, setTechs] = useState<Tech[]>(initialTechs);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTech, setEditingTech] = useState<Tech | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedTechForAuth, setSelectedTechForAuth] = useState<Tech | null>(null);
  const [generatedAuth, setGeneratedAuth] = useState<GeneratedAuth | null>(null);
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [selectedTechForUrl, setSelectedTechForUrl] = useState<Tech | null>(null);
  const [techUrls, setTechUrls] = useState<TechUrls | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialties: [] as string[],
    status: 'Active' as const,
  });

  const generateLoginCode = () => {
    // Generate a 6-digit code
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now
    return { code: newCode, expiresAt };
  };

  const generateMagicLink = (email: string, code: string) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/tech/login/verify?email=${encodeURIComponent(email)}&code=${code}`;
  };

  const handleGenerateAuth = (tech: Tech) => {
    const { code, expiresAt } = generateLoginCode();
    
    // Remove any existing codes for this email
    activeCodes = activeCodes.filter(ac => ac.email !== tech.email);
    
    // Add new code
    activeCodes.push({
      code: code,
      email: tech.email,
      expiresAt: expiresAt,
      used: false
    });

    const magicLink = generateMagicLink(tech.email, code);
    
    setGeneratedAuth({
      email: tech.email,
      code: code,
      magicLink: magicLink,
      expiresAt: expiresAt
    });
    
    setSelectedTechForAuth(tech);
    setShowAuthModal(true);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const generateTechId = (tech: Tech) => {
    return tech.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  };

  const handleGenerateUrls = (tech: Tech) => {
    const baseUrl = window.location.origin;
    const techId = generateTechId(tech);
    
    const urls: TechUrls = {
      dashboardUrl: `${baseUrl}/tech/${techId}`,
      loginUrl: `${baseUrl}/tech/login`
    };
    
    setTechUrls(urls);
    setSelectedTechForUrl(tech);
    setShowUrlModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingTech) {
      setTechs(prev => prev.map(t => 
        t.id === editingTech.id 
          ? { ...t, ...formData }
          : t
      ));
      setEditingTech(null);
    } else {
      const newTech: Tech = {
        id: Math.max(...techs.map(t => t.id), 0) + 1,
        ...formData,
        hireDate: new Date().toISOString().split('T')[0],
        rating: 0,
        completedJobs: 0,
      };
      setTechs(prev => [...prev, newTech]);
    }
    setFormData({ name: '', email: '', phone: '', specialties: [], status: 'Active' });
    setShowCreateForm(false);
  };

  const handleEdit = (tech: Tech) => {
    setEditingTech(tech);
    setFormData({
      name: tech.name,
      email: tech.email,
      phone: tech.phone,
      specialties: tech.specialties,
      status: tech.status,
    });
    setShowCreateForm(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to remove this technician?')) {
      setTechs(prev => prev.filter(t => t.id !== id));
    }
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Technicians</h1>
          <p className="text-gray-600">Manage your team of technicians and generate login codes</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add New Technician
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-green-600 text-xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Technicians</p>
              <p className="text-2xl font-bold text-gray-900">{techs.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-blue-600 text-xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Techs</p>
              <p className="text-2xl font-bold text-gray-900">{techs.filter(t => t.status === 'Active').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-yellow-600 text-xl">⭐</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Rating</p>
              <p className="text-2xl font-bold text-gray-900">
                {techs.length > 0 ? (techs.reduce((sum, t) => sum + t.rating, 0) / techs.length).toFixed(1) : '0.0'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingTech ? 'Edit Technician' : 'Add New Technician'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="(555) 123-4567"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Specialties</label>
                <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-3">
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
              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingTech ? 'Update Technician' : 'Add Technician'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingTech(null);
                    setFormData({ name: '', email: '', phone: '', specialties: [], status: 'Active' });
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

      {/* Authentication Modal */}
      {showAuthModal && selectedTechForAuth && generatedAuth && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Login Credentials for {selectedTechForAuth.name}
              </h2>
              <button
                onClick={() => {
                  setShowAuthModal(false);
                  setSelectedTechForAuth(null);
                  setGeneratedAuth(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">📱 Login Code</h3>
                <div className="bg-white p-3 rounded border border-blue-200">
                  <div className="flex items-center justify-between">
                    <code className="text-2xl font-bold text-blue-600 tracking-widest">
                      {generatedAuth.code}
                    </code>
                    <button
                      onClick={() => copyToClipboard(generatedAuth.code)}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <p className="text-sm text-blue-700 mt-2">
                  Expires: {generatedAuth.expiresAt.toLocaleString()}
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">🔗 Magic Link</h3>
                <div className="bg-white p-3 rounded border border-green-200">
                  <div className="flex items-center justify-between">
                    <code className="text-xs text-green-600 break-all flex-1 mr-2">
                      {generatedAuth.magicLink}
                    </code>
                    <button
                      onClick={() => copyToClipboard(generatedAuth.magicLink)}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 whitespace-nowrap"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <p className="text-sm text-green-700 mt-2">
                  Send this link directly to the technician for instant login
                </p>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-semibold text-yellow-900 mb-2">📧 Instructions</h3>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• Share the 6-digit code via text/call</li>
                  <li>• Or send the magic link via email/messaging app</li>
                  <li>• Code expires in 15 minutes</li>
                  <li>• Technician goes to: /tech/login</li>
                </ul>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => handleGenerateAuth(selectedTechForAuth)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Generate New Code
              </button>
              <button
                onClick={() => {
                  setShowAuthModal(false);
                  setSelectedTechForAuth(null);
                  setGeneratedAuth(null);
                }}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* URL Modal */}
      {showUrlModal && selectedTechForUrl && techUrls && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {selectedTechForUrl.name}'s Dedicated URLs
              </h2>
              <button
                onClick={() => {
                  setShowUrlModal(false);
                  setSelectedTechForUrl(null);
                  setTechUrls(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-900 mb-2">🔗 Personal Dashboard</h3>
                <div className="bg-white p-3 rounded border border-purple-200">
                  <div className="flex items-center justify-between">
                    <code className="text-sm text-purple-600 break-all flex-1 mr-2">
                      {techUrls.dashboardUrl}
                    </code>
                    <button
                      onClick={() => copyToClipboard(techUrls.dashboardUrl)}
                      className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 whitespace-nowrap"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <p className="text-sm text-purple-700 mt-2">
                  Personal dashboard where {selectedTechForUrl.name} can post and manage jobs
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">🔐 Login Portal</h3>
                <div className="bg-white p-3 rounded border border-blue-200">
                  <div className="flex items-center justify-between">
                    <code className="text-sm text-blue-600 break-all flex-1 mr-2">
                      {techUrls.loginUrl}
                    </code>
                    <button
                      onClick={() => copyToClipboard(techUrls.loginUrl)}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 whitespace-nowrap"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <p className="text-sm text-blue-700 mt-2">
                  General login page for all technicians
                </p>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-semibold text-yellow-900 mb-2">📋 How It Works</h3>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• Share the personal dashboard URL directly with {selectedTechForUrl.name}</li>
                  <li>• Tech can bookmark their personal dashboard</li>
                  <li>• Dashboard allows posting jobs, managing work, tracking progress</li>
                  <li>• Each tech has their own unique URL and workspace</li>
                  <li>• Login portal can be used if they lose their direct link</li>
                </ul>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => window.open(techUrls.dashboardUrl, '_blank')}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Preview Dashboard
              </button>
              <button
                onClick={() => {
                  setShowUrlModal(false);
                  setSelectedTechForUrl(null);
                  setTechUrls(null);
                }}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {techs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔧</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No technicians yet</h3>
            <p className="text-gray-500 mb-6">Get started by adding your first technician to your team.</p>
            <button 
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Your First Technician
            </button>
          </div>
        ) : (
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex flex-col space-y-1">
                      <div className="flex space-x-2">
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
                          Remove
                        </button>
                      </div>
                      <button 
                        onClick={() => handleGenerateAuth(tech)}
                        className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700 transition-colors mb-1"
                      >
                        🔐 Generate Login
                      </button>
                      <button 
                        onClick={() => handleGenerateUrls(tech)}
                        className="bg-purple-600 text-white px-2 py-1 rounded text-xs hover:bg-purple-700 transition-colors"
                      >
                        🔗 Get Dashboard URL
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}