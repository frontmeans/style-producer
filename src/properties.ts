import { StypDeclaration } from './declaration';
import { EventKeeper } from 'fun-events';

export type StypValue = string | number | boolean | undefined;

export interface StypProperties {

  readonly [key: string]: StypValue;

}

export type StypPropertiesSpec =
    StypProperties
    | EventKeeper<[StypProperties]>
    | ((this: StypDeclaration) => StypProperties | EventKeeper<[StypProperties]>);
