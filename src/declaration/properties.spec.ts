import { afterEventFrom, EventEmitter, trackValue } from 'fun-events';
import { stypPropertiesBySpec } from './properties.impl';
import { StypProperties } from './properties';
import { StypDeclaration } from './declaration';

describe('stypPropertiesBySpec', () => {

  let decl: StypDeclaration;

  beforeEach(() => {
    decl = { name: 'style declaration' } as any;
  });

  it('sends empty properties by default', async () => {

    const after = afterEventFrom(stypPropertiesBySpec(decl));

    expect(await new Promise(resolve => after(resolve))).toEqual({});
  });
  it('sends provided properties', async () => {

    const initial = { fontSize: '12px' };
    const after = afterEventFrom(stypPropertiesBySpec(decl, initial));

    expect(await new Promise(resolve => after(resolve))).toEqual(initial);
  });
  it('sends tracked properties', async () => {

    const initial = { fontSize: '12px' };
    const tracker = trackValue(initial);
    const after = afterEventFrom(stypPropertiesBySpec(decl, tracker));

    expect(await new Promise(resolve => after(resolve))).toEqual(initial);

    const updated = { fontSize: '13px' };

    tracker.it = updated;
    expect(await new Promise(resolve => after(resolve))).toEqual(updated);
  });
  it('prevents tracked properties duplicates', () => {

    const initial = { fontSize: '12px' };
    const tracker = trackValue(initial);
    const after = afterEventFrom(stypPropertiesBySpec(decl, tracker));
    const receiver = jest.fn();

    after(receiver);
    expect(receiver).toHaveBeenCalledWith(initial);

    const updated = { fontSize: '13px' };

    tracker.it = initial;
    tracker.it = { ...initial };
    tracker.it = updated;
    expect(receiver).toHaveBeenCalledWith(updated);
    expect(receiver).toHaveBeenCalledTimes(2);
  });
  it('handles raw properties', async () => {

    const initial = { fontSize: '12px' };
    const tracker = trackValue<StypProperties | string>(initial);
    const after = afterEventFrom(stypPropertiesBySpec(decl, tracker));
    const receiver = jest.fn();

    after(receiver);
    expect(receiver).toHaveBeenCalledWith(initial);

    const raw = 'font-size: 13px';

    tracker.it = raw;
    expect(receiver).toHaveBeenCalledWith({ $$css: raw });

    const updated = { fontSize: '13px' };

    tracker.it = updated;
    expect(receiver).toHaveBeenCalledWith(updated);
  });
  it('sends constructed properties', async () => {

    const initial = { fontSize: '12px' };
    const after = afterEventFrom(stypPropertiesBySpec(decl, () => initial));

    expect(await new Promise(resolve => after(resolve))).toEqual(initial);
  });
  it('sends constructed tracked properties', async () => {

    const initial = { fontSize: '12px' };
    const tracker = trackValue(initial);
    const after = afterEventFrom(stypPropertiesBySpec(decl, () => tracker));

    expect(await new Promise(resolve => after(resolve))).toEqual(initial);

    const updated = { fontSize: '13px' };

    tracker.it = updated;
    expect(await new Promise(resolve => after(resolve))).toEqual(updated);
  });
  it('prevents constructed tracked properties duplicates', () => {

    const initial = { fontSize: '12px' };
    const updated = { fontSize: '13px' };
    const properties = { ...initial };
    const emitter = new EventEmitter<[StypProperties]>();
    const tracker = afterEventFrom(emitter, [properties]);
    const after = afterEventFrom(stypPropertiesBySpec(decl, () => tracker));
    const receiver = jest.fn();

    after(receiver);

    properties.fontSize = updated.fontSize;
    emitter.send(properties);
    expect(receiver).toHaveBeenCalledWith(updated);
    expect(receiver).toHaveBeenCalledTimes(2);
  });
});
