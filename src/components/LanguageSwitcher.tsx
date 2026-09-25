"use client";

import {
  useLanguage,
} from "@/i18n/LanguageProvider";

export default function LanguageSwitcher({
  compact = false,
}: {
  compact?: boolean;
}) {
  const {
    locale,
    setLocale,
  } =
    useLanguage();

  return (
    <div
      className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] p-1 text-[10px] font-semibold tracking-[0.08em] text-white/45"
      aria-label="Language"
    >
      <button
        type="button"
        onClick={() =>
          setLocale(
            "pt-BR"
          )
        }
        className={
          locale ===
          "pt-BR"
            ? "rounded-full bg-white px-2.5 py-1 text-[#07101c]"
            : "rounded-full px-2.5 py-1 transition hover:text-white"
        }
        aria-pressed={
          locale ===
          "pt-BR"
        }
        title="Português"
      >
        PT
      </button>

      <button
        type="button"
        onClick={() =>
          setLocale(
            "en-US"
          )
        }
        className={
          locale ===
          "en-US"
            ? "rounded-full bg-white px-2.5 py-1 text-[#07101c]"
            : "rounded-full px-2.5 py-1 transition hover:text-white"
        }
        aria-pressed={
          locale ===
          "en-US"
        }
        title="English"
      >
        EN
      </button>

      {!compact && (
        <span className="sr-only">
          Language selector
        </span>
      )}
    </div>
  );
}
