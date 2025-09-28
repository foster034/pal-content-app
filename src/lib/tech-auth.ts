// Tech authentication utilities

interface TechSession {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar_url?: string;
  franchisee: {
    id: string;
    business_name: string;
  };
  loginTime: string;
}

const TECH_SESSION_KEY = 'tech_session';

export function setTechSession(session: TechSession): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TECH_SESSION_KEY, JSON.stringify({
      ...session,
      loginTime: new Date().toISOString()
    }));
  }
}

export function getTechSession(): TechSession | null {
  if (typeof window !== 'undefined') {
    const sessionData = localStorage.getItem(TECH_SESSION_KEY);
    if (sessionData) {
      try {
        const session = JSON.parse(sessionData);
        // Check if session is less than 24 hours old
        const loginTime = new Date(session.loginTime);
        const now = new Date();
        const hoursDiff = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);

        if (hoursDiff < 24) {
          return session;
        } else {
          // Session expired, remove it
          clearTechSession();
        }
      } catch (error) {
        console.error('Error parsing tech session:', error);
        clearTechSession();
      }
    }
  }
  return null;
}

export function clearTechSession(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TECH_SESSION_KEY);
  }
}

export function isLoggedIn(): boolean {
  return getTechSession() !== null;
}