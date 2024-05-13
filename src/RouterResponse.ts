import { responsePropertiesSymbol } from "$src/symbols.js";

export default class RouterResponse {
  public readonly [responsePropertiesSymbol]: ResponseProperties = {
    documentTitle: null,
    component: null
  };

  public setDocumentTitle(title: string) {
    this[responsePropertiesSymbol].documentTitle = title;
    return this;
  }

  /**
   * Define the component corresponding to the current route.
   */
  public setComponent(component: Node) {
    this[responsePropertiesSymbol].component = component;
    return this;
  }
}

interface ResponseProperties {
  documentTitle: string | null;
  component: Node | null;
}