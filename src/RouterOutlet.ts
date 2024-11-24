import Cached from "$src/decorators/Cached.js";
import CustomElement from "$src/decorators/CustomElement.js";
import PageNotFoundError from "$src/errors/PageNotFoundError.js";
import RedirectError from "$src/errors/RedirectError.js";
import type Route from "$src/Route.js";
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

  public constructor(
    private readonly _routes: Route<string>[],
    private readonly _navStartedCallback: NavStartedCallback | null,
    private readonly _navCompleteCallback: NavCompleteCallback | null,
    private readonly _baseUrl = "",
    private readonly _titleTransformFn: TitleTransformFn = RouterOutlet.defaultTitleTransform
  ) {
    super();
    RouterOutlet.instance = this;
  }

  public async connectedCallback(): Promise<void> {
    this.style.display = "contents";

    // 1 - handle popState
    window.addEventListener("popstate", async () => {
      await this._navigate(location.pathname);
    });

    // 2 - modify anchors behavior
    document.addEventListener("click", this._createAnchorHandler());

    // 3 - navigate on connection to DOM
    await this._navigate(location.pathname);
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

  private async _handleNavigation(path: string): Promise<void> {
    const realPath = this._baseUrl + path;

    if (realPath !== location.pathname)
      history.pushState({}, "", realPath);

    if (this._navStartedCallback)
      await this._navStartedCallback({ path });

    const [title, component] = this._findUIParams(path);
    await this._updateUI(title, component);

    if (this._navCompleteCallback)
      await this._navCompleteCallback({ path, title });
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

  private _createAnchorHandler(): (e: Event) => Promise<void> {
    return async (e: Event): Promise<void> => {
      if (!(e.target instanceof HTMLAnchorElement))
        return;

      const url = new URL(e.target.href);

      if (url.origin !== location.origin)
        return;

      e.preventDefault();
      await this._navigate(url.pathname);
    };
  }
}

type ReadyComponent = () => OptionalPromise<Node>;
type UIParams = [title: string, component: ReadyComponent];