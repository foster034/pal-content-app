'use client';

import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { clearTechSession } from '@/lib/tech-auth';

interface TechLogoutButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  className?: string;
}

export default function TechLogoutButton({ variant = 'ghost', className }: TechLogoutButtonProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Clear tech session
      clearTechSession();

      // Clear tech session cookie
      document.cookie = 'tech_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

      // Redirect to tech auth page
      router.push('/tech-auth');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <Button
      onClick={handleLogout}
      variant={variant}
      className={className}
    >
      <LogOut className="w-4 h-4 mr-2" />
      Logout
    </Button>
  );
}