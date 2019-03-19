import { StypDeclaration } from './declaration';
import { EventKeeper } from 'fun-events';

export interface StypProperties {

  readonly [key: string]: StypProperties.Value;

}

export namespace StypProperties {

  export type Value = string | number | boolean | undefined;

  export type Spec =
      StypProperties
      | EventKeeper<[StypProperties]>
      | ((decl: StypDeclaration) => StypProperties)
      | Builder;

  export type Builder = (decl: StypDeclaration) => EventKeeper<[StypProperties]>;

}
