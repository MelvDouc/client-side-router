import RouterRequest from "$src/RouterRequest.js";
import RouterResponse from "$src/RouterResponse.js";
import { responsePropertiesSymbol } from "$src/symbols.js";
import TypedEventEmitter from "$src/TypedEventEmitter.js";
import type {
  InferParams,
  PathName,
  Handler,
  OptionalPromise,
  Route
} from "$src/types.js";

export default class Router {
  protected static readonly _pathRegex = /:([a-zA-Z_]\w*)/g;

  protected static _getDefaultComponent() {
    const heading = document.createElement("h1");
    heading.innerText = "Page not found";
    return heading;
  }

  protected readonly _routes: Route<any>[] = [];
  protected readonly _eventEmitter = new TypedEventEmitter<{
    navStarted: NavigationStartedData;
    navComplete: NavigationCompleteData;
  }>();
  protected _defaultHandler: Handler<{}> = (_, res) => {
    res
      .setDocumentTitle("Page not found")
      .setComponent(Router._getDefaultComponent());
  };

  public setRoute<T extends PathName | "*">(
    pathname: T,
    handler: Handler<InferParams<T>>
  ) {
    if (pathname === "*") {
      this._defaultHandler = handler as Handler<{}>;
      return this;
    }

    const regexSource = pathname.replace(Router._pathRegex, (_, p) => `(?<${p}>[^\\/]+)`);
    this._routes.push({
      regex: RegExp(`^${regexSource}$`),
      handler
    });
    return this;
  }

  public async navigate(pathname: PathName) {
    await this._navigate(pathname, true);
  }

  private async _navigate(pathname: PathName, updateUrl: boolean) {
    this._startNavigation(pathname);
    updateUrl && this._updatePageUrl(pathname);
    await this._completeNavigation(pathname);
  }

  public onNavigationStarted(listener: NavigationStartedCallbackFn) {
    this._eventEmitter.on("navStarted", listener);
  }

  public onNavigationComplete(listener: NavigationCompleteCallbackFn) {
    this._eventEmitter.on("navComplete", listener);
  }

  public async start() {
    window.addEventListener("popstate", async () => {
      const pathname = await new Promise((resolve) => {
        setTimeout(() => resolve(location.pathname), 0);
      });
      await this._navigate(pathname as PathName, false);
    });
    await this._navigate(location.pathname as PathName, false);
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

  protected _startNavigation(pathname: PathName) {
    this._eventEmitter.emit("navStarted", { pathname });
  }

  protected async _completeNavigation(pathname: PathName) {
    const { request, response, handler } = this._findHandlerArgs(pathname);
    await handler(request, response);
    const { documentTitle, component } = response[responsePropertiesSymbol];
    const navData = { pathname, documentTitle, component };
    this._eventEmitter.emit("navComplete", navData);
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

type NavigationStartedCallbackFn = (data: NavigationStartedData) => OptionalPromise<void>;
type NavigationCompleteCallbackFn = (data: NavigationCompleteData) => OptionalPromise<void>;