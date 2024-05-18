import type RouterRequest from "$src/RouterRequest.js";
import type RouterResponse from "$src/RouterResponse.js";

type PathName = `/${string}`;
type Props = Record<string, string>;
type Handler<T extends Props> = (request: RouterRequest<T>, response: RouterResponse) => OptionalPromise<void>;

interface Route<T extends Props> {
  readonly regex: RegExp;
  readonly handler: Handler<T>;
}

type OptionalPromise<T> = T | Promise<T>;

type InferParams<T extends string> =
  T extends `/${infer A}/${infer B}`
  ? InferParams<`/${A}`> & InferParams<`/${B}`>
  : T extends `/${infer A}`
  ? (A extends `:${infer P}` ? { [K in P]: string; } : {})
  : {};

export type {
  InferParams,
  OptionalPromise,
  PathName,
  Props,
  Handler,
  Route,
};