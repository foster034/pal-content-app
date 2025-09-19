import { redirect } from 'next/navigation';

export default function TechPage() {
  // Redirect to the tech dashboard
  redirect('/tech/dashboard');
}