import RouterRequest from "$src/RouterRequest.js";
import RouterResponse from "$src/RouterResponse.js";
import { responsePropertiesSymbol } from "$src/symbols.js";
import type {
  Handler,
  InferProps,
  PathName,
  Route
} from "$src/types.js";

export default class Router {
  protected static _getDefaultComponent() {
    const heading = document.createElement("h1");
    heading.innerText = "Page not found";
    return heading;
  }

  protected readonly _routes: Route<any>[] = [];
  protected readonly _navStartedStack: ((data: NavigationStartedData) => void | Promise<void>)[] = [];
  protected readonly _navCompleteStack: ((data: NavigationCompleteData) => void | Promise<void>)[] = [];
  protected _defaultHandler: Handler<{}> = (_, res) => {
    res
      .setDocumentTitle("Page not found")
      .setComponent(Router._getDefaultComponent());
  };

  public setRoute<T extends PathName | "*">(pathname: T, handler: Handler<InferProps<T>>) {
    if (pathname === "*") {
      this._defaultHandler = handler as Handler<{}>;
      return this;
    }

    const regexSource = pathname.replace(/:(\w+)/g, (_, p) => `(?<${p}>\\w+)`);
    this._routes.push({
      regex: RegExp("^" + regexSource + "$"),
      handler
    });
    return this;
  }

  public async navigate(pathname: PathName) {
    await this._startNavigation(pathname);
    this._updatePageUrl(pathname);
    await this._completeNavigation(pathname);
  }

  public onNavigationStarted(listener: (data: NavigationStartedData) => void | Promise<void>) {
    this._navStartedStack.push(listener);
  }

  public onNavigationComplete(listener: (data: NavigationCompleteData) => void | Promise<void>) {
    this._navCompleteStack.push(listener);
  }

  public async start() {
    window.addEventListener("popstate", () => {
      setTimeout(() => {
        this.navigate(location.pathname as PathName);
      }, 0);
    });
    const pathname = location.pathname as PathName;
    await this._startNavigation(pathname);
    await this._completeNavigation(pathname);
  }

  protected _updatePageUrl(pathname: PathName) {
    history.pushState({}, "", pathname);
  }

  protected _findHandlerArgs(pathname: PathName) {
    for (const { regex, handler } of this._routes) {
      const matchArray = pathname.match(regex);

      if (matchArray) {
        const request = new RouterRequest(pathname, matchArray.groups ?? {});
        const response = new RouterResponse();
        return { request, response, handler };
      }
    }

    return {
      request: new RouterRequest(pathname, {}),
      response: new RouterResponse(),
      handler: this._defaultHandler
    };
  }

  protected async _startNavigation(pathname: PathName) {
    for (const listener of this._navStartedStack)
      await listener({ pathname });
  }

  protected async _completeNavigation(pathname: PathName) {
    const { request, response, handler } = this._findHandlerArgs(pathname);
    await handler(request, response);
    const responseProps = response[responsePropertiesSymbol];
    const data = { ...responseProps, pathname };

    for (const listener of this._navCompleteStack)
      await listener(data);
  }
}

interface NavigationStartedData {
  pathname: string;
}

interface NavigationCompleteData {
  pathname: string;
  documentTitle: string | null;
  /**
   * Will only be null if it wasn't set by a route handler.
   */
  component: Node | null;
}