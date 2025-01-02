import RequestKind from "$/src/context/RequestKind";

export default class NavRequest {
  public readonly kind: RequestKind;
  public readonly pathName: string;

  public constructor(kind: RequestKind, pathName: string) {
    this.kind = kind;
    this.pathName = pathName;
  }

  public isPageLoadRequest(): boolean {
    return this.kind === RequestKind.PageLoad;
  }

  public isPopStateRequest(): boolean {
    return this.kind === RequestKind.PopState;
  }

  /**
   * @returns `true` if this request wasn't made on page load or during a popstate event.
   */
  public isNormalRequest(): boolean {
    return this.kind === RequestKind.Normal;
  }
}