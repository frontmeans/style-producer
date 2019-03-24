import { AfterEvent, AfterEvent__symbol, EventKeeper } from 'fun-events';
import { StypSelector } from '../selector';
import { StypProperties } from './properties';

export abstract class StypDeclaration implements EventKeeper<[StypProperties]> {

  /**
   * @internal
   */
  private _read?: AfterEvent<[StypProperties]>;

  abstract readonly root: StypDeclaration;

  abstract readonly selector: StypSelector.Normalized;

  abstract readonly spec: StypProperties.Builder;

  /**
   * Whether this declaration is empty.
   *
   * This is `true` when declaration is guaranteed to be empty, or `false` if it is not empty, or it is not known for
   * sure.
   */
  get empty(): boolean {
    return false;
  }

  get read(): AfterEvent<[StypProperties]> {
    return this._read || (this._read = this.spec(this));
  }

  get [AfterEvent__symbol](): AfterEvent<[StypProperties]> {
    return this.read;
  }

  abstract select(selector: StypSelector): StypDeclaration;

}
