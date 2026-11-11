import gamesJson from "./converter/games.json";
import { parseGames } from "./converter/schema";
import { converterView } from "./ui/converterView";
import { el } from "./ui/dom";

function mount(root: HTMLElement): void {
  try {
    const games = parseGames(gamesJson);
    root.replaceChildren(el("main", { className: "shell" }, [el("h1", { textContent: "Sens Finder" }), converterView(games)]));
  } catch (err) {
    root.replaceChildren(
      el("main", { className: "shell" }, [
        el("h1", { textContent: "Sens Finder" }),
        el("pre", { className: "fatal", textContent: err instanceof Error ? err.message : String(err) }),
      ]),
    );
  }
}

const root = document.getElementById("app");
if (!root) throw new Error("#app element missing from index.html");
mount(root);
