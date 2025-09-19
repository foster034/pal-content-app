import { redirect } from 'next/navigation';
import { type Metadata } from 'next';

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function TechLoginRedirect({ searchParams }: PageProps) {
  // Get the code parameter if it exists
  const code = searchParams.code;

  // Redirect to the new tech-auth page with the code parameter
  if (code && typeof code === 'string') {
    redirect(`/tech-auth?code=${code}`);
  } else {
    redirect('/tech-auth');
  }
}

export const metadata: Metadata = {
  title: 'Redirecting...',
};