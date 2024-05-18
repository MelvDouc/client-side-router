export default class TypedEventEmitter<T extends Record<string, unknown>> {
  private readonly listeners = {} as {
    [K in keyof T]: Listener<T, K>[];
  };

  public on<EvtType extends keyof T>(type: EvtType, listener: Listener<T, EvtType>) {
    this.listeners[type] ??= [];
    this.listeners[type].push(listener);
  }

  public emit<EvtType extends keyof T>(type: EvtType, arg: T[EvtType]) {
    if (type in this.listeners)
      for (const listener of this.listeners[type])
        listener(arg);
  }

  public remove<EvtType extends keyof T>(type: EvtType, listener: Listener<T, EvtType>) {
    const listeners = this.listeners[type];
    if (listeners)
      this.listeners[type] = listeners.filter((element) => element !== listener);
  }
}

export type Listener<T extends Record<string, unknown>, K extends keyof T> = (arg: T[K]) => unknown;