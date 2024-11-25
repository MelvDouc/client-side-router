import Cached from "$src/decorators/Cached.js";
import CustomElement from "$src/decorators/CustomElement.js";
import PageNotFoundError from "$src/errors/PageNotFoundError.js";
import RedirectError from "$src/errors/RedirectError.js";
import Route from "$src/Route.js";
import type { NavCompleteCallback, NavStartedCallback, OptionalPromise, TitleTransformFn } from "$src/types.js";

@CustomElement("router-outlet")
export default class RouterOutlet extends HTMLElement {
  private static instance: RouterOutlet | null = null;

  public static async navigate(path: string): Promise<void> {
    if (!this.instance)
      throw new Error("No RouterOutlet instance has been defined.");

    await this.instance._navigate(path);
  }

  public static redirect(path: string): never {
    if (!this.instance)
      throw new Error("No RouterOutlet instance has been defined.");

    throw new RedirectError(path);
  }

  private static defaultTitleTransform(title: string): string {
    return title;
  }

  private readonly _routes: Route<string>[];
  private readonly _navStartedCallback: NavStartedCallback | null;
  private readonly _navCompleteCallback: NavCompleteCallback | null;
  private readonly _basePath: string;
  private readonly _titleTransformFn: TitleTransformFn;

  public constructor(params: RouterOutletParams) {
    super();
    this._routes = params.children ?? [];
    this._navStartedCallback = params.onNavigationStarted ?? null;
    this._navCompleteCallback = params.onNavigationComplete ?? null;
    this._basePath = params.basePath ?? "";
    this._titleTransformFn = params.titleTransformFn ?? RouterOutlet.defaultTitleTransform;
    RouterOutlet.instance = this;
  }

  public async connectedCallback(): Promise<void> {
    this.style.display = "contents";

    // 1 - handle popState
    window.addEventListener("popstate", async () => {
      await this._navigateToCurrentLocation();
    });

    // 2 - navigate on connection to DOM
    await this._navigateToCurrentLocation();
  }

  private async _navigate(path: string): Promise<void> {
    try {
      await this._handleNavigation(path);
    } catch (error) {
      if (error instanceof RedirectError) {
        await this._handleRedirection(error.targetPath);
        return;
      }
      if (error instanceof PageNotFoundError) {
        await this._handlePageNotFound();
        return;
      }
      console.warn({
        message: "Unhandled navigation error",
        path,
        error
      });
    }
  }

  private async _navigateToCurrentLocation(): Promise<void> {
    const path = location.pathname.slice(this._basePath.length);
    await this._navigate(path);
  }

  private async _handleNavigation(shortPath: string): Promise<void> {
    const fullPath = this._basePath + shortPath;

    if (location.pathname !== fullPath)
      history.pushState({}, "", fullPath);

    if (this._navStartedCallback)
      await this._navStartedCallback({ path: shortPath });

    const [title, component] = this._findUIParams(shortPath);
    await this._updateUI(title, component);

    if (this._navCompleteCallback)
      await this._navCompleteCallback({ path: shortPath, title });
  }

  private async _handleRedirection(targetPath: string): Promise<void> {
    if (targetPath === location.pathname) {
      console.warn(`Redirection to current path "${targetPath}".`);
      return;
    }

    await this._navigate(targetPath);
  }

  private async _handlePageNotFound(): Promise<void> {
    await this._updateUI("Page not found", () => {
      const heading = document.createElement("h1");
      heading.innerText = "Page not found";
      return heading;
    });
  }

  @Cached
  private _findUIParams(path: string): UIParams {
    for (const layer of this._routes) {
      const uiParams = layer.getUIParams(path);
      if (uiParams)
        return uiParams;
    }

    throw new PageNotFoundError(path);
  }

  private async _updateUI(title: string, component: ReadyComponent) {
    document.title = this._titleTransformFn(title);
    this.replaceChildren(await component());
  }
}

// ===== ===== ===== ===== =====
// TYPES
// ===== ===== ===== ===== =====

type ReadyComponent = () => OptionalPromise<Node>;
type UIParams = [title: string, component: ReadyComponent];

export interface RouterOutletParams {
  children?: Route<string>[];
  onNavigationStarted?: NavStartedCallback | null;
  onNavigationComplete?: NavCompleteCallback | null;
  /**
   * A pathname prefix as in "my-website.com/BASE_PATH/home".
   * @default ""
   */
  basePath?: string;
  titleTransformFn?: TitleTransformFn;
}