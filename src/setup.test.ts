import { describe, expect, it } from "vitest";
import { z } from "zod";
import games from "./converter/games.json";

// Smoke test: proves the toolchain (Vitest + TS + JSON import + Zod) works.
describe("toolchain", () => {
  it("imports games.json and validates it with zod", () => {
    expect(z.array(z.unknown()).parse(games)).toEqual([]);
  });
});
