import { AfterEvent, AfterEvent__symbol, EventKeeper, EventSender, OnEvent, OnEvent__symbol } from 'fun-events';
import { StypSelector } from './selector';

export abstract class StypDeclaration
    implements EventSender<[StypProperties, StypProperties]>, EventKeeper<[StypProperties]> {

  abstract readonly root: StypDeclaration;

  abstract readonly selector: StypSelector.Normalized;

  abstract readonly onUpdate: OnEvent<[StypProperties, StypProperties]>;

  get [OnEvent__symbol](): OnEvent<[StypProperties, StypProperties]> {
    return this.onUpdate;
  }

  abstract readonly read: AfterEvent<[StypProperties]>;

  get [AfterEvent__symbol](): AfterEvent<[StypProperties]> {
    return this.read;
  }

  abstract select(selector: StypSelector): StypDeclaration;

}

export interface StypProperties {

  readonly [key: string]: string | number | boolean | undefined;

}
