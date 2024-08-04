import RouterOutlet from "$src/RouterOutlet.js";
import type { RouterOutletParams } from "$src/types.js";

export default function Router(params: RouterOutletParams) {
  return new RouterOutlet(params);
}

export function navigate(path: string) {
  RouterOutlet.navigate(path);
}

export function redirect(path: string) {
  RouterOutlet.redirect(path);
}