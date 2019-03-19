import { AfterEvent, AfterEvent__symbol, afterEventFrom, EventEmitter, EventKeeper } from 'fun-events';

/**
 * @internal
 */
export function keepValue<T>(value: T): AfterEvent<[T]> {
  return afterEventFrom(new EventEmitter<[T]>(), [value]);
}

/**
 * @internal
 */
export function isValueKeeper(value: any): value is EventKeeper<any> {
  return AfterEvent__symbol in value;
}
