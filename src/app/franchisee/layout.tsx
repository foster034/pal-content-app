import { FranchiseeSidebar } from './components/FranchiseeSidebar';

export default function FranchiseeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <FranchiseeSidebar />
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}