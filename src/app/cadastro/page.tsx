"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { resolveClientEntryDestination } from "@/lib/clientEntry";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Phone,
  User,
} from "lucide-react";

const API_URL = "/backend";

export default function CadastroPage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
        `${API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim(),
            password,
            phone: phone.trim() || null,
          }),
        }
      );

      const data = await response
        .json()
        .catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Não foi possível criar sua conta."
        );
      }

      const loginResponse = await fetch(
        `${API_URL}/api/auth/login`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      const loginData = await loginResponse
        .json()
        .catch(() => null);

      if (!loginResponse.ok) {
        const loginUrl = returnUrl
          ? `/login?returnUrl=${encodeURIComponent(returnUrl)}`
          : "/login";

        router.replace(loginUrl);
        return;
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

      const destination =
        safeReturnUrl ??
        (loginData?.role === "ADMIN"
          ? "/admin"
          : await resolveClientEntryDestination());

      router.replace(destination);
      router.refresh();
    } catch (error) {
      if (error instanceof TypeError) {
        setError(
          "Não foi possível conectar ao servidor da Orbitta."
        );
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(
          "Ocorreu um erro inesperado."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050914] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-20%] top-[-30%] h-[700px] w-[700px] rounded-full bg-violet-500/[0.08] blur-[140px]" />
        <div className="absolute bottom-[-30%] right-[-15%] h-[700px] w-[700px] rounded-full bg-cyan-400/[0.08] blur-[140px]" />
        <div className="orbitta-grid absolute inset-0 opacity-20" />
      </div>

      <header className="relative z-20">
        <div className="mx-auto flex h-20 max-w-[1200px] items-center px-6 lg:px-10">
          <Link
            href="/"
            className="flex items-center gap-3 text-sm text-white/45 transition hover:text-white"
          >
            <ArrowLeft size={16} />
            Voltar para Orbitta
          </Link>
        </div>
      </header>

      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-80px)] max-w-[1200px] items-center justify-center px-6 pb-12">
        <div className="w-full max-w-[580px] rounded-[32px] border border-white/[0.08] bg-[#08101d]/90 p-7 shadow-[0_40px_120px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-10">
          <p className="text-xs uppercase tracking-[0.23em] text-cyan-300/50">
            Criar conta
          </p>

          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
            Comece na Orbitta.
          </h1>

          <p className="mt-4 text-sm leading-6 text-white/35">
            Crie sua conta para contratar e gerenciar os produtos Orbitta.
          </p>

          {error && (
            <div className="mt-6 flex gap-3 rounded-2xl border border-red-300/[0.1] bg-red-300/[0.04] p-4">
              <AlertCircle
                size={17}
                className="mt-0.5 shrink-0 text-red-300/70"
              />

              <p className="text-xs leading-5 text-red-100/60">
                {error}
              </p>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="mt-8"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2.5 block text-xs text-white/45">
                  Nome
                </label>

                <div className="relative">
                  <User
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20"
                  />

                  <input
                    required
                    value={firstName}
                    onChange={(e) =>
                      setFirstName(e.target.value)
                    }
                    className="h-13 w-full rounded-2xl border border-white/[0.07] bg-white/[0.025] pl-11 pr-4 text-sm outline-none focus:border-cyan-300/25"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2.5 block text-xs text-white/45">
                  Sobrenome
                </label>

                <input
                  required
                  value={lastName}
                  onChange={(e) =>
                    setLastName(e.target.value)
                  }
                  className="h-13 w-full rounded-2xl border border-white/[0.07] bg-white/[0.025] px-4 text-sm outline-none focus:border-cyan-300/25"
                />
              </div>
            </div>

            <div className="mt-5">
              <label className="mb-2.5 block text-xs text-white/45">
                E-mail
              </label>

              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20"
                />

                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  className="h-13 w-full rounded-2xl border border-white/[0.07] bg-white/[0.025] pl-11 pr-4 text-sm outline-none focus:border-cyan-300/25"
                />
              </div>
            </div>

            <div className="mt-5">
              <label className="mb-2.5 block text-xs text-white/45">
                Telefone
              </label>

              <div className="relative">
                <Phone
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20"
                />

                <input
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value)
                  }
                  placeholder="(19) 99999-9999"
                  className="h-13 w-full rounded-2xl border border-white/[0.07] bg-white/[0.025] pl-11 pr-4 text-sm outline-none focus:border-cyan-300/25"
                />
              </div>
            </div>

            <div className="mt-5">
              <label className="mb-2.5 block text-xs text-white/45">
                Senha
              </label>

              <div className="relative">
                <LockKeyhole
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20"
                />

                <input
                  required
                  minLength={8}
                  maxLength={72}
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  className="h-13 w-full rounded-2xl border border-white/[0.07] bg-white/[0.025] pl-11 pr-12 text-sm outline-none focus:border-cyan-300/25"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (current) => !current
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25"
                >
                  {showPassword ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>
              </div>

              <p className="mt-2 text-[10px] text-white/20">
                Mínimo de 8 caracteres.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-8 flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-white text-sm font-semibold text-[#07101c] transition hover:bg-cyan-50 disabled:opacity-60"
            >
              {loading
                ? "Criando conta..."
                : "Criar minha conta"}

              {!loading && (
                <ArrowRight size={16} />
              )}
            </button>
          </form>

          <div className="mt-7 text-center text-xs text-white/30">
            Já possui conta?{" "}
            <Link
              href={
                returnUrl
                  ? `/login?returnUrl=${encodeURIComponent(returnUrl)}`
                  : "/login"
              }
              className="text-cyan-300/70 hover:text-cyan-200"
            >
              Entrar
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}