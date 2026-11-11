// Safe element builder: text goes through textContent, never innerHTML.
// Only properties from this allowlist can be set, so innerHTML/outerHTML are unreachable.

type SafeKey =
  | "className"
  | "textContent"
  | "id"
  | "title"
  | "htmlFor"
  | "name"
  | "type"
  | "value"
  | "placeholder"
  | "inputMode"
  | "autocomplete"
  | "spellcheck"
  | "selected";

type Props<K extends keyof HTMLElementTagNameMap> = Partial<
  Pick<HTMLElementTagNameMap[K], Extract<SafeKey, keyof HTMLElementTagNameMap[K]>>
>;

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: Props<K> = {},
  children: Node[] = [],
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  Object.assign(node, props);
  node.append(...children);
  return node;
}
