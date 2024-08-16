export default function Cached<K, V>(method: (arg: K, ...args: unknown[]) => V, ctx: ClassMethodDecoratorContext<any>): void {
  const cache = new Map<K, V>();

  ctx.addInitializer(function () {
    this[ctx.name] = (arg: K, ...args: unknown[]) => {
      if (cache.has(arg))
        return cache.get(arg);
      const value = method.call(this, arg, ...args);
      cache.set(arg, value);
      return value;
    };
  });
}