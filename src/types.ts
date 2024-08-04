export type InferParams<T extends string> =
  T extends `/${infer A}/${infer B}`
  ? InferParams<`/${A}`> & InferParams<`/${B}`>
  : T extends `/${infer A}`
  ? (A extends `:${infer P}` ? { [K in P]: string; } : {})
  : {};


export type Component<P extends {}> = (params: P) => Node | Promise<Node>;

export interface RouteDefinition<P extends {} = {}> {
  /**
   * The document title for a given page.
   */
  title: string;
  /**
   * A function that returns the element to render in a given page.
   */
  component: Component<P>;
}

export interface UsableRouteDefinition<P extends {} = any> extends RouteDefinition<P> {
  /**
   * A dictionary of dynamic params based on the current URL.
   */
  params: P;
}

export type RouterChild = [path: string, routeDef: RouteDefinition<Record<string, string>>];

export type RouteProps<T extends string> = RouteDefinition<InferParams<T>> & {
  /**
   * The pathname to the route URL. Examples: `"/"`, `"/about"`, `"/profile/:id"`.
   * Use `".+"` for a default route.
   */
  path: T;
};

export interface RouterOutletParams {
  /**
   * An array of `RouteDef` created using the `Route` function.
   */
  children?: RouterChild[];
  /**
   * A function to run as soon as a navigation request is made. It can be asynchronous.
   * @param navStartedParams An object containing the path to the URL being navigated to.
   */
  onNavigationStarted?: (navStartedParams: { path: string; }) => void | Promise<void>;
  /**
   * A function to run after navigation, once the UI has been updated.
   * @param navCompleteParams An object containing details about the current route.
   */
  onNavigationComplete?: (navCompleteParams: UsableRouteDefinition) => void | Promise<void>;
}