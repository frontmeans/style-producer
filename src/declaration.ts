import { AfterEvent, AfterEvent__symbol, afterEventFrom, EventKeeper } from 'fun-events';
import { StypSelector } from './selector';
import { StypProperties, StypPropertiesBuilder } from './properties';

export abstract class StypDeclaration implements EventKeeper<[StypProperties]> {

  /**
   * @internal
   */
  private _properties?: AfterEvent<[StypProperties]>;

  abstract readonly root: StypDeclaration;

  abstract readonly selector: StypSelector.Normalized;

  abstract readonly spec: StypPropertiesBuilder;

  get read(): AfterEvent<[StypProperties]> {
    return this._properties || (this._properties = afterEventFrom(this.spec(this)));
  }

  get [AfterEvent__symbol](): AfterEvent<[StypProperties]> {
    return this.read;
  }

  abstract select(selector: StypSelector): StypDeclaration;

}
