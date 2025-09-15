import { TechSidebar } from '../tech/components/TechSidebar';

export default function TechHubLayout({
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