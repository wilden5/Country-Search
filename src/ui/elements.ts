export const createText = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  text = '',
): HTMLElementTagNameMap[K] => {
  const element = document.createElement(tag);
  element.textContent = text;
  return element;
};
