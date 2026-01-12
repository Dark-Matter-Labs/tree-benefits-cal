"use client";

type Language = "en" | "fr";

interface LanguageToggleProps {
  value: Language;
  onChange: (lang: Language) => void;
}

export function LanguageToggle({ value, onChange }: LanguageToggleProps) {
  return (
    <div className="inline-flex items-center rounded-full bg-slate-100 border border-slate-200 p-1 text-xs">
      <button
        type="button"
        onClick={() => onChange("en")}
        className={`px-3 py-1 rounded-full transition-all ${
          value === "en"
            ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-sm font-medium"
            : "text-slate-600 hover:text-slate-900"
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => onChange("fr")}
        className={`px-3 py-1 rounded-full transition-all ${
          value === "fr"
            ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-sm font-medium"
            : "text-slate-600 hover:text-slate-900"
        }`}
      >
        FR
      </button>
    </div>
  );
}

