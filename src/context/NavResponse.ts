import type { Component, ComponentParams, OptionalPromise } from "$/src/types";

export default class NavResponse {
  private static readonly DEFAULT_RESPONSE = new this("404", {}, () => {
    document.title = "404 page not found";
    return document.title;
  });

  public static defaultResponse(): NavResponse {
    return this.DEFAULT_RESPONSE;
  }

  public constructor(
    public readonly routeName: string,
    public readonly params: ComponentParams,
    public readonly component: Component
  ) { }

  public node(): OptionalPromise<string | Node> {
    return this.component(this.params);
  }
}