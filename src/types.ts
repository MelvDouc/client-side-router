type Props = Record<string, string>;
type Handler<T extends Props> = (request: RouterRequest<T>, response: RouterResponse) => void | Promise<void>;

interface Route<T extends Props> {
  readonly regex: RegExp;
  readonly handler: Handler<T>;
}

interface RouterRequest<T extends Props> {
  readonly pathname: string;
  /**
   * For example, the pathname `/profile/:id` will produce the params `{ id: string }`.
   */
  readonly params: T;
}

interface RouterResponse {
  /**
   * Set the document title.
   */
  setTitle: (title: string) => RouterResponse;
  /**
   * Define the component corresponding to the current route.
   */
  setComponent: (component: Node) => void;
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
  Props,
  Handler,
  RouterRequest,
  RouterResponse,
  Route,
};