import type { Component, RouteProps, RouterChild } from "$src/types.js";

export default function Route<T extends string>({ path, component, title }: RouteProps<T>): RouterChild {
  return [path, { title, component: component as Component<Record<string, string>> }];
}