"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  CalendarDays,
  Globe2,
  Loader2,
  Package,
  Save,
  X,
} from "lucide-react";

const API_URL = "/backend";

export type EditableClientProduct = {
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
  product: EditableClientProduct | null;
  onClose: () => void;
  onSaved: (
    product: EditableClientProduct
  ) => void;
};

export default function EditClientProductModal({
  open,
  product,
  onClose,
  onSaved,
}: Props) {
  const [name, setName] = useState("");
  const [subtitle, setSubtitle] =
    useState("");

  const [planName, setPlanName] =
    useState("");

  const [monthlyPrice, setMonthlyPrice] =
    useState("");

  const [domain, setDomain] =
    useState("");

  const [systemUrl, setSystemUrl] =
    useState("");

  const [status, setStatus] =
    useState("ACTIVE");

  const [renewalDate, setRenewalDate] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    if (!product || !open) {
      return;
    }

    setName(
      product.name ?? ""
    );

    setSubtitle(
      product.subtitle ?? ""
    );

    setPlanName(
      product.planName ?? ""
    );

    setMonthlyPrice(
      String(
        product.monthlyPrice ?? ""
      ).replace(".", ",")
    );

    setDomain(
      product.domain ?? ""
    );

    setSystemUrl(
      product.systemUrl ?? ""
    );

    setStatus(
      product.status ?? "ACTIVE"
    );

    setRenewalDate(
      product.renewalDate ?? ""
    );

    setError(null);
  }, [
    product,
    open,
  ]);

  if (
    !open ||
    !product
  ) {
    return null;
  }

  const productId =
    product.id;

  async function submit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const price =
      Number(
        monthlyPrice
          .trim()
          .replace(
            ",",
            "."
          )
      );

    if (
      !name.trim() ||
      !planName.trim() ||
      !Number.isFinite(price) ||
      price < 0
    ) {
      setError(
        "Preencha nome, plano e mensalidade corretamente."
      );

      return;
    }

    try {
      setSaving(true);
      setError(null);

      const response =
        await fetch(
          `${API_URL}/api/admin/client-products/${productId}`,
          {
            method: "PUT",
            credentials: "include",

            headers: {
              "Content-Type":
                "application/json",
              Accept:
                "application/json",
            },

            body: JSON.stringify({
              name:
                name.trim(),

              subtitle:
                subtitle.trim() ||
                null,

              planName:
                planName.trim(),

              monthlyPrice:
                price,

              domain:
                domain.trim() ||
                null,

              systemUrl:
                systemUrl.trim() ||
                null,

              status,

              renewalDate:
                renewalDate ||
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

      const body =
        await response
          .json()
          .catch(
            () => null
          );

      if (!response.ok) {
        throw new Error(
          body?.message ??
            "Não foi possível salvar o produto."
        );
      }

      onSaved(
        body as EditableClientProduct
      );

      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível salvar o produto."
      );
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "mt-2 h-11 w-full rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 text-sm text-white/75 outline-none transition focus:border-violet-300/25";

  const labelClass =
    "text-[10px] uppercase tracking-[0.16em] text-white/30";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        aria-label="Fechar modal"
        onClick={() =>
          !saving &&
          onClose()
        }
        className="absolute inset-0 bg-[#02050b]/80 backdrop-blur-sm"
      />

      <div className="relative z-10 max-h-[92vh] w-full max-w-[720px] overflow-y-auto rounded-[28px] border border-white/[0.08] bg-[#08101d] shadow-2xl shadow-black/40">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-300/10 bg-violet-300/[0.05]">
              <Package
                size={17}
                className="text-violet-200/70"
              />
            </div>

            <div>
              <h2 className="text-sm font-medium text-white/85">
                Editar produto
              </h2>

              <p className="mt-1 text-[10px] text-white/25">
                Produto #{productId}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.06] text-white/30"
          >
            <X size={15} />
          </button>
        </div>

        <form
          onSubmit={submit}
          className="p-6"
        >
          {error && (
            <div className="mb-6 rounded-2xl border border-red-300/[0.10] bg-red-300/[0.04] px-4 py-3 text-xs text-red-200/75">
              {error}
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <label>
              <span
                className={
                  labelClass
                }
              >
                Nome
              </span>

              <input
                value={name}
                onChange={(e) =>
                  setName(
                    e.target.value
                  )
                }
                maxLength={100}
                className={
                  inputClass
                }
              />
            </label>

            <label>
              <span
                className={
                  labelClass
                }
              >
                Plano
              </span>

              <input
                value={planName}
                onChange={(e) =>
                  setPlanName(
                    e.target.value
                  )
                }
                maxLength={80}
                className={
                  inputClass
                }
              />
            </label>

            <label className="sm:col-span-2">
              <span
                className={
                  labelClass
                }
              >
                Subtítulo
              </span>

              <input
                value={subtitle}
                onChange={(e) =>
                  setSubtitle(
                    e.target.value
                  )
                }
                maxLength={150}
                className={
                  inputClass
                }
              />
            </label>

            <label>
              <span
                className={
                  labelClass
                }
              >
                Mensalidade
              </span>

              <input
                value={monthlyPrice}
                onChange={(e) =>
                  setMonthlyPrice(
                    e.target.value
                  )
                }
                inputMode="decimal"
                className={
                  inputClass
                }
              />
            </label>

            <label>
              <span
                className={
                  labelClass
                }
              >
                Status
              </span>

              <select
                value={status}
                onChange={(e) =>
                  setStatus(
                    e.target.value
                  )
                }
                className={
                  inputClass
                }
              >
                <option value="ACTIVE">
                  Ativo
                </option>

                <option value="INACTIVE">
                  Inativo
                </option>

                <option value="SUSPENDED">
                  Suspenso
                </option>
              </select>
            </label>

            <label className="sm:col-span-2">
              <span
                className={
                  labelClass
                }
              >
                Domínio
              </span>

              <div className="relative">
                <Globe2
                  size={14}
                  className="absolute left-4 top-[24px] text-white/20"
                />

                <input
                  value={domain}
                  onChange={(e) =>
                    setDomain(
                      e.target.value
                    )
                  }
                  maxLength={255}
                  className={`${inputClass} pl-10`}
                />
              </div>
            </label>

            <label className="sm:col-span-2">
              <span
                className={
                  labelClass
                }
              >
                URL do sistema
              </span>

              <input
                value={systemUrl}
                onChange={(e) =>
                  setSystemUrl(
                    e.target.value
                  )
                }
                maxLength={500}
                className={
                  inputClass
                }
              />
            </label>

            <label className="sm:col-span-2">
              <span
                className={
                  labelClass
                }
              >
                Próxima renovação
              </span>

              <div className="relative">
                <CalendarDays
                  size={14}
                  className="absolute left-4 top-[24px] text-white/20"
                />

                <input
                  type="date"
                  value={renewalDate}
                  onChange={(e) =>
                    setRenewalDate(
                      e.target.value
                    )
                  }
                  className={`${inputClass} pl-10`}
                />
              </div>
            </label>
          </div>

          <div className="mt-7 flex justify-end gap-3 border-t border-white/[0.05] pt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="h-10 rounded-xl border border-white/[0.07] px-5 text-xs text-white/35"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex h-10 items-center gap-2 rounded-xl border border-violet-300/15 bg-violet-300/[0.08] px-5 text-xs text-violet-100/80"
            >
              {saving ? (
                <Loader2
                  size={14}
                  className="animate-spin"
                />
              ) : (
                <Save
                  size={14}
                />
              )}

              {saving
                ? "Salvando..."
                : "Salvar alterações"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}