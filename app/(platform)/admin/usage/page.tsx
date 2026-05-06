import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { AddCreditsButton } from "./AddCreditsButton";

export default async function AdminUsagePage() {
  const authClient = await createServerSupabaseClient();

  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user?.email) redirect("/login");

  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase());

//  if (!adminEmails.includes(user.email.toLowerCase())) {
//    redirect("/agents/accounting/invoice-processor");
//  }

  const supabase = createSupabaseAdminClient();

  const { data: usageRows } = await supabase
    .from("usage_tracking")
    .select("user_id, created_at");

  const { data: limitRows } = await supabase
    .from("usage_limits")
    .select("user_id, monthly_limit, is_blocked");

  const {
    data: { users },
  } = await supabase.auth.admin.listUsers();

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const rows = users.map((authUser) => {
    const userUsage = usageRows?.filter(
      (row) => row.user_id === authUser.id
    ) ?? [];

    const monthlyUsage = userUsage.filter(
      (row) => new Date(row.created_at) >= startOfMonth
    ).length;

    const totalUsage = userUsage.length;

    const limit = limitRows?.find((row) => row.user_id === authUser.id);

    return {
      id: authUser.id,
      email: authUser.email ?? "SIN EMAIL",
      monthlyUsage,
      totalUsage,
      monthlyLimit: limit?.monthly_limit ?? 20,
      isBlocked: limit?.is_blocked ?? false,
    };
  });

  return (
    <div className="min-h-screen bg-[#0B0D12] p-8 text-white">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.28em] text-[#C9A24D]">
          Nexa Core Admin
        </p>
        <h1 className="mt-2 text-3xl font-semibold">
          Consumo de usuarios
        </h1>
        <p className="mt-2 text-sm text-white/55">
          Control mensual e histórico de facturas validadas.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111827]">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-white/[0.04] text-left text-white/60">
            <tr>
              <th className="px-4 py-3">Usuario</th>
              <th className="px-4 py-3">Uso mensual</th>
              <th className="px-4 py-3">Uso histórico</th>
              <th className="px-4 py-3">Límite</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-white/10">
                <td className="px-4 py-3">
                  <p className="font-medium text-white">{row.email}</p>
                  <p className="mt-1 text-xs text-white/35">{row.id}</p>
                </td>
                <td className="px-4 py-3">{row.monthlyUsage}</td>
                <td className="px-4 py-3">{row.totalUsage}</td>
                <td className="px-4 py-3">{row.monthlyLimit}</td>
                <td className="px-4 py-3">
                  {row.isBlocked ? (
                    <span className="text-red-300">Bloqueado</span>
                  ) : (
                    <span className="text-emerald-300">Activo</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <AddCreditsButton userId={row.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}