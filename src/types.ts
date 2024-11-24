export type OptionalPromise<T> = T | Promise<T>;

export type InferParams<T extends string> =
  T extends `${infer A}/${infer B}` ? InferParams<A> & InferParams<B>
  : T extends `/${infer A}` ? InferParams<A>
  : T extends `:${infer A}` ? { [K in A]: string }
  : {};

export type StringRecord = Record<string, string>;

export type Component<P extends StringRecord> = (params: P) => OptionalPromise<Node>;

export type TitleFn<P extends StringRecord> = (params: P) => string;
export type TitleTransformFn = ((title: string) => string);

interface NavStartedParams {
  path: string;
}

export type NavStartedCallback = (navStartedParams: NavStartedParams) => unknown;

interface NavCompleteParams {
  path: string;
  title: string;
}

export type NavCompleteCallback = (navCompleteParams: NavCompleteParams) => unknown;