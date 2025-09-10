import { FranchiseeSidebar } from './components/FranchiseeSidebar';

export default function FranchiseeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FranchiseeSidebar>
      {children}
    </FranchiseeSidebar>
  );
}