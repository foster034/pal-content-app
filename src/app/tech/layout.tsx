import { TechSidebar } from './components/TechSidebar';

export default function TechLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TechSidebar>
      {children}
    </TechSidebar>
  );
}