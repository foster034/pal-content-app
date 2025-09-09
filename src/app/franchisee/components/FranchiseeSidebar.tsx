'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigation = [
  { name: 'Dashboard', href: '/franchisee', icon: '📊' },
  { name: 'My Technicians', href: '/franchisee/techs', icon: '🔧' },
  { name: 'Jobs', href: '/franchisee/jobs', icon: '📋' },
  { name: 'Reports', href: '/franchisee/reports', icon: '📈' },
  { name: 'Profile', href: '/franchisee/profile', icon: '👤' },
];

export function FranchiseeSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800">🔐 Pop-A-Lock</h2>
        <p className="text-sm text-gray-600 mt-1">Franchisee Portal</p>
        <p className="text-xs text-gray-500">Downtown Territory</p>
      </div>
      
      <nav className="mt-6">
        <ul className="space-y-2 px-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-gray-100 rounded-lg p-3">
          <p className="text-xs text-gray-600">Logged in as:</p>
          <p className="text-sm font-medium text-gray-900">John Smith</p>
          <p className="text-xs text-gray-500">john@franchise1.com</p>
        </div>
      </div>
    </div>
  );
}