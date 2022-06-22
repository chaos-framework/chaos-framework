export function ConditionalMethod<T>(func: (this: T, ...args: any[]) => boolean) {
  return function (target: T, propertyKey: string, descriptor: PropertyDescriptor) {
    const original = descriptor.value!;
    descriptor.value = function (...args: any[]) {
      if (func.apply(this as T, args)) {
        return original.apply(this);
      }
    };
  };
}
