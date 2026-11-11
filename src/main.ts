import { el } from "./ui/dom";

function mount(root: HTMLElement): void {
  root.replaceChildren(
    el("main", { className: "shell" }, [
      el("h1", { textContent: "Sens Finder" }),
      el("p", { textContent: "Setup OK — convertisseur et test d'aim à venir." }),
    ]),
  );
}

const root = document.getElementById("app");
if (!root) throw new Error("#app element missing from index.html");
mount(root);
