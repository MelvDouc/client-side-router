import type RequestKind from "$/src/context/RequestKind";

export type OptionalPromise<T> = T | Promise<T>;
export type ComponentParams = Record<string, string>;
export type Component<T extends ComponentParams = ComponentParams> = (params: T) => OptionalPromise<string | Node>;

export type InferParams<T extends string> =
  T extends `${infer A}/${infer B}` ? InferParams<A> & InferParams<B>
  : T extends `/${infer A}` ? InferParams<A>
  : T extends `:${infer A}` ? { [K in A]: string }
  : {};

export interface NavCompleteResult {
  requestKind: RequestKind;
  pathName: string;
  routeName: string;
  params: ComponentParams;
  component: Component;
}