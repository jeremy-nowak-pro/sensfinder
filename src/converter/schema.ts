import { z } from "zod";

// Yaw = degrees turned per mouse count at sensitivity 1. Real games sit
// roughly between 0.001 and 1; anything outside is a data-entry error.
export const YAW_MIN = 0.0001;
export const YAW_MAX = 10;

export const GameSchema = z.strictObject({
  id: z.string().regex(/^[a-z0-9-]+$/, "id must be lowercase letters, digits or dashes"),
  name: z.string().trim().min(1),
  engine: z.string().trim().min(1),
  yaw: z.number().min(YAW_MIN).max(YAW_MAX),
  source: z.string().trim().min(1),
  verified: z.boolean(),
  // Aim (ADS / scope) definitions arrive in step 3; until then the list must stay empty.
  aims: z.array(z.never()),
});

export const GamesSchema = z
  .array(GameSchema)
  .min(1)
  .superRefine((games, ctx) => {
    const seen = new Set<string>();
    for (const [i, game] of games.entries()) {
      if (seen.has(game.id)) {
        ctx.addIssue({ code: "custom", message: `duplicate game id "${game.id}"`, path: [i, "id"] });
      }
      seen.add(game.id);
    }
  });

export type Game = z.infer<typeof GameSchema>;

/** Validates raw game data; throws with a readable message on bad data. */
export function parseGames(raw: unknown): Game[] {
  const result = GamesSchema.safeParse(raw);
  if (!result.success) {
    throw new Error(`Invalid games.json:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}
