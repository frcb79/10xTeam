import Link from "next/link";
import { actor, getSession } from "@/lib/onboarding/store";
export default async function TeamDiagnostics() {
  const session=await getSession(await actor());
  return <main className="mx-auto max-w-3xl p-8"><h1 className="text-2xl font-semibold">Diagnóstico del negocio seleccionado</h1>
    {session?.diagnostic ? <><p>{session.diagnostic.businessName}</p><Link href={"/api/diagnostics/"+session.diagnostic.id+"/html"}>Abrir diagnóstico</Link></> : <p>Selecciona tu registro y completa el diagnóstico.</p>}
    <p><Link href="/wizard">Continuar el alta</Link></p></main>;
}
