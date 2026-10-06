import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Check, Palette, RotateCcw, Save, ShoppingBag } from "lucide-react";
import { useGetSettingsQuery, useUpdateSettingsMutation } from "../../redux/api/cmsApi";
import { useGetProductsQuery } from "../../redux/api/productApi";

// Storefront colour themes. Field names match settings.theme on the API.
export const THEME_PRESETS = {
  sage: {
    label: "Sage",
    primary: "#26382E", text: "#26382E", background: "#F9F6EF", surface: "#FFFFFF",
    productBackground: "#F3EDE2", accent: "#8FAF9A", highlight: "#C7A56A",
  },
  rose: {
    label: "Rose",
    primary: "#7A2E3A", text: "#3A1F24", background: "#FBF5F3", surface: "#FFFFFF",
    productBackground: "#F4E6E3", accent: "#D8A7B1", highlight: "#C99A6B",
  },
  ocean: {
    label: "Ocean",
    primary: "#123B4A", text: "#13262E", background: "#F4F8F9", surface: "#FFFFFF",
    productBackground: "#E3EEF1", accent: "#6FB3C8", highlight: "#E0A458",
  },
  lavender: {
    label: "Lavender",
    primary: "#4B3B6B", text: "#2A2238", background: "#F7F5FB", surface: "#FFFFFF",
    productBackground: "#ECE7F5", accent: "#A99BD1", highlight: "#D9A86C",
  },
  terracotta: {
    label: "Terracotta",
    primary: "#8A3F24", text: "#3B2418", background: "#FBF6F1", surface: "#FFFFFF",
    productBackground: "#F2E4D8", accent: "#D9A47E", highlight: "#6F8F72",
  },
  mono: {
    label: "Mono",
    primary: "#111111", text: "#1A1A1A", background: "#FAFAFA", surface: "#FFFFFF",
    productBackground: "#F0F0F0", accent: "#A3A3A3", highlight: "#C9A227",
  },
  blush: {
    label: "Blush",
    primary: "#5B3A3F", text: "#3B2629", background: "#FDF7F5", surface: "#FFFFFF",
    productBackground: "#F7E7E3", accent: "#E7B7B0", highlight: "#C8A27A",
  },
  champagne: {
    label: "Champagne",
    primary: "#3D3428", text: "#2E2820", background: "#FBF8F2", surface: "#FFFFFF",
    productBackground: "#F1EADC", accent: "#CDB58A", highlight: "#B8913F",
  },
  forest: {
    label: "Forest",
    primary: "#1F3D2B", text: "#1B2A21", background: "#F6F8F4", surface: "#FFFFFF",
    productBackground: "#E6EEE4", accent: "#7FA889", highlight: "#B89B5E",
  },
  navy: {
    label: "Navy",
    primary: "#1B2A4A", text: "#18213A", background: "#F6F7FA", surface: "#FFFFFF",
    productBackground: "#E7EBF3", accent: "#8DA2C8", highlight: "#C7A26A",
  },
  mint: {
    label: "Mint",
    primary: "#1E4D47", text: "#173A35", background: "#F4FAF8", surface: "#FFFFFF",
    productBackground: "#E1F1EC", accent: "#86CDB8", highlight: "#E3A76F",
  },
  plum: {
    label: "Plum",
    primary: "#4A2545", text: "#2E1A2C", background: "#FAF6F9", surface: "#FFFFFF",
    productBackground: "#F0E5EE", accent: "#C79BC0", highlight: "#C9A46C",
  },
  coffee: {
    label: "Coffee",
    primary: "#4A3528", text: "#2F231B", background: "#FAF7F3", surface: "#FFFFFF",
    productBackground: "#EFE5DA", accent: "#C4A184", highlight: "#A7814F",
  },
  sand: {
    label: "Sand",
    primary: "#6B5B45", text: "#3A3226", background: "#FCFAF6", surface: "#FFFFFF",
    productBackground: "#F2ECE1", accent: "#D6C3A3", highlight: "#9C7A4B",
  },
};

const FIELDS = [
  { key: "primary", label: "Brand colour", hint: "Buttons, header bar, highlights" },
  { key: "accent", label: "Accent", hint: "Soft glows, dots, hover colour" },
  { key: "background", label: "Page background", hint: "Behind every page" },
  { key: "productBackground", label: "Product background", hint: "Behind every product photo" },
  { key: "surface", label: "Cards & panels", hint: "Search box, chips, panels" },
  { key: "text", label: "Text", hint: "Headings and body text" },
  { key: "highlight", label: "Highlight", hint: "Stars and small gold details" },
];

const HEX = /^#[0-9a-f]{6}$/i;
const COLOR_KEYS = FIELDS.map((f) => f.key);

function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const contrast = (a, b) => {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
};
const onColor = (hex) => (luminance(hex) > 0.45 ? "#17251C" : "#FFFFFF");
const pickColors = (theme) => Object.fromEntries(COLOR_KEYS.map((k) => [k, theme[k]]));

export default function AppearanceEditor() {
  const { data: settingsRes, isLoading } = useGetSettingsQuery(undefined, { refetchOnMountOrArgChange: true });
  const [updateSettings, { isLoading: isSaving }] = useUpdateSettingsMutation();
  const { data: productsRes } = useGetProductsQuery({ limit: 2 });
  const sampleImages = (productsRes?.data || []).map((p) => p.images?.[0]).filter(Boolean);

  const saved = settingsRes?.data?.theme;
  const [draft, setDraft] = useState(null);
  const [preset, setPreset] = useState("sage");

  useEffect(() => {
    if (!saved || draft) return;
    setDraft({ ...THEME_PRESETS.sage, ...pickColors(saved) });
    setPreset(saved.preset || "custom");
  }, [saved, draft]);

  const theme = draft || THEME_PRESETS.sage;
  const valid = COLOR_KEYS.every((k) => HEX.test(theme[k] || ""));
  const textContrast = valid ? contrast(theme.text, theme.background) : 21;
  const dirty = useMemo(
    () => !!saved && COLOR_KEYS.some((k) => (theme[k] || "").toUpperCase() !== (saved[k] || "").toUpperCase()),
    [saved, theme]
  );

  const choosePreset = (key) => {
    setPreset(key);
    setDraft({ ...pickColors(THEME_PRESETS[key]) });
  };
  const setColor = (key, value) => {
    setPreset("custom");
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!valid) return toast.error("Every colour needs a 6-digit hex value like #26382E.");
    try {
      await updateSettings({ theme: { preset, ...pickColors(theme) } }).unwrap();
      toast.success("Theme saved. The store shows it on the next page load.");
    } catch (err) {
      toast.error(err?.data?.error?.[0]?.message || err?.data?.message || "Could not save the theme.");
    }
  };

  if (isLoading && !draft) {
    return <div className="rounded-xl border border-[#DCD6CB] bg-white p-8 text-sm text-[#2E4235]/70">Loading theme…</div>;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      {/* Controls */}
      <div className="space-y-6">
        <section className="rounded-xl border border-[#DCD6CB] bg-white p-5 sm:p-6 dark:border-white/10 dark:bg-[#222620]">
          <h2 className="flex items-center gap-2 text-base font-semibold text-[#141f17] dark:text-white">
            <Palette size={18} /> Ready-made themes
          </h2>
          <p className="mt-0.5 text-xs text-[#2E4235]/65 dark:text-[#D2DDD6]/65">Pick one, then fine-tune any colour below.</p>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Object.entries(THEME_PRESETS).map(([key, p]) => (
              <button
                key={key}
                type="button"
                onClick={() => choosePreset(key)}
                className={`relative rounded-xl border p-3 text-left transition cursor-pointer ${
                  preset === key ? "border-[#26382E] ring-2 ring-[#26382E]/15 dark:border-[#8FAF9A]" : "border-[#DCD6CB] hover:border-[#26382E]/40 dark:border-white/10"
                }`}
              >
                <div className="flex h-10 overflow-hidden rounded-lg" style={{ background: p.background }}>
                  <span className="w-1/3" style={{ background: p.primary }} />
                  <span className="w-1/4" style={{ background: p.accent }} />
                  <span className="flex-1" style={{ background: p.productBackground }} />
                </div>
                <span className="mt-2 block text-sm font-medium text-[#141f17] dark:text-white">{p.label}</span>
                {preset === key && (
                  <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#26382E] text-white">
                    <Check size={12} />
                  </span>
                )}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-[#DCD6CB] bg-white p-5 sm:p-6 dark:border-white/10 dark:bg-[#222620]">
          <h2 className="text-base font-semibold text-[#141f17] dark:text-white">Colours</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {FIELDS.map(({ key, label, hint }) => (
              <label key={key} className="block">
                <span className="block text-sm font-medium text-[#141f17] dark:text-white">{label}</span>
                <span className="block text-xs text-[#2E4235]/60 dark:text-[#D2DDD6]/60">{hint}</span>
                <span className="mt-2 flex items-center gap-2">
                  <input
                    type="color"
                    value={HEX.test(theme[key] || "") ? theme[key] : "#000000"}
                    onChange={(e) => setColor(key, e.target.value.toUpperCase())}
                    className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-[#DCD6CB] bg-white p-1 dark:border-white/10"
                    aria-label={`${label} colour picker`}
                  />
                  <input
                    type="text"
                    value={theme[key] || ""}
                    onChange={(e) => setColor(key, e.target.value.trim().toUpperCase())}
                    maxLength={7}
                    className={`w-full rounded-xl border px-3 py-2.5 font-mono text-sm uppercase outline-none dark:bg-[#1A1D1B] dark:text-white ${
                      HEX.test(theme[key] || "") ? "border-[#DCD6CB] dark:border-white/10" : "border-red-400"
                    }`}
                    aria-label={`${label} hex value`}
                  />
                </span>
              </label>
            ))}
          </div>
          {textContrast < 4.5 && (
            <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
              Text on the page background is hard to read (contrast {textContrast.toFixed(1)}:1). Aim for at least 4.5:1.
            </p>
          )}
        </section>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={!valid || isSaving || !dirty}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#26382E] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#17251C] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#8FAF9A] dark:text-[#17251C]"
          >
            <Save size={16} /> {isSaving ? "Saving…" : "Save theme"}
          </button>
          <button
            type="button"
            onClick={() => saved && (setDraft({ ...THEME_PRESETS.sage, ...pickColors(saved) }), setPreset(saved.preset || "custom"))}
            disabled={!dirty}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#DCD6CB] px-4 py-2.5 text-sm font-medium text-[#141f17] disabled:opacity-40 dark:border-white/10 dark:text-white"
          >
            <RotateCcw size={15} /> Undo changes
          </button>
          {!dirty && <span className="text-xs text-[#2E4235]/60 dark:text-[#D2DDD6]/60">This is the live theme.</span>}
        </div>
      </div>

      {/* Live preview: a miniature of the storefront in the draft colours */}
      <div className="xl:sticky xl:top-20 self-start">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#2E4235]/60 dark:text-[#D2DDD6]/60">Live preview</p>
        <div className="overflow-hidden rounded-2xl border border-[#DCD6CB] shadow-sm dark:border-white/10" style={{ background: theme.background, color: theme.text }}>
          <div className="px-4 py-1.5 text-[11px]" style={{ background: theme.primary, color: onColor(theme.primary) }}>
            Free delivery on orders over ৳3,000
          </div>
          <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: `${theme.text}1F` }}>
            <img src="/logo.png" alt="" className="h-8 w-auto" />
            <div className="flex-1 rounded-full border px-3 py-1.5 text-[11px] opacity-70" style={{ background: theme.surface, borderColor: `${theme.text}22` }}>
              Search products, brands…
            </div>
            <span className="flex h-8 items-center gap-1 rounded-lg px-2.5 text-[11px] font-semibold" style={{ background: theme.primary, color: onColor(theme.primary) }}>
              <ShoppingBag size={13} /> ৳0
            </span>
          </div>
          <div className="relative grid grid-cols-[1.1fr_1fr] items-center gap-3 overflow-hidden px-5 py-7">
            <span className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full blur-3xl opacity-50" style={{ background: theme.accent }} />
            <div className="relative">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: theme.accent }}>Imported from Germany</p>
              <h3 className="mt-1 text-2xl font-extrabold leading-tight tracking-tight">German skincare, made for you.</h3>
              <span className="mt-3 inline-flex rounded-full px-4 py-2 text-[11px] font-semibold" style={{ background: theme.primary, color: onColor(theme.primary) }}>
                Shop the collection →
              </span>
            </div>
            <div className="relative grid grid-cols-2 gap-2">
              {[0, 1].map((i) => (
                <div key={i} className="aspect-[3/4] rounded-xl p-2 flex items-center justify-center" style={{ background: theme.productBackground }}>
                  {sampleImages[i] && <img src={sampleImages[i]} alt="" className="max-h-full max-w-full object-contain" />}
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 px-5 pb-6">
            {["Face Care", "Body Care", "Hair Care"].map((c) => (
              <div key={c} className="rounded-xl border p-3 text-center text-[11px] font-medium" style={{ background: theme.surface, borderColor: `${theme.text}14` }}>
                <span className="mx-auto mb-1.5 block h-8 w-8 rounded-full" style={{ background: theme.productBackground }} />
                {c}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1 px-5 pb-5 text-[11px]">
            <span style={{ color: theme.highlight }}>★★★★★</span>
            <span className="opacity-60">Highlight colour</span>
          </div>
        </div>
      </div>
    </div>
  );
}
