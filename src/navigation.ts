import NavRequest from "$/src/context/NavRequest";
import RequestKind from "$/src/context/RequestKind";
import EventBus from "$/src/EventBus";
import RouteLoader from "$/src/RouteLoader/RouteLoader";
import RouterOutlet from "$/src/RouterOutlet";
import type {
  Component,
  ComponentParams,
  InferParams,
  NavCompleteResult,
  OptionalPromise
} from "$/src/types";

/**
 * Create a dynamic router for a single page application.
 * @param params The router parameters.
 * @returns A container element whose children will be dynamically updated on every navigation request.
 */
export function Router({ basePath = "", onNavStarted, onNavComplete, internalLinks = false }: {
  /**
   * A prefix for all path names.
   * It must match the pattern `^(/[^/]+)*$`.
   */
  basePath?: string;
  /**
   * A function to run whenever a navigation request starts.
   * It can be used, for example, to activate a spinner animation.
   * @param request An object containing details about the route being navigated to.
   */
  onNavStarted?: (request: NavRequest) => OptionalPromise<void>;
  /**
   * A function to run whenever a navigation request ends.
   * It can be used, for example, to stop a spinner animation.
   * @param result An object containing details about the newly accessed route.
   */
  onNavComplete?: (result: NavCompleteResult) => OptionalPromise<void>;
  /**
   * Whether to use this router automatically
   * when an anchor that redirects to an internal page is clicked.
   * @default false
   */
  internalLinks?: boolean;
  /**
   * An array of calls to the `Route` function.
   * Every call to route creates a new route definition
   * but nothing is appended to the element returned by `Router`.
   */
  children?: unknown;
}) {
  if (onNavStarted)
    EventBus.onNavRequest(onNavStarted);

  if (onNavComplete)
    EventBus.onNavComplete(onNavComplete);

  return new RouterOutlet(basePath, internalLinks);
}

/**
 * Create a route definition.
 * @param params The route parameters: a path and a component function.
 * @returns No value as this doesn't create an HTML node.
 */
export function Route<T extends string>({ path, component, name }: {
  /**
   * A static or dynamic path. Examples:
   * - `"/"`
   * - `"/profile/:id"`
   * - `".*"` (for default routes)
   *
   * Dynamic parameters will be passed as an object parameter to the component function.
   */
  path: T;
  /**
   * A function that returns an HTML node or string.
   * It can be asynchronous.
   */
  component: Component<InferParams<T>>;
  /**
   * An optional name for the route.
   * It can used to navigate to the route using the `navigateToRoute` function.
   */
  name?: string;
}): null {
  RouteLoader.addRouteDefinition(path, component as Component<ComponentParams>, name);
  return null;
}

/**
 * Trigger a navigation event.
 * @param path The path to the desired page.
 */
export function navigate(path: string): void {
  EventBus.emitNavRequestOf(RequestKind.Normal, path);
}

/**
 * Trigger a navigation event.
 * @param routeName The name of the route as defined in a call to the `Route` function.
 * @param params An optional object to pass in to the route's component function.
 */
export function navigateToRoute(routeName: string, params: ComponentParams = {}): void {
  const request = RouteLoader.createRequestFromRouteName(routeName, params);
  EventBus.emitNavRequest(request);
}