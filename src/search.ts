import { HTMLCollection, Element } from './deps/html.ts';
import { SearchCriteria } from "./model.ts";

export function find(container: Element, criteria: SearchCriteria): boolean {
  const matchingElements: Element[] = [];

  if (criteria.type === 'css-selector') {
    matchingElements.push(...findByCssSelector(container, criteria.selector));
  } else if (criteria.type === 'node-name') {
    matchingElements.push(...findByNodeName(container, criteria.nodeName));
  }

  if (!criteria.child) {
    return matchingElements.length > 0;
  }

  for (const matchingElement of matchingElements) {
    if (find(matchingElement, criteria.child)) {
      return true;
    }
  }

  return false;
}

function findByCssSelector(container: Element, selector: string): Element[] {
  const result: Element[] = []
  const nodes = container.querySelectorAll(selector);
  for (const node of nodes) {
    const element = node as Element;
    if (element) {
      result.push(element);
    }
  }
  return result;
}

function findByNodeName(container: Element, nodeName: string): Element[] {
  const result: Element[] = [];
  const find = (elements: HTMLCollection | Element[]) => {
    if (elements.length === 0) {
      return;
    }
    const children: Element[] = [];
    for (const element of elements) {
      if (element.nodeName === nodeName) {
        result.push(element);
      }
      children.push(...element.children);
    }
    find(children);
  }
  find(container.children);
  return result;
}
