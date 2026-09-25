"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  Bell,
  Building2,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LockKeyhole,
  Mail,
  Monitor,
  Save,
  ShieldCheck,
  Smartphone,
  UserRound,
} from "lucide-react";

type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  role: "CLIENT" | "ADMIN";
  active: boolean;
  createdAt: string;
};

type ToggleProps = {
  enabled: boolean;
};

const API_URL = "/backend";

function Toggle({ enabled }: ToggleProps) {
  return (
    <button
      type="button"
      disabled
      aria-disabled="true"
      className={`relative h-6 w-11 cursor-not-allowed rounded-full border opacity-60 ${
        enabled
          ? "border-cyan-300/15 bg-cyan-300/15"
          : "border-white/[0.07] bg-white/[0.035]"
      }`}
    >
      <span
        className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full ${
          enabled
            ? "left-[22px] bg-cyan-200"
            : "left-[3px] bg-white/30"
        }`}
      />
    </button>
  );
}

export default function ConfiguracoesPage() {
  const [user, setUser] = useState<User | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [changingPassword, setChangingPassword] =
    useState(false);

  const [passwordChanged, setPasswordChanged] =
    useState(false);

  const [passwordError, setPasswordError] =
    useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `${API_URL}/api/auth/me`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
            headers: {
              Accept: "application/json",
            },
          }
        );

        if (
          response.status === 401 ||
          response.status === 403
        ) {
          window.location.href = "/login";
          return;
        }

        if (!response.ok) {
          throw new Error(
            `Erro ao carregar perfil: ${response.status}`
          );
        }

        const data: User = await response.json();

        if (cancelled) {
          return;
        }

        setUser(data);
        setFirstName(data.firstName ?? "");
        setLastName(data.lastName ?? "");
        setPhone(data.phone ?? "");
      } catch (err) {
        console.error(err);

        if (!cancelled) {
          setError(
            "Não foi possível carregar os dados da sua conta."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadUser();

    return () => {
      cancelled = true;
    };
  }, []);

  const initials = useMemo(() => {
    const first =
      firstName.trim().charAt(0).toUpperCase();

    const last =
      lastName.trim().charAt(0).toUpperCase();

    return `${first}${last}` || "OR";
  }, [firstName, lastName]);

  const fullName = useMemo(() => {
    return `${firstName.trim()} ${lastName.trim()}`.trim();
  }, [firstName, lastName]);

  const accountId = useMemo(() => {
    if (!user) {
      return "—";
    }

    return `ORB-ACC-${String(user.id).padStart(
      4,
      "0"
    )}`;
  }, [user]);

  async function handleSave(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (saving) {
      return;
    }

    const normalizedFirstName =
      firstName.trim();

    const normalizedLastName =
      lastName.trim();

    if (!normalizedFirstName) {
      setError("Informe seu nome.");
      return;
    }

    if (!normalizedLastName) {
      setError("Informe seu sobrenome.");
      return;
    }

    try {
      setSaving(true);
      setSaved(false);
      setError(null);

      const response = await fetch(
        `${API_URL}/api/auth/profile`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            firstName: normalizedFirstName,
            lastName: normalizedLastName,
            phone: phone.trim() || null,
          }),
        }
      );

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        window.location.href = "/login";
        return;
      }

      const data = await response
        .json()
        .catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ??
            "Não foi possível salvar as alterações."
        );
      }

      const updatedUser = data as User;

      setUser(updatedUser);
      setFirstName(updatedUser.firstName);
      setLastName(updatedUser.lastName);
      setPhone(updatedUser.phone ?? "");

      setSaved(true);

      window.setTimeout(() => {
        setSaved(false);
      }, 2200);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível salvar as alterações."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (changingPassword) {
      return;
    }

    setPasswordError(null);
    setPasswordChanged(false);

    if (!currentPassword) {
      setPasswordError("Informe sua senha atual.");
      return;
    }

    if (!newPassword) {
      setPasswordError("Informe a nova senha.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError(
        "A nova senha deve possuir pelo menos 8 caracteres."
      );
      return;
    }

    if (newPassword.length > 72) {
      setPasswordError(
        "A nova senha deve possuir no máximo 72 caracteres."
      );
      return;
    }

    if (newPassword === currentPassword) {
      setPasswordError(
        "A nova senha deve ser diferente da senha atual."
      );
      return;
    }

    if (!confirmPassword) {
      setPasswordError("Confirme a nova senha.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(
        "A confirmação da nova senha não confere."
      );
      return;
    }

    try {
      setChangingPassword(true);

      const response = await fetch(
        `${API_URL}/api/auth/password`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        }
      );

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        window.location.href = "/login";
        return;
      }

      const data = await response
        .json()
        .catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ??
            "Não foi possível alterar a senha."
        );
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);

      setPasswordChanged(true);

      window.setTimeout(() => {
        setPasswordChanged(false);
      }, 3000);
    } catch (err) {
      console.error(err);

      setPasswordError(
        err instanceof Error
          ? err.message
          : "Não foi possível alterar a senha."
      );
    } finally {
      setChangingPassword(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex items-center gap-3 text-xs text-white/30">
          <Loader2
            size={16}
            className="animate-spin"
          />

          Carregando configurações...
        </div>
      </div>
    );
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
              Gerencie seus dados, informações da empresa,
              segurança e preferências da conta Orbitta.
            </p>
          </div>

          <div className="flex w-fit items-center gap-2 rounded-full border border-emerald-300/[0.07] bg-emerald-300/[0.03] px-4 py-2 text-[10px] text-emerald-200/45">
            <ShieldCheck size={13} />
            Conta protegida
          </div>
        </motion.section>

        {error ? (
          <div className="mt-6 rounded-xl border border-red-300/[0.08] bg-red-300/[0.035] px-4 py-3 text-xs text-red-200/60">
            {error}
          </div>
        ) : null}

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
            <div className="flex flex-col justify-between gap-5 border-b border-white/[0.05] p-6 sm:flex-row sm:items-center">
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
                  {initials}
                </div>

                <div>
                  <div className="text-xs text-white/55">
                    {fullName || "Usuário Orbitta"}
                  </div>

                  <div className="mt-1 text-[9px] text-white/20">
                    {user?.role === "ADMIN"
                      ? "Administrador"
                      : "Cliente Orbitta"}
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
                  value={firstName}
                  onChange={(event) =>
                    setFirstName(event.target.value)
                  }
                  autoComplete="given-name"
                  className="mt-2 h-11 w-full rounded-xl border border-white/[0.06] bg-[#0b1524] px-4 text-xs text-white/60 outline-none transition focus:border-cyan-300/15"
                />
              </label>

              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.12em] text-white/25">
                  Sobrenome
                </span>

                <input
                  type="text"
                  value={lastName}
                  onChange={(event) =>
                    setLastName(event.target.value)
                  }
                  autoComplete="family-name"
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
                    value={user?.email ?? ""}
                    readOnly
                    autoComplete="email"
                    className="h-11 w-full cursor-not-allowed rounded-xl border border-white/[0.05] bg-[#09111e] pl-11 pr-4 text-xs text-white/35 outline-none"
                  />
                </div>

                <span className="mt-2 block text-[9px] text-white/15">
                  A alteração do e-mail será disponibilizada
                  posteriormente.
                </span>
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
                    value={phone}
                    onChange={(event) =>
                      setPhone(event.target.value)
                    }
                    placeholder="(00) 00000-0000"
                    autoComplete="tel"
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
            <div className="flex items-start justify-between gap-5 border-b border-white/[0.05] p-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-medium text-white/60">
                  <Building2 size={14} />
                  Empresa
                </div>

                <p className="mt-1 text-[10px] text-white/20">
                  Informações da organização vinculada aos
                  produtos
                </p>
              </div>

              <span className="rounded-full border border-white/[0.05] bg-white/[0.02] px-3 py-1.5 text-[8px] uppercase tracking-wider text-white/20">
                Em desenvolvimento
              </span>
            </div>

            <div className="grid gap-5 p-6 opacity-50 sm:grid-cols-2">
              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.12em] text-white/25">
                  Nome da empresa
                </span>

                <input
                  disabled
                  type="text"
                  placeholder="Nome da empresa"
                  className="mt-2 h-11 w-full cursor-not-allowed rounded-xl border border-white/[0.06] bg-[#0b1524] px-4 text-xs text-white/60 outline-none placeholder:text-white/15"
                />
              </label>

              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.12em] text-white/25">
                  Documento
                </span>

                <input
                  disabled
                  type="text"
                  placeholder="CPF ou CNPJ"
                  className="mt-2 h-11 w-full cursor-not-allowed rounded-xl border border-white/[0.06] bg-[#0b1524] px-4 text-xs text-white/60 outline-none placeholder:text-white/15"
                />
              </label>

              <label className="block sm:col-span-2">
                <span className="text-[10px] uppercase tracking-[0.12em] text-white/25">
                  E-mail financeiro
                </span>

                <input
                  disabled
                  type="email"
                  placeholder="financeiro@empresa.com"
                  className="mt-2 h-11 w-full cursor-not-allowed rounded-xl border border-white/[0.06] bg-[#0b1524] px-4 text-xs text-white/60 outline-none placeholder:text-white/15"
                />
              </label>
            </div>
          </motion.section>

          {/* NOTIFICATIONS */}

          <section className="mt-5 grid gap-5 xl:grid-cols-2">
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
              <div className="flex items-start justify-between gap-4 border-b border-white/[0.05] p-6">
                <div>
                  <div className="flex items-center gap-2 text-xs font-medium text-white/60">
                    <Bell size={14} />
                    Notificações
                  </div>

                  <p className="mt-1 text-[10px] text-white/20">
                    Escolha quais atualizações deseja receber
                  </p>
                </div>

                <span className="text-[8px] uppercase tracking-wider text-white/15">
                  Em breve
                </span>
              </div>

              <div className="divide-y divide-white/[0.04]">
                {[
                  [
                    "Financeiro",
                    "Cobranças, pagamentos e faturas.",
                  ],
                  [
                    "Produtos",
                    "Atualizações relacionadas aos seus sistemas.",
                  ],
                  [
                    "Suporte",
                    "Respostas e alterações nos chamados.",
                  ],
                  [
                    "Segurança",
                    "Alertas importantes relacionados à conta.",
                  ],
                ].map(([title, description]) => (
                  <div
                    key={title}
                    className="flex items-center justify-between gap-5 p-5"
                  >
                    <div>
                      <div className="text-xs text-white/50">
                        {title}
                      </div>

                      <p className="mt-1 text-[10px] leading-5 text-white/20">
                        {description}
                      </p>
                    </div>

                    <Toggle enabled />
                  </div>
                ))}
              </div>
            </motion.article>

            {/* SECURITY PLACEHOLDER */}

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
              <div className="flex items-start justify-between gap-4 border-b border-white/[0.05] p-6">
                <div>
                  <div className="flex items-center gap-2 text-xs font-medium text-white/60">
                    <LockKeyhole size={14} />
                    Segurança
                  </div>

                  <p className="mt-1 text-[10px] text-white/20">
                    Senha e proteção da conta
                  </p>
                </div>

                <span className="rounded-full border border-emerald-300/[0.07] bg-emerald-300/[0.03] px-3 py-1.5 text-[8px] uppercase tracking-wider text-emerald-200/40">
                  Ativo
                </span>
              </div>

              <div className="p-6">
                <div className="rounded-xl border border-white/[0.05] bg-white/[0.015] p-4">
                  <div className="flex gap-3">
                    <ShieldCheck
                      size={15}
                      className="mt-0.5 shrink-0 text-emerald-200/40"
                    />

                    <div>
                      <div className="text-xs text-white/45">
                        Alteração de senha disponível
                      </div>

                      <p className="mt-1 text-[10px] leading-5 text-white/20">
                        Para sua segurança, será necessário
                        informar a senha atual antes de definir
                        uma nova credencial.
                      </p>
                    </div>
                  </div>
                </div>

                <p className="mt-5 text-[10px] leading-5 text-white/20">
                  A nova senha deve possuir pelo menos 8
                  caracteres e ser diferente da senha atual.
                </p>
              </div>
            </motion.article>
          </section>

          {/* SESSION */}

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
                Sessão da conta
              </div>

              <p className="mt-1 text-[10px] text-white/20">
                Informações sobre a autenticação atual
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
                      Sessão autenticada
                    </span>

                    <span className="rounded-full bg-emerald-300/[0.04] px-2 py-1 text-[8px] text-emerald-200/45">
                      Atual
                    </span>
                  </div>

                  <div className="mt-2 text-[10px] text-white/20">
                    Login protegido por sessão Orbitta
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* SAVE PROFILE */}

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
                Alterações do perfil
              </div>

              <p className="mt-1 text-[10px] text-white/20">
                Nome, sobrenome e telefone serão salvos na sua
                conta Orbitta.
              </p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className={`flex h-11 min-w-[180px] items-center justify-center gap-2 rounded-xl px-5 text-xs font-semibold transition disabled:cursor-not-allowed ${
                saved
                  ? "bg-emerald-200 text-[#07101c]"
                  : "bg-white text-[#07101c] hover:bg-cyan-50 disabled:opacity-60"
              }`}
            >
              {saving ? (
                <>
                  <Loader2
                    size={14}
                    className="animate-spin"
                  />
                  Salvando...
                </>
              ) : saved ? (
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

        {/* CHANGE PASSWORD */}

        <motion.form
          onSubmit={handleChangePassword}
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.42,
          }}
          className="mt-5 overflow-hidden rounded-[26px] border border-white/[0.06] bg-[#08101d]/70"
        >
          <div className="flex flex-col justify-between gap-4 border-b border-white/[0.05] p-6 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-white/60">
                <KeyRound size={14} />
                Alterar senha
              </div>

              <p className="mt-1 text-[10px] text-white/20">
                Atualize a senha utilizada para acessar sua
                conta.
              </p>
            </div>

            <div className="flex items-center gap-2 text-[9px] text-emerald-200/35">
              <ShieldCheck size={12} />
              Protegido
            </div>
          </div>

          <div className="grid gap-5 p-6 lg:grid-cols-3">
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
                  type={
                    showCurrentPassword
                      ? "text"
                      : "password"
                  }
                  value={currentPassword}
                  onChange={(event) => {
                    setCurrentPassword(
                      event.target.value
                    );
                    setPasswordError(null);
                    setPasswordChanged(false);
                  }}
                  autoComplete="current-password"
                  placeholder="Sua senha atual"
                  disabled={changingPassword}
                  className="h-11 w-full rounded-xl border border-white/[0.06] bg-[#0b1524] pl-11 pr-12 text-xs text-white/60 outline-none placeholder:text-white/15 transition focus:border-cyan-300/15 disabled:cursor-not-allowed disabled:opacity-50"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowCurrentPassword(
                      (value) => !value
                    )
                  }
                  disabled={changingPassword}
                  aria-label={
                    showCurrentPassword
                      ? "Ocultar senha atual"
                      : "Mostrar senha atual"
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 transition hover:text-white/50 disabled:cursor-not-allowed"
                >
                  {showCurrentPassword ? (
                    <EyeOff size={14} />
                  ) : (
                    <Eye size={14} />
                  )}
                </button>
              </div>
            </label>

            <label className="block">
              <span className="text-[10px] uppercase tracking-[0.12em] text-white/25">
                Nova senha
              </span>

              <div className="relative mt-2">
                <KeyRound
                  size={14}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20"
                />

                <input
                  type={
                    showNewPassword
                      ? "text"
                      : "password"
                  }
                  value={newPassword}
                  onChange={(event) => {
                    setNewPassword(event.target.value);
                    setPasswordError(null);
                    setPasswordChanged(false);
                  }}
                  autoComplete="new-password"
                  placeholder="Mínimo de 8 caracteres"
                  disabled={changingPassword}
                  className="h-11 w-full rounded-xl border border-white/[0.06] bg-[#0b1524] pl-11 pr-12 text-xs text-white/60 outline-none placeholder:text-white/15 transition focus:border-cyan-300/15 disabled:cursor-not-allowed disabled:opacity-50"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowNewPassword(
                      (value) => !value
                    )
                  }
                  disabled={changingPassword}
                  aria-label={
                    showNewPassword
                      ? "Ocultar nova senha"
                      : "Mostrar nova senha"
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 transition hover:text-white/50 disabled:cursor-not-allowed"
                >
                  {showNewPassword ? (
                    <EyeOff size={14} />
                  ) : (
                    <Eye size={14} />
                  )}
                </button>
              </div>
            </label>

            <label className="block">
              <span className="text-[10px] uppercase tracking-[0.12em] text-white/25">
                Confirmar nova senha
              </span>

              <div className="relative mt-2">
                <KeyRound
                  size={14}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20"
                />

                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  value={confirmPassword}
                  onChange={(event) => {
                    setConfirmPassword(
                      event.target.value
                    );
                    setPasswordError(null);
                    setPasswordChanged(false);
                  }}
                  autoComplete="new-password"
                  placeholder="Repita a nova senha"
                  disabled={changingPassword}
                  className="h-11 w-full rounded-xl border border-white/[0.06] bg-[#0b1524] pl-11 pr-12 text-xs text-white/60 outline-none placeholder:text-white/15 transition focus:border-cyan-300/15 disabled:cursor-not-allowed disabled:opacity-50"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      (value) => !value
                    )
                  }
                  disabled={changingPassword}
                  aria-label={
                    showConfirmPassword
                      ? "Ocultar confirmação"
                      : "Mostrar confirmação"
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 transition hover:text-white/50 disabled:cursor-not-allowed"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={14} />
                  ) : (
                    <Eye size={14} />
                  )}
                </button>
              </div>
            </label>
          </div>

          <div className="border-t border-white/[0.05] px-6 py-5">
            {passwordError ? (
              <div className="mb-4 rounded-xl border border-red-300/[0.08] bg-red-300/[0.035] px-4 py-3 text-[10px] text-red-200/60">
                {passwordError}
              </div>
            ) : null}

            {passwordChanged ? (
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-300/[0.08] bg-emerald-300/[0.035] px-4 py-3 text-[10px] text-emerald-200/60">
                <CheckCircle2 size={13} />
                Senha alterada com sucesso.
              </div>
            ) : null}

            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div className="text-[10px] leading-5 text-white/20">
                Use uma senha diferente da atual com pelo menos
                8 caracteres.
              </div>

              <button
                type="submit"
                disabled={changingPassword}
                className={`flex h-11 min-w-[180px] items-center justify-center gap-2 rounded-xl px-5 text-xs font-semibold transition disabled:cursor-not-allowed ${
                  passwordChanged
                    ? "bg-emerald-200 text-[#07101c]"
                    : "bg-white text-[#07101c] hover:bg-cyan-50 disabled:opacity-60"
                }`}
              >
                {changingPassword ? (
                  <>
                    <Loader2
                      size={14}
                      className="animate-spin"
                    />
                    Alterando...
                  </>
                ) : passwordChanged ? (
                  <>
                    <Check size={14} />
                    Senha alterada
                  </>
                ) : (
                  <>
                    <KeyRound size={14} />
                    Alterar senha
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.form>

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
                {accountId}
              </div>
            </div>

            <div
              className={`flex items-center gap-2 text-[10px] ${
                user?.active
                  ? "text-emerald-200/35"
                  : "text-red-200/40"
              }`}
            >
              <CheckCircle2 size={11} />

              {user?.active
                ? "Conta ativa"
                : "Conta inativa"}
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