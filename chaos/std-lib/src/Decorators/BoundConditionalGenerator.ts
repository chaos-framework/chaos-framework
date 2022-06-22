export function BoundConditionalGenerator<T>(func: (this: T, ...args: any[]) => boolean) {
  return function (
    target: T,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<(...args: any[]) => AsyncGenerator<any>>
  ) {
    const original = descriptor.value!;
    descriptor.value = async function* (...args: any[]): AsyncGenerator<any> {
      if (func.apply(this as T, args)) {
        yield* original.apply(this, args);
      }
    };
  };
}
