import { prisma } from "@/app/lib/prisma";
import Link from "next/link";

type SearchParams = {
  q?: string;
  level?: string;
  estado?: string;
  rubro?: string;
};

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const params = searchParams ?? {};

  const q = params.q || "";
  const level = params.level || "";
  const estado = params.estado || "";
  const rubro = params.rubro || "";

  const leads = await prisma.lead.findMany({
    where: {
      AND: [
        q
          ? {
              OR: [
                { nombre: { contains: q, mode: "insensitive" } },
                { empresa: { contains: q, mode: "insensitive" } },
                { email: { contains: q, mode: "insensitive" } },
              ],
            }
          : {},
        level ? { leadLevel: level } : {},
        estado ? { estadoComercial: estado } : {},
        rubro ? { rubro } : {},
      ],
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const total = leads.length;
  const calientes = leads.filter((l) => l.leadLevel === "Caliente").length;
  const nuevos = leads.filter((l) => l.estadoComercial === "Nuevo").length;
  const ganados = leads.filter(
    (l) => l.estadoComercial === "Cerrado ganado"
  ).length;

  const rubros = await prisma.lead.findMany({
    select: { rubro: true },
    distinct: ["rubro"],
    orderBy: { rubro: "asc" },
  });

  return (
    <main className="min-h-screen bg-neutral-950 text-white p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold">AON Leads</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Dashboard interno de oportunidades
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6 md:grid-cols-4">
          <div className="bg-neutral-900 p-4 rounded-xl">
            <p className="text-sm text-neutral-400">Total</p>
            <p className="text-xl font-semibold">{total}</p>
          </div>

          <div className="bg-neutral-900 p-4 rounded-xl">
            <p className="text-sm text-neutral-400">Calientes</p>
            <p className="text-xl font-semibold text-green-400">
              {calientes}
            </p>
          </div>

          <div className="bg-neutral-900 p-4 rounded-xl">
            <p className="text-sm text-neutral-400">Nuevos</p>
            <p className="text-xl font-semibold">{nuevos}</p>
          </div>

          <div className="bg-neutral-900 p-4 rounded-xl">
            <p className="text-sm text-neutral-400">Ganados</p>
            <p className="text-xl font-semibold">{ganados}</p>
          </div>
        </div>

        <form className="grid grid-cols-1 gap-3 mb-6 md:grid-cols-5">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Buscar nombre, empresa o email"
            className="rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm"
          />

          <select
            name="level"
            defaultValue={level}
            className="rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm"
          >
            <option value="">Todos los niveles</option>
            <option value="Frío">Frío</option>
            <option value="Medio">Medio</option>
            <option value="Caliente">Caliente</option>
          </select>

          <select
            name="estado"
            defaultValue={estado}
            className="rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm"
          >
            <option value="">Todos los estados</option>
            <option value="Nuevo">Nuevo</option>
            <option value="Contactado">Contactado</option>
            <option value="En conversación">En conversación</option>
            <option value="Calificado">Calificado</option>
            <option value="Cerrado ganado">Cerrado ganado</option>
            <option value="Cerrado perdido">Cerrado perdido</option>
          </select>

          <select
            name="rubro"
            defaultValue={rubro ?? ""}
            className="rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm"
          >
            <option value="">Todos los rubros</option>
           {rubros.map((item, index) => (
            <option key={`${item.rubro ?? "sin-rubro"}-${index}`} value={item.rubro ?? ""}>
            {item.rubro ?? "Sin rubro"}
            </option>
            ))}
          </select>

          <button
            type="submit"
            className="rounded-xl bg-white px-4 py-3 text-sm font-medium text-black"
          >
            Filtrar
          </button>
        </form>

        <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
          <table className="w-full text-sm">
            <thead className="bg-neutral-800/70 text-neutral-300">
              <tr>
                <th className="px-4 py-3 text-left">Fecha</th>
                <th className="px-4 py-3 text-left">Nombre</th>
                <th className="px-4 py-3 text-left">Empresa</th>
                <th className="px-4 py-3 text-left">Rubro</th>
                <th className="px-4 py-3 text-left">Score</th>
                <th className="px-4 py-3 text-left">Nivel</th>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3 text-left">Acción</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-t border-neutral-800">
                  <td className="px-4 py-3 text-neutral-400">
                    {new Date(lead.createdAt).toLocaleDateString("es-PY")}
                  </td>
                  <td className="px-4 py-3">{lead.nombre}</td>
                  <td className="px-4 py-3">{lead.empresa}</td>
                  <td className="px-4 py-3">{lead.rubro}</td>
                  <td className="px-4 py-3">{lead.leadScore}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        lead.leadLevel === "Caliente"
                          ? "text-green-400"
                          : lead.leadLevel === "Medio"
                          ? "text-yellow-400"
                          : "text-neutral-400"
                      }
                    >
                      {lead.leadLevel}
                    </span>
                  </td>
                  <td className="px-4 py-3">{lead.estadoComercial}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/leads/${lead.id}`}
                      className="underline underline-offset-4"
                    >
                      Ver detalle
                    </Link>
                  </td>
                </tr>
              ))}

              {leads.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center text-neutral-400"
                  >
                    No hay leads para mostrar
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}