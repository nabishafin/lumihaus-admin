// Shared presentation classes for the Categories & brands screen.
// The `!` suffix is needed because styles.css forces `.card` / `.button` with !important.
export const CARD =
  "card border! border-[#DCD6CB]! dark:border-white/10! rounded-xl! bg-white! dark:bg-[#222620]!";

export const SMALL_BUTTON =
  "button secondary shrink-0 px-3! py-1.5! text-[13px]! font-medium! cursor-pointer";

export const LIST = "divide-y divide-[#DCD6CB]/70 dark:divide-white/10";
export const ROW = "flex items-center gap-3 py-3 first:pt-0 last:pb-0";
export const TILE =
  "h-10 w-10 shrink-0 rounded-lg border border-[#DCD6CB]/70 dark:border-white/10 overflow-hidden";
export const TITLE = "text-sm font-semibold text-[#141f17] dark:text-white truncate";
export const MUTED = "text-xs text-[#2E4235]/65 dark:text-[#D2DDD6]/65 truncate";

const ICON_BASE =
  "p-1.5 rounded-md transition cursor-pointer text-[#2E4235]/60 dark:text-[#D2DDD6]/60";
export const ICON_BUTTON = `${ICON_BASE} hover:text-[#141f17] hover:bg-[#F3EDE2] dark:hover:text-white dark:hover:bg-white/5`;
export const ICON_BUTTON_DANGER = `${ICON_BASE} hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-500/10`;

export const FIELD_LABEL = "block text-xs! font-medium! text-[#2E4235]/80! dark:text-[#D2DDD6]/80! mb-1";
export const FIELD_INPUT =
  "w-full text-[13px] px-3 py-2 border border-[#DCD6CB] dark:border-white/10 rounded-lg bg-white dark:bg-[#1A1D1B] font-normal! text-[#141f17]! dark:text-white! outline-none focus:border-[#8FAF9A]";

export const PRIMARY_BUTTON =
  "inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium rounded-lg bg-[#26382E] text-white hover:bg-[#17251C] dark:bg-[#8FAF9A] dark:text-[#17251C] dark:hover:bg-[#A8C4B3] transition cursor-pointer";
export const SECONDARY_BUTTON =
  "px-4 py-2 text-[13px] font-medium rounded-lg border border-[#DCD6CB] dark:border-white/10 text-[#2E4235] dark:text-[#D2DDD6] hover:bg-[#F3EDE2] dark:hover:bg-white/5 transition cursor-pointer";
