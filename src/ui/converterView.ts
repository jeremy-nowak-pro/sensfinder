import { cmPer360, convertToAll, parseDpi, parseSens, type ParseResult } from "../converter/converter";
import type { Game } from "../converter/schema";
import { el } from "./dom";
import { formatCm, formatSens } from "./format";

const ALL_GAMES = "__all__";

interface Field {
  wrapper: HTMLDivElement;
  input: HTMLInputElement;
  error: HTMLParagraphElement;
}

function numberField(id: string, label: string, value: string, placeholder = ""): Field {
  const input = el("input", {
    id,
    type: "text",
    inputMode: "decimal",
    autocomplete: "off",
    spellcheck: false,
    value,
    placeholder,
  });
  const error = el("p", { className: "field-error" });
  const wrapper = el("div", { className: "field" }, [el("label", { htmlFor: id, textContent: label }), input, error]);
  return { wrapper, input, error };
}

function gameSelect(id: string, games: readonly Game[], selectedId: string, withAll = false): HTMLSelectElement {
  const options = games.map((g) => el("option", { value: g.id, textContent: g.name, selected: g.id === selectedId }));
  if (withAll) options.push(el("option", { value: ALL_GAMES, textContent: "Tous les jeux" }));
  return el("select", { id }, options);
}

function labeled(id: string, label: string, control: HTMLElement): HTMLDivElement {
  return el("div", { className: "field" }, [el("label", { htmlFor: id, textContent: label }), control]);
}

function unverifiedBadge(game: Game): HTMLElement | null {
  if (game.verified) return null;
  return el("span", { className: "badge badge-unverified", textContent: "non vérifié", title: `Source : ${game.source}` });
}

/** Shows the error under the field and returns the parsed value, or null if invalid. */
function check(field: Field, result: ParseResult<number>): number | null {
  field.error.textContent = result.ok ? "" : result.error;
  field.input.setAttribute("aria-invalid", String(!result.ok));
  return result.ok ? result.value : null;
}

export function converterView(games: readonly Game[]): HTMLElement {
  const byId = new Map(games.map((g) => [g.id, g]));
  const sourceSelect = gameSelect("source-game", games, "cs2");
  const targetSelect = gameSelect("target-game", games, games.find((g) => g.id !== "cs2")?.id ?? "", true);
  const sens = numberField("sens", "Sensibilité", "1");
  const dpi = numberField("dpi", "DPI", "800");
  const dpiTarget = numberField("dpi-target", "DPI cible (optionnel)", "", "identique");
  const sourceBadge = el("span");
  const result = el("section", { className: "result" });
  result.setAttribute("aria-live", "polite");

  function render(): void {
    const source = byId.get(sourceSelect.value);
    const badge = source ? unverifiedBadge(source) : null;
    sourceBadge.replaceChildren(...(badge ? [badge] : []));

    const sensValue = check(sens, parseSens(sens.input.value));
    const dpiValue = check(dpi, parseDpi(dpi.input.value));
    const dpiTargetRaw = dpiTarget.input.value.trim();
    const dpiTargetValue = dpiTargetRaw === "" ? dpiValue : check(dpiTarget, parseDpi(dpiTargetRaw));
    if (dpiTargetRaw === "") check(dpiTarget, { ok: true, value: 0 });

    if (!source || sensValue === null || dpiValue === null || dpiTargetValue === null) {
      result.replaceChildren();
      return;
    }

    const cm = el("p", { className: "result-cm", textContent: formatCm(cmPer360(source.yaw, sensValue, dpiValue)) });
    const targets = targetSelect.value === ALL_GAMES ? games : games.filter((g) => g.id === targetSelect.value);
    const rows = convertToAll(targets, source, sensValue, dpiValue, dpiTargetValue);

    if (rows.length === 1 && rows[0]) {
      const { game, sens: converted } = rows[0];
      const badge = unverifiedBadge(game);
      result.replaceChildren(
        el("p", { className: "result-label", textContent: game.name }),
        el("p", { className: "result-sens" }, [el("span", { textContent: formatSens(converted) }), ...(badge ? [badge] : [])]),
        cm,
      );
      return;
    }

    const body = el(
      "tbody",
      {},
      rows.map(({ game, sens: converted }) => {
        const badge = unverifiedBadge(game);
        return el("tr", {}, [
          el("td", {}, [el("span", { textContent: game.name }), ...(badge ? [badge] : [])]),
          el("td", { className: "num", textContent: formatSens(converted) }),
        ]);
      }),
    );
    const head = el("thead", {}, [
      el("tr", {}, [el("th", { textContent: "Jeu" }), el("th", { className: "num", textContent: "Sensibilité" })]),
    ]);
    result.replaceChildren(cm, el("table", { className: "result-table" }, [head, body]));
  }

  for (const control of [sourceSelect, targetSelect, sens.input, dpi.input, dpiTarget.input]) {
    control.addEventListener("input", render);
  }
  render();

  return el("section", { className: "converter" }, [
    el("h2", { textContent: "Convertisseur (hipfire)" }),
    el("div", { className: "form" }, [
      el("div", { className: "form-row" }, [labeled("source-game", "Jeu source", sourceSelect), sourceBadge]),
      el("div", { className: "form-row" }, [sens.wrapper, dpi.wrapper]),
      el("div", { className: "form-row" }, [labeled("target-game", "Jeu cible", targetSelect), dpiTarget.wrapper]),
    ]),
    result,
  ]);
}
