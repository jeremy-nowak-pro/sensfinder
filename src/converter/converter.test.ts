import { describe, expect, it } from "vitest";
import { cmPer360, convertSens, convertToAll, parseDpi, parseSens } from "./converter";
import { parseGames, type Game } from "./schema";
import gamesJson from "./games.json";

const games = parseGames(gamesJson);
const byId = (id: string): Game => {
  const game = games.find((g) => g.id === id);
  if (!game) throw new Error(`missing game ${id}`);
  return game;
};
const cs2 = byId("cs2");
const abi = byId("abi");

describe("cmPer360", () => {
  it("CS2 sens 1 at 800 DPI ≈ 52 cm", () => {
    expect(cmPer360(0.022, 1, 800)).toBeCloseTo(51.9545, 3);
  });

  it("halves when sensitivity doubles", () => {
    expect(cmPer360(0.022, 2, 800)).toBeCloseTo(cmPer360(0.022, 1, 800) / 2, 10);
  });
});

describe("convertSens", () => {
  it("CS2 → ABI ≈ ×0.2149", () => {
    const sens = convertSens(1, { yaw: cs2.yaw, dpi: 800 }, { yaw: abi.yaw, dpi: 800 });
    expect(sens).toBeCloseTo(0.2149, 4);
  });

  it("CS2 → Valorant ≈ ×0.3143", () => {
    const sens = convertSens(1, { yaw: 0.022, dpi: 800 }, { yaw: 0.07, dpi: 800 });
    expect(sens).toBeCloseTo(0.3143, 4);
  });

  it("round-trips A → B → A", () => {
    const a = { yaw: cs2.yaw, dpi: 800 };
    const b = { yaw: abi.yaw, dpi: 1600 };
    expect(convertSens(convertSens(1.37, a, b), b, a)).toBeCloseTo(1.37, 12);
  });

  it("doubling DPI halves sensitivity and keeps cm/360", () => {
    const sens = convertSens(2, { yaw: 0.022, dpi: 800 }, { yaw: 0.022, dpi: 1600 });
    expect(sens).toBeCloseTo(1, 12);
    expect(cmPer360(0.022, sens, 1600)).toBeCloseTo(cmPer360(0.022, 2, 800), 10);
  });

  it("preserves cm/360 across games", () => {
    const sens = convertSens(1.2, { yaw: cs2.yaw, dpi: 800 }, { yaw: abi.yaw, dpi: 400 });
    expect(cmPer360(abi.yaw, sens, 400)).toBeCloseTo(cmPer360(cs2.yaw, 1.2, 800), 10);
  });
});

describe("convertToAll", () => {
  it("returns one row per game, source unchanged", () => {
    const rows = convertToAll(games, cs2, 1.5, 800);
    expect(rows).toHaveLength(games.length);
    expect(rows.find((r) => r.game.id === "cs2")?.sens).toBeCloseTo(1.5, 12);
    expect(rows.find((r) => r.game.id === "deadlock")?.sens).toBeCloseTo(0.75, 12);
  });
});

describe("parseSens", () => {
  it.each([
    ["1", 1],
    ["0.5", 0.5],
    ["0,5", 0.5],
    [" 2.25 ", 2.25],
    [".8", 0.8],
  ])("accepts %j", (raw, expected) => {
    expect(parseSens(raw)).toEqual({ ok: true, value: expected });
  });

  it.each(["", "   ", "abc", "1.2.3", "1e3", "0x10", "Infinity", "NaN", "0", "-1", "1001"])(
    "rejects %j",
    (raw) => {
      expect(parseSens(raw).ok).toBe(false);
    },
  );
});

describe("parseDpi", () => {
  it.each([
    ["100", 100],
    ["800", 800],
    ["32000", 32000],
  ])("accepts %j", (raw, expected) => {
    expect(parseDpi(raw)).toEqual({ ok: true, value: expected });
  });

  it.each(["", "99", "32001", "0", "-800", "800.5", "abc"])("rejects %j", (raw) => {
    expect(parseDpi(raw).ok).toBe(false);
  });
});
