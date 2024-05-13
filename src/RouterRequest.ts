import type { Props } from "$src/types.js";

export default class RouterRequest<T extends Props> {
  public readonly pathname: string;
  /**
   * For example, the pathname `/profile/:id` will produce the params `{ id: string }`.
   */
  public readonly params: T;

  public constructor(pathname: string, params: T) {
    this.pathname = pathname;
    this.params = params;
  }
}