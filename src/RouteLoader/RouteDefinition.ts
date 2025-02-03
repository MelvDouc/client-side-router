import type { Component, ComponentParams } from "$/src/types";

export default class RouteDefinition {
  private static readonly PARAM_REGEX = /\/:([^/]+)/g;

  private readonly path: string;
  private readonly regex: RegExp;
  private readonly component: Component;

  public constructor(path: string, component: Component) {
    this.path = path;
    this.regex = new RegExp(`^${path.replace(RouteDefinition.PARAM_REGEX, "/(?<$1>[^/]+)")}$`);
    this.component = component;
  }

  public realPathName(params: ComponentParams): string {
    return this.path.replace(RouteDefinition.PARAM_REGEX, (_, p1) => {
      return "/" + (params[p1] ?? "");
    });
  }

  public componentAndParams(pathName: string): [Component, ComponentParams] | [null, null] {
    const matchArray = pathName.match(this.regex);

    return matchArray
      ? [this.component, matchArray.groups ?? {}]
      : [null, null];
  }
}