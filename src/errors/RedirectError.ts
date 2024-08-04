/**
 * An error raised only to request navigation to a different URL.
 */
export default class RedirectError extends Error {
  public constructor(public readonly targetPath: string) {
    super();
  }
}