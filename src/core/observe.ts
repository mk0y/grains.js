// src/core/observe.ts
export function observe<T extends object>(obj: T, callback: () => void): T {
  const handler: ProxyHandler<T> = {
    get(target: T, property: string | symbol): any {
      const value = Reflect.get(target, property);
      if (value && typeof value === "object" && !Array.isArray(value)) {
        return observe(value, callback);
      }
      return value;
    },

    set(target: T, property: string | symbol, value: any): boolean {
      const oldValue = Reflect.get(target, property);
      const result = Reflect.set(target, property, value);

      if (oldValue !== value) {
        requestAnimationFrame(() => callback());
      }

      return result;
    },

    deleteProperty(target: T, property: string | symbol): boolean {
      const hadProperty = property in target;
      const result = Reflect.deleteProperty(target, property);

      if (hadProperty) {
        requestAnimationFrame(() => callback());
      }

      return result;
    },
  };

  return new Proxy(obj, handler);
}
