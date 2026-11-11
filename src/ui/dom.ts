// Safe element builder: text goes through textContent, never innerHTML.

type Props<K extends keyof HTMLElementTagNameMap> = Partial<
  Pick<HTMLElementTagNameMap[K], "className" | "textContent" | "id" | "title">
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
