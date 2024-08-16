import type RedirectError from "$src/errors/RedirectError.js";
import RouterOutlet from "$src/RouterOutlet.js";
import type { RouterOutletParams } from "$src/types.js";

export default function Router(params: RouterOutletParams): RouterOutlet {
  return new RouterOutlet(params);
}

export function navigate(path: string): void {
  RouterOutlet.navigate(path);
}

export function redirect(path: string): RedirectError {
  return RouterOutlet.redirect(path);
}