import { el } from "date-fns/locale";

function createDomElement({ elementTag, className, textContent, attr }) {
  const element = document.createElement(elementTag);

  if (className) {
    element.classList.add(className);
  }
  if (textContent) {
    element.textContent = textContent;
  }
  if (attr) {
    for (const [attrName, attrValue] of Object.entries(attr)) {
      element.setAttribute(attrName, attrValue);
    }
  }

  return element;
}

export { createDomElement };
