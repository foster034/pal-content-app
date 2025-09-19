import { TechSidebar } from './components/TechSidebar';
import { TableProvider } from '@/contexts/table-context';

export default function TechLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TableProvider>
      <TechSidebar>
        {children}
      </TechSidebar>
    </TableProvider>
  );
}