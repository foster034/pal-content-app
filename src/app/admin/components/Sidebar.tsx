'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: '📊' },
  { name: 'Users', href: '/admin/users', icon: '👥' },
  { name: 'Franchisees', href: '/admin/franchisees', icon: '🏢' },
  { name: 'Techs', href: '/admin/techs', icon: '🔧' },
  { name: 'Analytics', href: '/admin/analytics', icon: '📈' },
  { name: 'Settings', href: '/admin/settings', icon: '⚙️' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="p-6">
        <Image
          src="/images/pop-a-lock-logo.svg"
          alt="Pop-A-Lock"
          width={200}
          height={80}
          className="mb-2"
        />
        <p className="text-sm text-gray-600">Admin Portal</p>
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
    </div>
  );
}