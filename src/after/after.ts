import {AfterConfig, AfterFunc} from './after.model';
import {Decorator, Method} from '../common/model/common.model';

export function after<T = any, D = any>(config: AfterConfig<T, D>): Decorator<T> {
  const resolvedConfig: AfterConfig<T, D> = {
    wait: false,
    ...config,
  };

  return (
    target: T,
    propertyName: keyof T,
    descriptor: TypedPropertyDescriptor<Method<any>>,
  ): TypedPropertyDescriptor<Method<any>> => {
    if (descriptor.value) {
      const originalMethod = descriptor.value;
      descriptor.value = async function (...args: any[]): Promise<void> {
        const afterFunc: AfterFunc<D> = typeof resolvedConfig.func === 'string' ? this[resolvedConfig.func].bind(this)
          : resolvedConfig.func;

        if (resolvedConfig.wait) {
          const response = await originalMethod.apply(this, args);
          afterFunc({
            args,
            response,
          });
        } else {
          const response = originalMethod.apply(this, args);
          afterFunc({
            args,
            response,
          });
        }
      };

      return descriptor;
    }
    throw new Error('@after is applicable only on a methods.');
  };
}
