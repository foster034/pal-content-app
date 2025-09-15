import { FranchiseeSidebar } from './components/FranchiseeSidebar';
import { TableProvider } from '@/contexts/table-context';

export default function FranchiseeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TableProvider>
      <FranchiseeSidebar>
        {children}
      </FranchiseeSidebar>
    </TableProvider>
  );
}