"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  CalendarDays,
  Globe2,
  Loader2,
  PackagePlus,
  Save,
  X,
} from "lucide-react";

const API_URL = "/backend";

export type CreatedClientProduct = {
  id: number;
  name: string;
  subtitle: string | null;
  planName: string;
  monthlyPrice: number;
  domain: string | null;
  systemUrl: string | null;
  status: string;
  renewalDate: string | null;
  createdAt: string;
  updatedAt: string;
};

type Props = {
  open: boolean;
  clientId: number;
  onClose: () => void;
  onCreated: (product: CreatedClientProduct) => void;
};

type FormData = {
  name: string;
  subtitle: string;
  planName: string;
  monthlyPrice: string;
  domain: string;
  systemUrl: string;
  renewalDate: string;
};

const emptyForm: FormData = {
  name: "",
  subtitle: "",
  planName: "",
  monthlyPrice: "",
  domain: "",
  systemUrl: "",
  renewalDate: "",
};

export default function CreateClientProductModal({
  open,
  clientId,
  onClose,
  onCreated,
}: Props) {
  const [form, setForm] =
    useState<FormData>(emptyForm);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setForm(emptyForm);
    setError(null);
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(
      event: KeyboardEvent
    ) {
      if (
        event.key === "Escape" &&
        !saving
      ) {
        onClose();
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    const originalOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );

      document.body.style.overflow =
        originalOverflow;
    };
  }, [open, saving, onClose]);

  if (!open) {
    return null;
  }

  function updateField(
    field: keyof FormData,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (saving) {
      return;
    }

    const name =
      form.name.trim();

    const planName =
      form.planName.trim();

    if (!name) {
      setError(
        "Informe o nome do produto."
      );
      return;
    }

    if (!planName) {
      setError(
        "Informe o nome do plano."
      );
      return;
    }

    const normalizedPrice =
      form.monthlyPrice
        .trim()
        .replace(/\s/g, "")
        .replace(",", ".");

    const monthlyPrice =
      Number(normalizedPrice);

    if (
      normalizedPrice === "" ||
      !Number.isFinite(monthlyPrice) ||
      monthlyPrice < 0
    ) {
      setError(
        "Informe uma mensalidade válida."
      );
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const response = await fetch(
        `${API_URL}/api/admin/client-products`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type":
              "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            userId: clientId,
            name,
            subtitle:
              form.subtitle.trim() ||
              null,
            planName,
            monthlyPrice,
            domain:
              form.domain.trim() ||
              null,
            systemUrl:
              form.systemUrl.trim() ||
              null,
            renewalDate:
              form.renewalDate ||
              null,
          }),
        }
      );

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        window.location.href =
          "/login";
        return;
      }

      const responseBody =
        await response
          .json()
          .catch(() => null);

      if (!response.ok) {
        throw new Error(
          responseBody?.message ??
            "Não foi possível criar o produto."
        );
      }

      onCreated(
        responseBody as CreatedClientProduct
      );

      onClose();
    } catch (err) {
      console.error(
        "Erro ao criar produto:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível criar o produto."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        aria-label="Fechar modal"
        onClick={() => {
          if (!saving) {
            onClose();
          }
        }}
        className="absolute inset-0 bg-[#02050b]/80 backdrop-blur-sm"
      />

      <div className="relative z-10 max-h-[92vh] w-full max-w-[720px] overflow-y-auto rounded-[28px] border border-white/[0.08] bg-[#08101d] shadow-2xl shadow-black/40">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/[0.06] bg-[#08101d]/95 px-6 py-5 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-300/10 bg-violet-300/[0.05]">
              <PackagePlus
                size={17}
                className="text-violet-200/70"
              />
            </div>

            <div>
              <h2 className="text-sm font-medium text-white/85">
                Adicionar produto
              </h2>

              <p className="mt-1 text-[10px] text-white/25">
                Vincular ao cliente #{clientId}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.06] text-white/30 transition hover:bg-white/[0.04] hover:text-white/70 disabled:opacity-40"
          >
            <X size={15} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6"
        >
          {error && (
            <div className="mb-6 rounded-2xl border border-red-300/[0.10] bg-red-300/[0.04] px-4 py-3 text-xs text-red-200/75">
              {error}
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <label>
              <span className="text-[10px] uppercase tracking-[0.16em] text-white/30">
                Nome
              </span>

              <input
                type="text"
                value={form.name}
                maxLength={100}
                placeholder="Ex.: PizzaSystem"
                onChange={(event) =>
                  updateField(
                    "name",
                    event.target.value
                  )
                }
                className="mt-2 h-11 w-full rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 text-sm text-white/75 outline-none transition placeholder:text-white/15 focus:border-violet-300/25"
              />
            </label>

            <label>
              <span className="text-[10px] uppercase tracking-[0.16em] text-white/30">
                Plano
              </span>

              <input
                type="text"
                value={form.planName}
                maxLength={80}
                placeholder="Ex.: Business"
                onChange={(event) =>
                  updateField(
                    "planName",
                    event.target.value
                  )
                }
                className="mt-2 h-11 w-full rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 text-sm text-white/75 outline-none transition placeholder:text-white/15 focus:border-violet-300/25"
              />
            </label>

            <label className="sm:col-span-2">
              <span className="text-[10px] uppercase tracking-[0.16em] text-white/30">
                Subtítulo
              </span>

              <input
                type="text"
                value={form.subtitle}
                maxLength={150}
                placeholder="Ex.: Food Commerce Platform"
                onChange={(event) =>
                  updateField(
                    "subtitle",
                    event.target.value
                  )
                }
                className="mt-2 h-11 w-full rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 text-sm text-white/75 outline-none transition placeholder:text-white/15 focus:border-violet-300/25"
              />
            </label>

            <label>
              <span className="text-[10px] uppercase tracking-[0.16em] text-white/30">
                Mensalidade
              </span>

              <div className="relative mt-2">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-white/25">
                  R$
                </span>

                <input
                  type="text"
                  inputMode="decimal"
                  value={
                    form.monthlyPrice
                  }
                  placeholder="79,90"
                  onChange={(event) =>
                    updateField(
                      "monthlyPrice",
                      event.target.value
                    )
                  }
                  className="h-11 w-full rounded-xl border border-white/[0.07] bg-white/[0.025] pl-10 pr-4 text-sm text-white/75 outline-none transition placeholder:text-white/15 focus:border-violet-300/25"
                />
              </div>
            </label>

            <label>
              <span className="text-[10px] uppercase tracking-[0.16em] text-white/30">
                Próxima renovação
              </span>

              <div className="relative mt-2">
                <CalendarDays
                  size={14}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/20"
                />

                <input
                  type="date"
                  value={
                    form.renewalDate
                  }
                  onChange={(event) =>
                    updateField(
                      "renewalDate",
                      event.target.value
                    )
                  }
                  className="h-11 w-full rounded-xl border border-white/[0.07] bg-white/[0.025] pl-10 pr-4 text-sm text-white/70 outline-none transition focus:border-violet-300/25"
                />
              </div>
            </label>

            <label className="sm:col-span-2">
              <span className="text-[10px] uppercase tracking-[0.16em] text-white/30">
                Domínio
              </span>

              <div className="relative mt-2">
                <Globe2
                  size={14}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20"
                />

                <input
                  type="text"
                  value={form.domain}
                  maxLength={255}
                  placeholder="exemplo.com.br"
                  onChange={(event) =>
                    updateField(
                      "domain",
                      event.target.value
                    )
                  }
                  className="h-11 w-full rounded-xl border border-white/[0.07] bg-white/[0.025] pl-10 pr-4 text-sm text-white/75 outline-none transition placeholder:text-white/15 focus:border-violet-300/25"
                />
              </div>
            </label>

            <label className="sm:col-span-2">
              <span className="text-[10px] uppercase tracking-[0.16em] text-white/30">
                URL do sistema
              </span>

              <input
                type="text"
                value={form.systemUrl}
                maxLength={500}
                placeholder="https://..."
                onChange={(event) =>
                  updateField(
                    "systemUrl",
                    event.target.value
                  )
                }
                className="mt-2 h-11 w-full rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 text-sm text-white/75 outline-none transition placeholder:text-white/15 focus:border-violet-300/25"
              />
            </label>
          </div>

          <div className="mt-7 flex flex-col-reverse gap-3 border-t border-white/[0.05] pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="h-10 rounded-xl border border-white/[0.07] px-5 text-xs text-white/35 transition hover:bg-white/[0.04] hover:text-white/65 disabled:opacity-40"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex h-10 items-center justify-center gap-2 rounded-xl border border-violet-300/15 bg-violet-300/[0.08] px-5 text-xs text-violet-100/80 transition hover:bg-violet-300/[0.13] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <Loader2
                  size={14}
                  className="animate-spin"
                />
              ) : (
                <Save size={14} />
              )}

              {saving
                ? "Adicionando..."
                : "Adicionar produto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}