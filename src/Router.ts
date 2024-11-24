import _Route from "$src/Route.js";
import RouterOutlet from "$src/RouterOutlet.js";
import type {
  Component,
  InferParams,
  NavCompleteCallback,
  NavStartedCallback,
  StringRecord,
  TitleFn,
  TitleTransformFn
} from "$src/types.js";

export default function Router({
  children = [],
  onNavigationStarted: navStartedCallback = null,
  onNavigationComplete: navCompleteCallback = null,
  baseUrl,
  titleTransformFn
}: RouterOutletParams): RouterOutlet {
  return new RouterOutlet(
    children,
    navStartedCallback,
    navCompleteCallback,
    baseUrl,
    titleTransformFn
  );
}

export function Route<Path extends string>({ path, title, component }: RouteParams<Path>): _Route<Path> {
  return new _Route(path, title, component);
}

/**
 * Navigate to a given path.
 * @param path The pathname to the desired location.
 */
export async function navigate(path: string): Promise<void> {
  await RouterOutlet.navigate(path);
}

/**
 * Throw a `RedirectError`. It will be caught by the router instance and trigger a new navigation.
 * @param path The pathname to the desired location.
 */
export function redirect(path: string): never {
  RouterOutlet.redirect(path);
}

interface RouterOutletParams {
  children?: _Route<string>[];
  onNavigationStarted?: NavStartedCallback | null;
  onNavigationComplete?: NavCompleteCallback | null;
  baseUrl?: string;
  titleTransformFn?: TitleTransformFn;
}

interface RouteParams<Path extends string, Params extends StringRecord = InferParams<Path>> {
  path: Path;
  title: string | TitleFn<Params>;
  component: Component<Params>;
}