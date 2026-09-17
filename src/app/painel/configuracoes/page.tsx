"use client";

import { useState } from "react";
import { motion } from "motion/react";
import {
  Bell,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  Mail,
  Monitor,
  Save,
  ShieldCheck,
  Smartphone,
  UserRound,
} from "lucide-react";

type ToggleProps = {
  enabled: boolean;
  onChange: () => void;
};

function Toggle({ enabled, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative h-6 w-11 rounded-full border transition ${
        enabled
          ? "border-cyan-300/15 bg-cyan-300/15"
          : "border-white/[0.07] bg-white/[0.035]"
      }`}
    >
      <span
        className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full transition-all ${
          enabled
            ? "left-[22px] bg-cyan-200"
            : "left-[3px] bg-white/30"
        }`}
      />
    </button>
  );
}

export default function ConfiguracoesPage() {
  const [saved, setSaved] = useState(false);

  const [billingEmails, setBillingEmails] = useState(true);
  const [productEmails, setProductEmails] = useState(true);
  const [supportEmails, setSupportEmails] = useState(true);
  const [securityEmails, setSecurityEmails] = useState(true);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2200);
  }

  return (
    <div className="relative overflow-hidden">
      {/* BACKGROUND */}
      <div className="pointer-events-none absolute right-[-200px] top-[-200px] h-[650px] w-[650px] rounded-full bg-violet-500/[0.035] blur-[150px]" />

      <div className="pointer-events-none absolute left-[5%] top-[700px] h-[500px] w-[500px] rounded-full bg-cyan-400/[0.025] blur-[140px]" />

      <div className="relative mx-auto max-w-[1500px] px-5 py-8 sm:px-7 lg:px-10 lg:py-10">
        {/* HEADER */}
        <motion.section
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.55,
          }}
          className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end"
        >
          <div>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-violet-300/50">
              <UserRound size={12} />
              Conta
            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
              Configurações
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/30">
              Gerencie seus dados, informações da empresa, segurança e
              preferências da conta Orbitta.
            </p>
          </div>

          <div className="flex w-fit items-center gap-2 rounded-full border border-emerald-300/[0.07] bg-emerald-300/[0.03] px-4 py-2 text-[10px] text-emerald-200/45">
            <ShieldCheck size={13} />
            Conta protegida
          </div>
        </motion.section>

        <form onSubmit={handleSave}>
          {/* PROFILE */}
          <motion.section
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.08,
            }}
            className="mt-10 overflow-hidden rounded-[28px] border border-white/[0.06] bg-[#08101d]/70"
          >
            <div className="flex flex-col justify-between gap-5 border-b border-white/[0.05] p-6 sm:flex-row sm:items-center"
            >
              <div>
                <div className="flex items-center gap-2 text-xs font-medium text-white/60">
                  <UserRound size={14} />
                  Perfil
                </div>

                <p className="mt-1 text-[10px] text-white/20">
                  Informações utilizadas na sua conta Orbitta
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-cyan-300/[0.08] bg-cyan-300/[0.04] text-sm font-semibold text-cyan-100/65">
                  FG
                </div>

                <div>
                  <div className="text-xs text-white/55">
                    Felipe Gomes
                  </div>

                  <div className="mt-1 text-[9px] text-white/20">
                    Administrador da conta
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-5 p-6 sm:grid-cols-2">
              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.12em] text-white/25">
                  Nome
                </span>

                <input
                  type="text"
                  defaultValue="Felipe"
                  className="mt-2 h-11 w-full rounded-xl border border-white/[0.06] bg-[#0b1524] px-4 text-xs text-white/60 outline-none transition focus:border-cyan-300/15"
                />
              </label>

              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.12em] text-white/25">
                  Sobrenome
                </span>

                <input
                  type="text"
                  defaultValue="Gomes"
                  className="mt-2 h-11 w-full rounded-xl border border-white/[0.06] bg-[#0b1524] px-4 text-xs text-white/60 outline-none transition focus:border-cyan-300/15"
                />
              </label>

              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.12em] text-white/25">
                  E-mail
                </span>

                <div className="relative mt-2">
                  <Mail
                    size={14}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20"
                  />

                  <input
                    type="email"
                    defaultValue="felipe@empresa.com"
                    className="h-11 w-full rounded-xl border border-white/[0.06] bg-[#0b1524] pl-11 pr-4 text-xs text-white/60 outline-none transition focus:border-cyan-300/15"
                  />
                </div>
              </label>

              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.12em] text-white/25">
                  Telefone
                </span>

                <div className="relative mt-2">
                  <Smartphone
                    size={14}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20"
                  />

                  <input
                    type="tel"
                    placeholder="(00) 00000-0000"
                    className="h-11 w-full rounded-xl border border-white/[0.06] bg-[#0b1524] pl-11 pr-4 text-xs text-white/60 outline-none placeholder:text-white/15 transition focus:border-cyan-300/15"
                  />
                </div>
              </label>
            </div>
          </motion.section>

          {/* COMPANY */}
          <motion.section
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.14,
            }}
            className="mt-5 overflow-hidden rounded-[28px] border border-white/[0.06] bg-[#08101d]/70"
          >
            <div className="border-b border-white/[0.05] p-6">
              <div className="flex items-center gap-2 text-xs font-medium text-white/60">
                <Building2 size={14} />
                Empresa
              </div>

              <p className="mt-1 text-[10px] text-white/20">
                Informações da organização vinculada aos produtos
              </p>
            </div>

            <div className="grid gap-5 p-6 sm:grid-cols-2">
              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.12em] text-white/25">
                  Nome da empresa
                </span>

                <input
                  type="text"
                  defaultValue="Pizzaria Exemplo"
                  className="mt-2 h-11 w-full rounded-xl border border-white/[0.06] bg-[#0b1524] px-4 text-xs text-white/60 outline-none transition focus:border-cyan-300/15"
                />
              </label>

              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.12em] text-white/25">
                  Documento
                </span>

                <input
                  type="text"
                  placeholder="CPF ou CNPJ"
                  className="mt-2 h-11 w-full rounded-xl border border-white/[0.06] bg-[#0b1524] px-4 text-xs text-white/60 outline-none placeholder:text-white/15 transition focus:border-cyan-300/15"
                />
              </label>

              <label className="block sm:col-span-2">
                <span className="text-[10px] uppercase tracking-[0.12em] text-white/25">
                  E-mail financeiro
                </span>

                <input
                  type="email"
                  defaultValue="financeiro@empresa.com"
                  className="mt-2 h-11 w-full rounded-xl border border-white/[0.06] bg-[#0b1524] px-4 text-xs text-white/60 outline-none transition focus:border-cyan-300/15"
                />
              </label>
            </div>
          </motion.section>

          {/* NOTIFICATIONS + SECURITY */}
          <section className="mt-5 grid gap-5 xl:grid-cols-2">
            {/* NOTIFICATIONS */}
            <motion.article
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.2,
              }}
              className="overflow-hidden rounded-[26px] border border-white/[0.06] bg-[#08101d]/70"
            >
              <div className="border-b border-white/[0.05] p-6">
                <div className="flex items-center gap-2 text-xs font-medium text-white/60">
                  <Bell size={14} />
                  Notificações
                </div>

                <p className="mt-1 text-[10px] text-white/20">
                  Escolha quais atualizações deseja receber
                </p>
              </div>

              <div className="divide-y divide-white/[0.04]">
                <div className="flex items-center justify-between gap-5 p-5">
                  <div>
                    <div className="text-xs text-white/50">
                      Financeiro
                    </div>

                    <p className="mt-1 text-[10px] leading-5 text-white/20">
                      Cobranças, pagamentos e faturas.
                    </p>
                  </div>

                  <Toggle
                    enabled={billingEmails}
                    onChange={() =>
                      setBillingEmails((current) => !current)
                    }
                  />
                </div>

                <div className="flex items-center justify-between gap-5 p-5">
                  <div>
                    <div className="text-xs text-white/50">
                      Produtos
                    </div>

                    <p className="mt-1 text-[10px] leading-5 text-white/20">
                      Atualizações relacionadas aos seus sistemas.
                    </p>
                  </div>

                  <Toggle
                    enabled={productEmails}
                    onChange={() =>
                      setProductEmails((current) => !current)
                    }
                  />
                </div>

                <div className="flex items-center justify-between gap-5 p-5">
                  <div>
                    <div className="text-xs text-white/50">
                      Suporte
                    </div>

                    <p className="mt-1 text-[10px] leading-5 text-white/20">
                      Respostas e alterações nos chamados.
                    </p>
                  </div>

                  <Toggle
                    enabled={supportEmails}
                    onChange={() =>
                      setSupportEmails((current) => !current)
                    }
                  />
                </div>

                <div className="flex items-center justify-between gap-5 p-5">
                  <div>
                    <div className="text-xs text-white/50">
                      Segurança
                    </div>

                    <p className="mt-1 text-[10px] leading-5 text-white/20">
                      Alertas importantes relacionados à conta.
                    </p>
                  </div>

                  <Toggle
                    enabled={securityEmails}
                    onChange={() =>
                      setSecurityEmails((current) => !current)
                    }
                  />
                </div>
              </div>
            </motion.article>

            {/* SECURITY */}
            <motion.article
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.26,
              }}
              className="overflow-hidden rounded-[26px] border border-white/[0.06] bg-[#08101d]/70"
            >
              <div className="border-b border-white/[0.05] p-6">
                <div className="flex items-center gap-2 text-xs font-medium text-white/60">
                  <LockKeyhole size={14} />
                  Segurança
                </div>

                <p className="mt-1 text-[10px] text-white/20">
                  Senha e proteção da conta
                </p>
              </div>

              <div className="p-6">
                <label className="block">
                  <span className="text-[10px] uppercase tracking-[0.12em] text-white/25">
                    Senha atual
                  </span>

                  <div className="relative mt-2">
                    <KeyRound
                      size={14}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20"
                    />

                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      placeholder="••••••••••••"
                      className="h-11 w-full rounded-xl border border-white/[0.06] bg-[#0b1524] pl-11 pr-12 text-xs text-white/60 outline-none placeholder:text-white/15 transition focus:border-cyan-300/15"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowCurrentPassword((current) => !current)
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 transition hover:text-white/50"
                    >
                      {showCurrentPassword ? (
                        <EyeOff size={14} />
                      ) : (
                        <Eye size={14} />
                      )}
                    </button>
                  </div>
                </label>

                <label className="mt-5 block">
                  <span className="text-[10px] uppercase tracking-[0.12em] text-white/25">
                    Nova senha
                  </span>

                  <div className="relative mt-2">
                    <KeyRound
                      size={14}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20"
                    />

                    <input
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Nova senha"
                      className="h-11 w-full rounded-xl border border-white/[0.06] bg-[#0b1524] pl-11 pr-12 text-xs text-white/60 outline-none placeholder:text-white/15 transition focus:border-cyan-300/15"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowNewPassword((current) => !current)
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 transition hover:text-white/50"
                    >
                      {showNewPassword ? (
                        <EyeOff size={14} />
                      ) : (
                        <Eye size={14} />
                      )}
                    </button>
                  </div>
                </label>

                <div className="mt-6 rounded-xl border border-white/[0.05] bg-white/[0.015] p-4">
                  <div className="flex gap-3">
                    <ShieldCheck
                      size={15}
                      className="mt-0.5 shrink-0 text-emerald-200/40"
                    />

                    <div>
                      <div className="text-xs text-white/45">
                        Proteção da conta
                      </div>

                      <p className="mt-1 text-[10px] leading-5 text-white/20">
                        Quando conectarmos o backend, alterações de senha
                        exigirão validação da senha atual e armazenamento seguro
                        por hash.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.article>
          </section>

          {/* SESSIONS */}
          <motion.section
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.32,
            }}
            className="mt-5 overflow-hidden rounded-[26px] border border-white/[0.06] bg-[#08101d]/70"
          >
            <div className="border-b border-white/[0.05] p-6">
              <div className="flex items-center gap-2 text-xs font-medium text-white/60">
                <Monitor size={14} />
                Sessões da conta
              </div>

              <p className="mt-1 text-[10px] text-white/20">
                Dispositivos conectados à sua conta
              </p>
            </div>

            <div className="flex flex-col justify-between gap-5 p-6 sm:flex-row sm:items-center">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-300/[0.06] bg-emerald-300/[0.03] text-emerald-200/45">
                  <Monitor size={17} />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-white/55">
                      Windows • Chrome
                    </span>

                    <span className="rounded-full bg-emerald-300/[0.04] px-2 py-1 text-[8px] text-emerald-200/45">
                      Sessão atual
                    </span>
                  </div>

                  <div className="mt-2 text-[10px] text-white/20">
                    Jaguariúna, SP • Ativo agora
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="flex w-fit items-center gap-2 text-[10px] text-white/25 transition hover:text-white/55"
              >
                Ver sessões
                <ChevronRight size={12} />
              </button>
            </div>
          </motion.section>

          {/* SAVE */}
          <motion.div
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.38,
            }}
            className="mt-5 flex flex-col justify-between gap-4 rounded-[22px] border border-white/[0.05] bg-white/[0.015] p-5 sm:flex-row sm:items-center"
          >
            <div>
              <div className="text-xs text-white/45">
                Alterações da conta
              </div>

              <p className="mt-1 text-[10px] text-white/20">
                Salve as alterações feitas nas suas informações e preferências.
              </p>
            </div>

            <button
              type="submit"
              className={`flex h-11 min-w-[165px] items-center justify-center gap-2 rounded-xl px-5 text-xs font-semibold transition ${
                saved
                  ? "bg-emerald-200 text-[#07101c]"
                  : "bg-white text-[#07101c] hover:bg-cyan-50"
              }`}
            >
              {saved ? (
                <>
                  <Check size={14} />
                  Alterações salvas
                </>
              ) : (
                <>
                  <Save size={14} />
                  Salvar alterações
                </>
              )}
            </button>
          </motion.div>
        </form>

        {/* ACCOUNT */}
        <motion.section
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            delay: 0.44,
          }}
          className="mt-5 rounded-[22px] border border-white/[0.05] bg-[#08101d]/60 p-5"
        >
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="text-xs text-white/40">
                ID da conta
              </div>

              <div className="mt-1 font-mono text-[10px] text-white/18">
                ORB-ACC-0001
              </div>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-emerald-200/35">
              <CheckCircle2 size={11} />
              Conta ativa
            </div>
          </div>
        </motion.section>

        <div className="mt-8 flex items-center justify-center gap-2 text-[10px] text-white/15">
          <ShieldCheck size={11} />
          Conta protegida pela Orbitta Space
        </div>
      </div>
    </div>
  );
}