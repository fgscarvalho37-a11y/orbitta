"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { resolveClientEntryDestination } from "@/lib/clientEntry";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/i18n/LanguageProvider";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Orbit,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const API_URL = "/backend";

export default function LoginPage() {
  const router = useRouter();

  const {
    text,
  } = useLanguage();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [returnUrl, setReturnUrl] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedReturnUrl = params.get("returnUrl");

    if (
      requestedReturnUrl &&
      requestedReturnUrl.startsWith("/") &&
      !requestedReturnUrl.startsWith("//")
    ) {
      setReturnUrl(requestedReturnUrl);
    }
  }, []);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (loading) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/api/auth/login`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          credentials: "include",

          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      const data = await response
        .json()
        .catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            text("Não foi possível entrar na sua conta.", "We could not sign you in.")
        );
      }

      const params =
        new URLSearchParams(
          window.location.search
        );

      const requestedReturnUrl =
        params.get(
          "returnUrl"
        );

      const safeReturnUrl =
        requestedReturnUrl &&
        requestedReturnUrl.startsWith("/") &&
        !requestedReturnUrl.startsWith("//")
          ? requestedReturnUrl
          : returnUrl;

      const role =
        data?.role === "ADMIN"
          ? "ADMIN"
          : "CLIENT";

      const returnUrlMatchesRole =
        role === "ADMIN"
          ? Boolean(
              safeReturnUrl?.startsWith(
                "/admin"
              )
            )
          : Boolean(
              safeReturnUrl &&
              !safeReturnUrl.startsWith(
                "/admin"
              )
            );

      const destination =
        returnUrlMatchesRole &&
        safeReturnUrl
          ? safeReturnUrl
          : role === "ADMIN"
            ? "/admin"
            : await resolveClientEntryDestination();

      router.replace(destination);
      router.refresh();
    } catch (error) {
      if (error instanceof TypeError) {
        setError(
          text("Não foi possível conectar ao servidor da Orbitta.", "We could not connect to the Orbitta server.")
        );
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(
          text("Ocorreu um erro inesperado. Tente novamente.", "An unexpected error occurred. Please try again.")
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050914] text-white">
      {/* BACKGROUND */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-20%] top-[-30%] h-[700px] w-[700px] rounded-full bg-violet-500/[0.08] blur-[140px]" />

        <div className="absolute bottom-[-30%] right-[-15%] h-[700px] w-[700px] rounded-full bg-cyan-400/[0.08] blur-[140px]" />

        <div className="orbitta-grid absolute inset-0 opacity-20" />
      </div>

      {/* HEADER */}
      <header className="relative z-20">
        <div className="mx-auto flex h-20 max-w-[1500px] items-center justify-between px-6 lg:px-10">
          <Link
            href="/"
            className="group flex items-center gap-3 text-sm text-white/45 transition hover:text-white"
          >
            <ArrowLeft
              size={16}
              className="transition-transform group-hover:-translate-x-1"
            />

            {text("Voltar para Orbitta", "Back to Orbitta")}
          </Link>

          <div className="flex items-center gap-3">
            <LanguageSwitcher compact />

            <div className="hidden items-center gap-2 text-xs text-white/25 sm:flex">
              <ShieldCheck size={14} />
              {text("Ambiente Orbitta", "Orbitta environment")}
            </div>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <section className="relative z-10 mx-auto grid min-h-[calc(100vh-80px)] max-w-[1500px] items-center gap-16 px-6 pb-12 lg:grid-cols-[1.05fr_0.95fr] lg:px-10">
        {/* LEFT */}
        <motion.div
          initial={{
            opacity: 0,
            x: -35,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            duration: 0.8,
          }}
          className="hidden lg:block"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.06] text-cyan-200">
              <Orbit size={22} />
            </div>

            <div>
              <div className="text-lg font-semibold tracking-[-0.03em]">
                orbitta
              </div>

              <div className="text-[9px] uppercase tracking-[0.35em] text-white/25">
                space
              </div>
            </div>
          </div>

          <div className="mt-14 max-w-[650px]">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-cyan-300/55">
              <Sparkles size={13} />
              {text("Espaço do cliente Orbitta", "Orbitta Client Space")}
            </div>

            <h1 className="mt-7 text-[clamp(4rem,6vw,6.5rem)] font-semibold leading-[0.88] tracking-[-0.07em]">
              {text("Seu espaço.", "Your space.")}

              <span className="block bg-gradient-to-r from-cyan-300 via-cyan-200 to-violet-400 bg-clip-text text-transparent">
                {text("Seus produtos.", "Your products.")}
              </span>
            </h1>

            <p className="mt-8 max-w-lg text-lg leading-8 text-white/40">
              {text(
                "Gerencie os produtos e serviços da Orbitta vinculados à sua empresa em um único ambiente.",
                "Manage the Orbitta products and services linked to your business in one place."
              )}
            </p>
          </div>

          {/* FEATURES */}
          <div className="mt-14 grid max-w-[620px] grid-cols-2 gap-3">
            {[
              text("Produtos contratados", "Purchased products"),
              text("Assinaturas e renovações", "Subscriptions and renewals"),
              text("Pagamentos e faturas", "Payments and invoices"),
              text("Domínios e serviços", "Domains and services"),
            ].map((feature, index) => (
              <motion.div
                key={feature}
                initial={{
                  opacity: 0,
                  y: 15,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.25 + index * 0.08,
                }}
                className="flex items-center gap-3 rounded-2xl border border-white/[0.05] bg-white/[0.02] px-4 py-4 text-sm text-white/40"
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-300/[0.07] text-cyan-200/60">
                  <Check size={12} />
                </div>

                {feature}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* LOGIN SIDE */}
        <motion.div
          initial={{
            opacity: 0,
            y: 25,
            scale: 0.985,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          transition={{
            duration: 0.7,
            delay: 0.1,
          }}
          className="mx-auto w-full max-w-[520px] lg:mx-0 lg:justify-self-end"
        >
          {/* MOBILE LOGO */}
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-300/15 bg-cyan-300/[0.06] text-cyan-200">
              <Orbit size={20} />
            </div>

            <div>
              <div className="font-semibold">
                orbitta
              </div>

              <div className="text-[8px] uppercase tracking-[0.3em] text-white/25">
                space
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[32px] border border-white/[0.08] bg-[#08101d]/85 p-6 shadow-[0_40px_120px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-9 lg:p-10">
            {/* CARD GLOW */}
            <div className="pointer-events-none absolute -right-24 -top-24 h-60 w-60 rounded-full bg-cyan-400/[0.07] blur-[80px]" />

            <div className="relative">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.23em] text-cyan-300/50">
                    {text("Área do cliente", "Client area")}
                  </p>

                  <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                    {text("Bem-vindo de volta.", "Welcome back.")}
                  </h2>
                </div>

                <div className="hidden h-11 w-11 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.025] text-white/35 sm:flex">
                  <LockKeyhole size={18} />
                </div>
              </div>

              <p className="mt-4 text-sm leading-6 text-white/35">
                {text(
                  "Entre com a conta vinculada aos seus serviços Orbitta.",
                  "Sign in with the account linked to your Orbitta services."
                )}
              </p>

              {/* ERROR */}
              {error && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: -6,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  className="mt-6 flex gap-3 rounded-2xl border border-red-300/[0.1] bg-red-300/[0.04] p-4"
                >
                  <AlertCircle
                    size={17}
                    className="mt-0.5 shrink-0 text-red-300/70"
                  />

                  <p className="text-xs leading-5 text-red-100/60">
                    {error}
                  </p>
                </motion.div>
              )}

              {/* FORM */}
              <form
                onSubmit={handleSubmit}
                className="mt-9"
              >
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2.5 block text-xs font-medium text-white/45"
                  >
                    E-mail
                  </label>

                  <div className="group relative">
                    <Mail
                      size={17}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/25 transition group-focus-within:text-cyan-300/70"
                    />

                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      required
                      disabled={loading}
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value);

                        if (error) {
                          setError("");
                        }
                      }}
                      placeholder="voce@empresa.com"
                      className="h-14 w-full rounded-2xl border border-white/[0.07] bg-white/[0.025] pl-12 pr-4 text-sm text-white outline-none transition placeholder:text-white/15 hover:border-white/[0.1] focus:border-cyan-300/25 focus:bg-cyan-300/[0.025] focus:ring-4 focus:ring-cyan-300/[0.025] disabled:cursor-wait disabled:opacity-60"
                    />
                  </div>
                </div>

                <div className="mt-5">
                  <div className="mb-2.5 flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="text-xs font-medium text-white/45"
                    >
                      {text("Senha", "Password")}
                    </label>

                    <Link
                      href="/recuperar-senha"
                      className="text-xs text-cyan-300/50 transition hover:text-cyan-200"
                    >
                      {text("Esqueci minha senha", "Forgot password")}
                    </Link>
                  </div>

                  <div className="group relative">
                    <LockKeyhole
                      size={17}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/25 transition group-focus-within:text-cyan-300/70"
                    />

                    <input
                      id="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      autoComplete="current-password"
                      required
                      disabled={loading}
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value);

                        if (error) {
                          setError("");
                        }
                      }}
                      placeholder={text("Sua senha", "Your password")}
                      className="h-14 w-full rounded-2xl border border-white/[0.07] bg-white/[0.025] pl-12 pr-12 text-sm text-white outline-none transition placeholder:text-white/15 hover:border-white/[0.1] focus:border-cyan-300/25 focus:bg-cyan-300/[0.025] focus:ring-4 focus:ring-cyan-300/[0.025] disabled:cursor-wait disabled:opacity-60"
                    />

                    <button
                      type="button"
                      disabled={loading}
                      onClick={() =>
                        setShowPassword(
                          (current) => !current
                        )
                      }
                      aria-label={
                        showPassword
                          ? text("Ocultar senha", "Hide password")
                          : text("Mostrar senha", "Show password")
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 transition hover:text-white/60 disabled:opacity-30"
                    >
                      {showPassword ? (
                        <EyeOff size={17} />
                      ) : (
                        <Eye size={17} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-3">
                  <input
                    id="remember"
                    type="checkbox"
                    className="h-4 w-4 accent-cyan-300"
                  />

                  <label
                    htmlFor="remember"
                    className="cursor-pointer text-xs text-white/30"
                  >
                    {text("Manter minha sessão neste dispositivo", "Keep me signed in on this device")}
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="group mt-8 flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-white text-sm font-semibold text-[#07101c] transition hover:scale-[1.01] hover:bg-cyan-50 disabled:cursor-wait disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#07101c]/20 border-t-[#07101c]" />

                      {text("Entrando...", "Signing in...")}
                    </>
                  ) : (
                    <>
                      {text("Entrar na minha conta", "Sign in to my account")}

                      <ArrowRight
                        size={16}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center text-xs text-white/30">
                {text("Ainda não tem conta?", "Don't have an account yet?")}{" "}
                <Link
                  href={
                    returnUrl
                      ? `/cadastro?returnUrl=${encodeURIComponent(returnUrl)}`
                      : "/cadastro"
                  }
                  className="text-cyan-300/70 transition hover:text-cyan-200"
                >
                  {text("Criar conta", "Create account")}
                </Link>
              </div>

              {/* DIVIDER */}
              <div className="my-8 flex items-center gap-4">
                <div className="h-px flex-1 bg-white/[0.05]" />

                <span className="text-[10px] uppercase tracking-[0.2em] text-white/15">
                  Orbitta Space
                </span>

                <div className="h-px flex-1 bg-white/[0.05]" />
              </div>

              <div className="rounded-2xl border border-white/[0.05] bg-white/[0.018] p-4">
                <div className="flex gap-3">
                  <ShieldCheck
                    size={17}
                    className="mt-0.5 shrink-0 text-cyan-300/45"
                  />

                  <p className="text-xs leading-5 text-white/25">
                    {text(
                      "O acesso à área do cliente é disponibilizado para contas vinculadas a produtos ou serviços contratados com a Orbitta.",
                      "Client-area access is available to accounts linked to Orbitta products or services."
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-white/20">
            <LockKeyhole size={12} />
            {text("Acesso seguro à plataforma Orbitta", "Secure access to the Orbitta platform")}
          </div>
        </motion.div>
      </section>
    </main>
  );
}