import type { Game } from "./schema";

const CM_PER_INCH = 2.54;

export const LIMITS = {
  dpi: { min: 100, max: 32000 },
  // Exclusive lower bound: sensitivity must be > 0.
  sens: { max: 1000 },
} as const;

export type ParseResult<T> = { ok: true; value: T } | { ok: false; error: string };

export interface MouseSetup {
  yaw: number;
  dpi: number;
}

/** sens2 = sens1 × (yaw1 × DPI1) / (yaw2 × DPI2). Keeps cm/360 constant. */
export function convertSens(sens: number, from: MouseSetup, to: MouseSetup): number {
  return (sens * (from.yaw * from.dpi)) / (to.yaw * to.dpi);
}

/** cm/360 = 360 / (yaw × sens × DPI) × 2.54 */
export function cmPer360(yaw: number, sens: number, dpi: number): number {
  return (360 / (yaw * sens * dpi)) * CM_PER_INCH;
}

// Plain decimal only: rejects "1e3", "0x10", "Infinity" and other forms Number() accepts.
const DECIMAL = /^-?(\d+\.?\d*|\.\d+)$/;

/** Parses a user-typed number; accepts "," as decimal separator. */
function parseNumber(raw: string): ParseResult<number> {
  const text = raw.trim().replace(",", ".");
  if (text === "") return { ok: false, error: "Champ requis." };
  if (!DECIMAL.test(text)) return { ok: false, error: "Nombre invalide." };
  return { ok: true, value: Number(text) };
}

export function parseSens(raw: string): ParseResult<number> {
  const parsed = parseNumber(raw);
  if (!parsed.ok) return parsed;
  if (parsed.value <= 0) return { ok: false, error: "La sensibilité doit être supérieure à 0." };
  if (parsed.value > LIMITS.sens.max) {
    return { ok: false, error: `La sensibilité doit être au plus ${LIMITS.sens.max}.` };
  }
  return parsed;
}

export function parseDpi(raw: string): ParseResult<number> {
  const parsed = parseNumber(raw);
  if (!parsed.ok) return parsed;
  if (!Number.isInteger(parsed.value)) return { ok: false, error: "Le DPI doit être un nombre entier." };
  if (parsed.value < LIMITS.dpi.min || parsed.value > LIMITS.dpi.max) {
    return { ok: false, error: `Le DPI doit être entre ${LIMITS.dpi.min} et ${LIMITS.dpi.max}.` };
  }
  return parsed;
}

export interface Conversion {
  game: Game;
  sens: number;
}

/** Converts a sensitivity from one game to every game in the list (source included). */
export function convertToAll(
  games: readonly Game[],
  source: Game,
  sens: number,
  dpiFrom: number,
  dpiTo: number = dpiFrom,
): Conversion[] {
  return games.map((game) => ({
    game,
    sens: convertSens(sens, { yaw: source.yaw, dpi: dpiFrom }, { yaw: game.yaw, dpi: dpiTo }),
  }));
}
