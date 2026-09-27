import Link from "next/link";
import { ArrowLeft, ExternalLink, MonitorSmartphone, Smartphone } from "lucide-react";

import { getProduct } from "@/data/products";

export default function CondoFlowAccessPage() {
  const product = getProduct("condoflow");

  if (!product?.accessUrl) return null;

  return (
    <main className="min-h-screen bg-[#050914] px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <Link href="/produtos/condoflow" className="inline-flex items-center gap-2 text-sm text-white/50 transition hover:text-white">
          <ArrowLeft size={16} /> Voltar ao CondoFlow
        </Link>

        <div className="mt-20">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/60">CondoFlow × Orbitta</p>
          <h1 className="mt-5 text-5xl font-semibold tracking-[-0.05em] sm:text-7xl">Acesse o CondoFlow.</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/45">
            Escolha como deseja usar o produto. Login, cadastro de morador e administração acontecem dentro do próprio CondoFlow.
          </p>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-2">
          <a href={product.accessUrl} target="_blank" rel="noopener noreferrer" className="group rounded-[28px] border border-white/[0.08] bg-[#08101d] p-8 transition hover:border-cyan-300/30">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-300/[0.08] text-cyan-200"><MonitorSmartphone size={26} /></div>
            <h2 className="mt-8 text-2xl font-semibold">Abrir no navegador</h2>
            <p className="mt-3 text-sm leading-6 text-white/40">Para computador, Mac, iPhone e iPad. Não precisa instalar.</p>
            <span className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-cyan-200">Acessar CondoFlow <ExternalLink size={15} /></span>
          </a>

          <div className="rounded-[28px] border border-white/[0.08] bg-[#08101d] p-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-300/[0.08] text-violet-200"><Smartphone size={26} /></div>
            <h2 className="mt-8 text-2xl font-semibold">Android</h2>
            <p className="mt-3 text-sm leading-6 text-white/40">Aplicativo CondoFlow para Android.</p>
            {product.androidUrl ? (
              <a href={product.androidUrl} className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-violet-200">Baixar aplicativo <ExternalLink size={15} /></a>
            ) : (
              <span className="mt-8 inline-flex text-sm font-semibold text-white/30">Download em preparação</span>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
