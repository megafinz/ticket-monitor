import { DOMParser, type Element, type HTMLCollection } from "./deps/html.ts";
import type { SearchCriteria, TicketMonitoringRequest } from "./model.ts";
import { retryAsync } from "./utils.ts";

export type TicketMonitoringRequestResult =
  | {
      type: "tickets-found";
    }
  | {
      type: "tickets-not-found";
    }
  | {
      type: "request-expired";
    }
  | {
      type: "error";
      details: string;
    };

const domParser = new DOMParser();

export async function executeRequest(
  request: TicketMonitoringRequest
): Promise<TicketMonitoringRequestResult> {
  return await retryAsync(async () => {
    const response = await fetch(request.pageUrl);
    if (response.status !== 200) {
      return {
        type: "error",
        details: `Request failed with status code ${response.status}`,
      };
    } else {
      const html = await response.text();
      const dom = domParser.parseFromString(html, "text/html");
      if (!dom) {
        return {
          type: "error",
          details: `Can't parse the DOM`,
        };
      } else {
        if (find(dom.body, request.searchCriteria)) {
          return {
            type: "tickets-found",
          };
        } else {
          if (request.expirationDate.valueOf() < Date.now()) {
            return {
              type: "request-expired",
            };
          }
          return {
            type: "tickets-not-found",
          };
        }
      }
    }
  });
}

function find(container: Element, criteria: SearchCriteria): boolean {
  const matchingElements: Element[] = [];

  if (criteria.type === "css-selector") {
    matchingElements.push(...findByCssSelector(container, criteria.selector));
  } else if (criteria.type === "node-name") {
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
  const result: Element[] = [];
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
  };
  find(container.children);
  return result;
}
