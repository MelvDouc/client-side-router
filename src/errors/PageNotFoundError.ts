/**
 * The error raised when navigation to a given URL is request but no route has been defined for it.
 */
export default class PageNotFoundError extends Error {
  public constructor(public readonly path: string) {
    super();
  }
}