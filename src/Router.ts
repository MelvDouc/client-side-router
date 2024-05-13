import type {
  Handler,
  InferProps,
  Route,
  RouterResponse
} from "$src/types.js";

export default class Router {
  protected static readonly _EventNames = {
    ComponentUpdate: "router-component-update"
  } as const;

  protected static _createResponseClass(router: Router, updateTitle?: (title: string) => string) {
    return class implements RouterResponse {
      public setComponent(component: Node) {
        router.emitComponentUpdate(component);
      }

      public setTitle(title: string) {
        document.title = updateTitle ? updateTitle(title) : title;
        return this;
      }
    };
  }

  protected readonly _routes: Route<any>[] = [];
  protected readonly _eventTarget = new EventTarget();
  protected readonly _baseUrlRegex: RegExp;
  protected readonly _Response: { new(): RouterResponse; };
  /**
   * The component to render when no route was found for the current URL.
   */
  protected _defaultHandler: Handler<any> = (_request, response) => {
    const h1 = document.createElement("h1");
    h1.innerText = "Page not found";
    response
      .setTitle("Page not found")
      .setComponent(h1);
  };

  public constructor({ baseUrl, updateTitle }: {
    /**
     * Update the document title upon navigation, e.g. by a suffix (`{title} | My Site`).
     * @param title The document title.
     */
    updateTitle?: (title: string) => string;
    /**
     * The initial part of every URL that should be ignored when handling routes.
     * Default to an empty string.
     */
    baseUrl?: string;
  }) {
    this._baseUrlRegex = RegExp(`^${baseUrl ?? ""}`);
    this._Response = Router._createResponseClass(this, updateTitle);
    window.addEventListener("popstate", (e) => {
      e.preventDefault();
      this.navigate(location.pathname);
    });
  }

  /**
   * @param pathname Use "*" for the default route.
   * @param handler The function to run at the given pathname.
   */
  public setRoute<T extends `/${string}` | "*">(pathname: T, handler: Handler<InferProps<T>>): Router {
    if (pathname === "*") {
      this._defaultHandler = handler;
      return this;
    }

    const regex = pathname.replace(/:(\w+)/g, (_, param) => `(?<${param}>\\w+)`);
    this._routes.push({
      regex: RegExp("^" + regex + "$"),
      handler
    });
    return this;
  }

  /**
   * Update the app's page component without triggering navigation.
   */
  public emitComponentUpdate(node: Node) {
    this._eventTarget.dispatchEvent(
      new CustomEvent(Router._EventNames.ComponentUpdate, {
        detail: node
      })
    );
  }

  /**
   * Run a function whenever the app's main component is updated.
   */
  public onComponentUpdate(listener: (component: Node) => void | Promise<void>) {
    this._eventTarget.addEventListener(Router._EventNames.ComponentUpdate, (e) => {
      listener((e as CustomEvent<Node>).detail);
    });
  }

  /**
   * Go to the given pathname without reloading the page.
   */
  public async navigate(pathname: string): Promise<void> {
    history.pushState({}, "", pathname);
    this._navigate(pathname);
  }

  private async _navigate(pathname: string): Promise<void> {
    const { request, response, handler } = this._findHandlerArgs(
      pathname.replace(this._baseUrlRegex, "")
    );
    await handler(request, response);
  }

  /**
   * Activate this router instance by navigating to the current pathname.
   */
  public start(): Promise<void> {
    return this._navigate(location.pathname);
  }

  protected _findHandlerArgs(pathname: string) {
    for (const { regex, handler } of this._routes) {
      const matchArray = pathname.match(regex);

      if (matchArray) {
        const request = {
          pathname,
          params: matchArray.groups ?? {}
        };
        const response = new this._Response();
        return { request, response, handler };
      }
    }

    return {
      request: {
        pathname,
        params: {}
      },
      response: new this._Response(),
      handler: this._defaultHandler
    };
  }
}