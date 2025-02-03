import type { ComponentParent, DsxType, JSX_PropsTagNameMap } from "@melvdouc/dsx";

// Extend the global JSX namespace to include custom intrinsic elements.
declare global {
  namespace JSX {
    // Allows TypeScript to infer the return type of components as `JSX.Element`.
    type Element = globalThis.Element;

    // Allows for child nodes to be inferred as the value of the `children` prop.
    interface ElementChildrenAttribute extends ComponentParent { }

    // Necessary for custom JSX to be recognized by TypeScript.
    interface IntrinsicElements extends JSX_PropsTagNameMap { }
  }

  const Dsx: DsxType;
}