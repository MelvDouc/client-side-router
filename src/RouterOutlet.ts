import NavRequest from "$/src/context/NavRequest";
import type NavResponse from "$/src/context/NavResponse";
import RequestKind from "$/src/context/RequestKind";
import EventBus from "$/src/EventBus";
import RouteLoader from "$/src/RouteLoader/RouteLoader";

export default class RouterOutlet extends HTMLElement {
  private readonly _basePath: string;

  public constructor(basePath: string) {
    super();
    this._basePath = basePath;
    this.style.display = "contents";
  }

  private get _currentPathName(): string {
    return this._removeBasePath(location.pathname);
  }

  connectedCallback(): void {
    // Handle page back navigation.
    window.addEventListener("popstate", () => {
      EventBus.emitNavRequestOf(RequestKind.PopState, this._currentPathName);
    });

    // Handle local links.
    document.addEventListener("click", (e) => {
      this._handleAnchorClick(e);
    });

    // Manage requests.
    EventBus.onNavRequest(async (request) => {
      const response = RouteLoader.getResponse(request.pathName);

      switch (request.kind) {
        case RequestKind.PageLoad:
        case RequestKind.PopState:
          await this._updateChildren(response);
          break;
        case RequestKind.Normal:
          if (request.pathName !== this._currentPathName) {
            history.pushState({}, "", this._basePath + request.pathName);
            await this._updateChildren(response);
          }
      }

      this._completeRequest(request, response);
    });

    // Initial navigation.
    EventBus.emitNavRequestOf(RequestKind.PageLoad, this._currentPathName);
  }

  private _removeBasePath(pathName: string): string {
    return pathName.slice(this._basePath.length);
  }

  private _completeRequest(request: NavRequest, response: NavResponse): void {
    EventBus.emitNavComplete({
      requestKind: request.kind,
      pathName: request.pathName,
      routeName: response.routeName,
      params: response.params,
      component: response.component
    });
  }

  private _handleAnchorClick(e: MouseEvent): void {
    if (!(e.target instanceof HTMLAnchorElement))
      return;

    const url = new URL(e.target.href);

    if (url.origin !== location.origin)
      return;

    e.preventDefault();
    const pathName = this._removeBasePath(url.pathname);

    if (pathName !== this._currentPathName)
      EventBus.emitNavRequestOf(RequestKind.Normal, pathName);
  }

  private async _updateChildren(response: NavResponse): Promise<void> {
    const routerChild = await response.node();
    this.replaceChildren(routerChild);
  }
}

customElements.define("router-outlet", RouterOutlet);