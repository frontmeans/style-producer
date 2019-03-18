import { AfterEvent, AfterEvent__symbol, afterEventFrom, EventKeeper } from 'fun-events';
import { StypSelector } from './selector';
import { StypProperties } from './properties';

export abstract class StypDeclaration implements EventKeeper<[StypProperties]> {

  /**
   * @internal
   */
  private _properties?: AfterEvent<[StypProperties]>;

  abstract readonly root: StypDeclaration;

  abstract readonly selector: StypSelector.Normalized;

  get properties(): AfterEvent<[StypProperties]> {
    return this._properties || (this._properties = afterEventFrom(this.build()));
  }

  get [AfterEvent__symbol](): AfterEvent<[StypProperties]> {
    return this.properties;
  }

  abstract select(selector: StypSelector): StypDeclaration;

  abstract build(): EventKeeper<[StypProperties]>;

}
