import { AfterEvent__symbol, EventKeeper } from 'fun-events';

/**
 * @internal
 */
export function isValueKeeper(value: any): value is EventKeeper<any> {
  return AfterEvent__symbol in value;
}
