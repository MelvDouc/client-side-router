import RouterOutletRoute from "$src/Route.js";
import RouterOutlet, { type RouterOutletParams } from "$src/RouterOutlet.js";
import type {
  Component,
  InferParams,
  StringRecord,
  TitleFn
} from "$src/types.js";

export function Router(params: RouterOutletParams): RouterOutlet {
  return new RouterOutlet(params);
}

export function Route<Path extends string>({ path, title, component }: RouteParams<Path>): RouterOutletRoute<Path> {
  return new RouterOutletRoute(path, title, component);
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

interface RouteParams<Path extends string, Params extends StringRecord = InferParams<Path>> {
  path: Path;
  title: string | TitleFn<Params>;
  component: Component<Params>;
}