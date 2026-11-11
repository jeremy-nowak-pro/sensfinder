import { describe, expect, it } from "vitest";
import { parseGames } from "./schema";
import gamesJson from "./games.json";

const valid = {
  id: "cs2",
  name: "Counter-Strike 2",
  engine: "Source 2",
  yaw: 0.022,
  source: "m_yaw",
  verified: true,
  aims: [],
};

describe("games.json", () => {
  it("passes validation", () => {
    expect(() => parseGames(gamesJson)).not.toThrow();
  });

  it("keeps the reference values", () => {
    const games = parseGames(gamesJson);
    expect(games.find((g) => g.id === "cs2")).toMatchObject({ yaw: 0.022, verified: true });
    expect(games.find((g) => g.id === "abi")).toMatchObject({ yaw: 0.102375, verified: false });
  });
});

describe("parseGames", () => {
  it("accepts a minimal valid game", () => {
    expect(parseGames([valid])).toEqual([valid]);
  });

  it.each([
    ["empty list", []],
    ["not an array", { games: [] }],
    ["zero yaw", [{ ...valid, yaw: 0 }]],
    ["negative yaw", [{ ...valid, yaw: -0.022 }]],
    ["string yaw", [{ ...valid, yaw: "0.022" }]],
    ["absurd yaw", [{ ...valid, yaw: 1000 }]],
    ["missing source", [{ ...valid, source: "" }]],
    ["bad id", [{ ...valid, id: "CS 2" }]],
    ["unknown field", [{ ...valid, extra: 1 }]],
    ["missing verified", [{ ...valid, verified: undefined }]],
    ["duplicate id", [valid, { ...valid, name: "Copy" }]],
  ])("rejects %s", (_label, data) => {
    expect(() => parseGames(data)).toThrow(/Invalid games.json/);
  });
});
