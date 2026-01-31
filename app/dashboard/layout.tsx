import { Nav } from "@/components/dashboard/nav";
import { getCurrentProfile } from "@/lib/data/profiles";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <Nav profile={profile} />
      <main className="pl-56">
        <div className="mx-auto max-w-5xl p-6">{children}</div>
      </main>
    </div>
  );
}
