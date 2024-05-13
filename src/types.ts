import type RouterRequest from "$src/RouterRequest.js";
import type RouterResponse from "$src/RouterResponse.js";

type PathName = `/${string}`;
type Props = Record<string, string>;
type Handler<T extends Props> = (request: RouterRequest<T>, response: RouterResponse) => void | Promise<void>;

interface Route<T extends Props> {
  readonly regex: RegExp;
  readonly handler: Handler<T>;
}

type InferProps<S extends string, P extends Props = {}> =
  S extends `/:${infer S2}/${infer S3}`
  ? { [K in S2]: string } & InferProps<S3, P>
  : S extends `/:${infer S2}`
  ? { [K in S2]: string } & P
  : S extends `/${infer _}/:${infer S2}`
  ? InferProps<`/:${S2}`, P>
  : P;

export type {
  InferProps,
  PathName,
  Props,
  Handler,
  Route,
};