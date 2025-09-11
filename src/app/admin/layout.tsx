import { AdminSidebar } from './components/AdminSidebar';
import { TableProvider } from '@/contexts/table-context';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TableProvider>
      <AdminSidebar>
        {children}
      </AdminSidebar>
    </TableProvider>
  );
}