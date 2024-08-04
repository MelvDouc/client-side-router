import Cached from "$src/decorators/Cached.js";
import CustomElement from "$src/decorators/CustomElement.js";
import PageNotFoundError from "$src/errors/PageNotFoundError.js";
import RedirectError from "$src/errors/RedirectError.js";
import UnhandledNavigationError from "$src/errors/UnhandledNavigationError.js";
import EventTypes from "$src/EventTypes.js";
import type { RouteDefinition, RouterChild, RouterOutletParams, UsableRouteDefinition } from "$src/types.js";

@CustomElement("router-outlet")
export default class RouterOutlet extends HTMLElement {
  /**
   * Asynchronously navigate to the given path.
   */
  public static navigate(path: string): void {
    this._dispatchNavRequest(path);
  }

  /**
   * Throw an error in order to be redirected to a different page. This is useful in component functions when you don't want to render anything if a condition is met.
   * @param path The pathname to the desired page.
   * @throws {RedirectError}
   */
  public static redirect(path: string): never {
    throw new RedirectError(path);
  }

  private static _createRouteDefMap(children: RouterChild[]) {
    return children.reduce((acc, [path, routeDef]) => {
      const source = path.replace(/:([a-zA-Z_]\w*)/g, (_, p) => `(?<${p}>[^/]+)`);
      return acc.set(RegExp(`^${source}$`), routeDef);
    }, new Map<RegExp, RouteDefinition>());
  }

  private static _dispatchNavRequest(path: string) {
    document.dispatchEvent(
      new CustomEvent(EventTypes.NavigationRequest, { detail: path })
    );
  }

  private readonly _routeDefs: Map<RegExp, RouteDefinition>;
  private readonly _onNavigationStarted: ((navStartedParams: { path: string; }) => void | Promise<void>) | null;
  private readonly _onNavigationComplete: ((navCompleteParams: UsableRouteDefinition) => void | Promise<void>) | null;

  public constructor({ children, onNavigationStarted, onNavigationComplete }: RouterOutletParams) {
    super();
    this._routeDefs = RouterOutlet._createRouteDefMap(children ?? []);
    this._onNavigationStarted = onNavigationStarted ?? null;
    this._onNavigationComplete = onNavigationComplete ?? null;
  }

  public connectedCallback() {
    this.style.display = "contents";
    document.addEventListener(EventTypes.NavigationRequest, async (e) => {
      await this._navigateSafe((e as CustomEvent<string>).detail);
    });
    document.addEventListener("DOMContentLoaded", async () => {
      await this._navigateSafe(location.pathname);
    });
    window.addEventListener("popstate", async () => {
      await this._navigateSafe(location.pathname);
    });
    document.addEventListener("click", (e) => {
      this._handleAnchors(e);
    });
  }

  private async _navigateSafe(path: string) {
    try {
      await this._navigate(path);
    } catch (error) {
      if (error instanceof PageNotFoundError) {
        this._display404Page();
        return;
      }
      if (error instanceof RedirectError) {
        await this._navigateSafe(error.targetPath);
        return;
      }
      throw new UnhandledNavigationError("Unhandled navigation error.", { cause: error });
    }
  }

  private async _navigate(path: string) {
    const decodedPath = decodeURIComponent(path);
    const routeDef = this._findUsableRouteDef(decodedPath);

    // `location.pathname` is decoded.
    if (decodedPath !== location.pathname)
      history.pushState({}, "", decodedPath);

    if (!routeDef)
      throw new PageNotFoundError(decodedPath);

    if (this._onNavigationStarted)
      await this._onNavigationStarted({ path: decodedPath });

    await this._updateUI(routeDef);

    if (this._onNavigationComplete)
      await this._onNavigationComplete(routeDef);
  }

  @Cached
  private _findUsableRouteDef(path: string): UsableRouteDefinition | null {
    for (const [pathRegex, route] of this._routeDefs) {
      const matchArray = path.match(pathRegex);
      if (matchArray)
        return { params: matchArray.groups ?? {}, ...route };
    }

    return null;
  }

  private async _updateUI({ component, params, title }: UsableRouteDefinition) {
    document.title = title;
    this.replaceChildren(await component(params));
  }

  private _display404Page() {
    document.title = "Page not found";
    const h1 = document.createElement("h1");
    h1.innerText = document.title;
    this.replaceChildren(h1);
  }

  private _handleAnchors(e: Event) {
    if (e.target instanceof HTMLAnchorElement) {
      const url = new URL(e.target.href);
      if (url.origin !== location.origin)
        return;
      e.preventDefault();
      this._navigateSafe(url.pathname);
    }
  }
}