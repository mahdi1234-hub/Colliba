import { getCurrentUser } from "@/lib/auth";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const me = await getCurrentUser();
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader me={me ? { id: me.id, username: me.username, name: me.name } : null} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
