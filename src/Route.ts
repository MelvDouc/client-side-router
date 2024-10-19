import type { Component, InferParams, OptionalPromise, StringRecord, TitleFn } from "$src/types.js";

export default class Route<Path extends string, Params extends StringRecord = InferParams<Path>> {
  private static createRegex(path: string): RegExp {
    return RegExp("^" + path.replace(/:(\w+)/g, "(?<$1>\\w+)") + "$");
  }

  private readonly regex: RegExp;
  private readonly titleOrTitleFn: string | TitleFn<Params>;
  private readonly component: Component<Params>;

  public constructor(path: Path, titleOrTitleFn: string | TitleFn<Params>, component: Component<Params>) {
    this.regex = Route.createRegex(path);
    this.titleOrTitleFn = titleOrTitleFn;
    this.component = component;
  }

  private getTitle(params: Params): string {
    return typeof this.titleOrTitleFn === "function"
      ? this.titleOrTitleFn(params)
      : this.titleOrTitleFn;
  }

  public getUIParams(path: string): [title: string, component: () => OptionalPromise<Node>] | null {
    const matchArray = path.match(this.regex);

    if (!matchArray)
      return null;

    const params = (matchArray.groups ?? {}) as Params;
    return [this.getTitle(params), () => this.component(params)];
  }
}