import { getCurrentUser } from "@/lib/auth";
import { AppSidebar } from "./AppSidebar";

export async function AppLayout({ children }: { children: React.ReactNode }) {
  const me = await getCurrentUser();
  const meView = me
    ? {
        id: me.id,
        username: me.username,
        name: me.name,
        email: me.email,
        avatarUrl: me.avatarUrl,
        emailVerifiedAt: me.emailVerifiedAt
      }
    : null;
  return (
    <div className="relative min-h-screen bg-parchment lg:flex">
      <AppSidebar me={meView} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
