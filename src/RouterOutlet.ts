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
    document.dispatchEvent(
      new CustomEvent(EventTypes.NavigationRequest, { detail: path })
    );
  }

  /**
   * Create an error in order to be redirected to a different page. This is useful in component functions when you don't want to render anything if a condition is met.
   * @param path The pathname to the desired page.
   */
  public static redirect(path: string): RedirectError {
    return new RedirectError(path);
  }

  private static _createRouteDefMap(children: RouterChild[]): Map<RegExp, RouteDefinition> {
    return children.reduce((acc, [path, routeDef]) => {
      const source = path.replace(/:([a-zA-Z_]\w*)/g, (_, p) => `(?<${p}>[^/]+)`);
      return acc.set(RegExp(`^${source}$`), routeDef);
    }, new Map<RegExp, RouteDefinition>());
  }

  private readonly _routeDefs: Map<RegExp, RouteDefinition>;
  private readonly _onNavigationStarted: ((navStartedParams: { path: string; }) => void | Promise<void>) | null;
  private readonly _onNavigationComplete: ((navCompleteParams: UsableRouteDefinition) => void | Promise<void>) | null;
  private _currentPath = "";

  public constructor({ children, onNavigationStarted, onNavigationComplete }: RouterOutletParams) {
    super();
    this._routeDefs = RouterOutlet._createRouteDefMap(children ?? []);
    this._onNavigationStarted = onNavigationStarted ?? null;
    this._onNavigationComplete = onNavigationComplete ?? null;
  }

  public async connectedCallback(): Promise<void> {
    document.addEventListener(EventTypes.NavigationRequest, async (e) => {
      await this._navigateSafe((e as CustomEvent<string>).detail, true);
    });
    document.addEventListener(EventTypes.NavigationComplete, async (e) => {
      const { detail: routeDef } = e as CustomEvent<UsableRouteDefinition>;
      await this._updateUI(routeDef);
      if (this._onNavigationComplete)
        await this._onNavigationComplete(routeDef);
    });
    window.addEventListener("popstate", async () => {
      await this._navigateSafe(location.pathname, false);
    });
    document.addEventListener("click", async (e) => {
      await this._handleAnchors(e);
    });
    this.style.display = "contents";
    await this._navigateSafe(location.pathname, false);
  }

  private async _navigateSafe(path: string, pushState: boolean): Promise<void> {
    try {
      await this._navigate(decodeURIComponent(path), pushState);
    } catch (error) {
      if (error instanceof PageNotFoundError) {
        this._display404Page();
        return;
      }
      if (error instanceof RedirectError) {
        await this._navigateSafe(error.targetPath, pushState);
        return;
      }
      throw new UnhandledNavigationError("Unhandled navigation error.", { cause: error });
    }
  }

  private async _navigate(decodedPath: string, pushState: boolean): Promise<void> {
    if (decodedPath === this._currentPath)
      return;

    this._currentPath = decodedPath;

    if (pushState)
      history.pushState({}, "", decodedPath);

    if (this._onNavigationStarted)
      await this._onNavigationStarted({ path: decodedPath });

    const routeDef = this._findUsableRouteDef(decodedPath);

    if (!routeDef)
      throw new PageNotFoundError(decodedPath);

    document.dispatchEvent(
      new CustomEvent(EventTypes.NavigationComplete, { detail: routeDef })
    );
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

  private async _updateUI({ component, params, title }: UsableRouteDefinition): Promise<void> {
    document.title = title;
    this.replaceChildren(await component(params));
  }

  private _display404Page(): void {
    document.title = "Page not found";
    const h1 = document.createElement("h1");
    h1.innerText = document.title;
    this.replaceChildren(h1);
  }

  private async _handleAnchors(e: Event): Promise<void> {
    if (e.target instanceof HTMLAnchorElement) {
      const url = new URL(e.target.href);
      if (url.origin !== location.origin)
        return;
      e.preventDefault();
      await this._navigateSafe(url.pathname, true);
    }
  }
}