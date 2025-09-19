"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@/lib/supabase-client";


export default function HomePage() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Checking authentication...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Session error:', sessionError);
          router.push('/auth/login');
          return;
        }

        if (session) {
          console.log('Session found, getting user profile...');
          // Get user profile to determine redirect
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

          if (profileError) {
            console.error('Profile error:', profileError);
            router.push('/auth/login');
            return;
          }

          if (profile) {
            console.log('Profile found, role:', profile.role);
            switch (profile.role) {
              case 'admin':
                router.push('/admin');
                break;
              case 'franchisee':
                router.push('/franchisee');
                break;
              case 'tech':
                router.push('/tech/dashboard');
                break;
              default:
                router.push('/tech/dashboard');
            }
          } else {
            console.log('No profile found, redirecting to login');
            router.push('/auth/login');
          }
        } else {
          console.log('No session found, redirecting to login');
          router.push('/auth/login');
        }
      } catch (error) {
        console.error('Error in checkAuth:', error);
        router.push('/auth/login');
      }
    };

    checkAuth();
  }, [router, supabase]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  );
}
