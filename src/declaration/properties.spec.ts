import { AfterEvent, afterEventFrom, EventEmitter, EventInterest, trackValue, ValueTracker } from 'fun-events';
import { mergeStypProperties, stypPropertiesBySpec } from './properties.impl';
import { StypProperties } from './properties';
import { StypDeclaration } from './declaration';
import Mock = jest.Mock;

describe('stypPropertiesBySpec', () => {

  let decl: StypDeclaration;

  beforeEach(() => {
    decl = { name: 'style declaration' } as any;
  });

  it('sends empty properties by default', async () => {

    const after = afterEventFrom(stypPropertiesBySpec(decl));

    expect(await receiveProperties(after)).toEqual({});
  });
  it('sends provided properties', async () => {

    const initial = { fontSize: '12px' };
    const after = afterEventFrom(stypPropertiesBySpec(decl, initial));

    expect(await receiveProperties(after)).toEqual(initial);
  });
  it('sends tracked properties', async () => {

    const initial = { fontSize: '12px' };
    const tracker = trackValue(initial);
    const after = afterEventFrom(stypPropertiesBySpec(decl, tracker));

    expect(await receiveProperties(after)).toEqual(initial);

    const updated = { fontSize: '13px' };

    tracker.it = updated;
    expect(await receiveProperties(after)).toEqual(updated);
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

    expect(await receiveProperties(after)).toEqual(initial);
  });
  it('sends constructed tracked properties', async () => {

    const initial = { fontSize: '12px' };
    const tracker = trackValue(initial);
    const after = afterEventFrom(stypPropertiesBySpec(decl, () => tracker));

    expect(await receiveProperties(after)).toEqual(initial);

    const updated = { fontSize: '13px' };

    tracker.it = updated;
    expect(await receiveProperties(after)).toEqual(updated);
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

describe('mergeStypProperties', () => {

  let baseProperties: StypProperties;
  let base: ValueTracker<StypProperties>;
  let addendumProperties: StypProperties;
  let addendum: ValueTracker<StypProperties>;

  beforeEach(() => {
    baseProperties = { display: 'block', width: '100%' };
    addendumProperties = { display: 'none' };
    base = trackValue(baseProperties);
    addendum = trackValue(addendumProperties);
  });

  let merged: AfterEvent<[StypProperties]>;

  beforeEach(() => {
    merged = mergeStypProperties(base.read, addendum.read);
  });

  it('keeps initial properties', () => {
    expect(merged.kept).toEqual([{ ...baseProperties, ...addendumProperties }]);
  });
  it('merges initial properties', async () => {
    expect(await receiveProperties(merged)).toEqual({ ...baseProperties, ...addendumProperties });
  });

  describe('merging', () => {

    let mockReceiver: Mock<void, [StypProperties]>;
    let interest: EventInterest;

    beforeEach(() => {
      mockReceiver = jest.fn();
      interest = merged(mockReceiver);
      mockReceiver.mockClear();
    });

    it('is aborted when interest lost', () => {
      interest.off();
      addendum.it = { ...addendumProperties, display: 'none !important' };
      expect(mockReceiver).not.toHaveBeenCalled();
    });
    it('overrides property', () => {
      base.it = { ...baseProperties, display: 'inline-block' };
      expect(mockReceiver).not.toHaveBeenCalled();
    });
    it('does not override important property', () => {
      base.it = { ...baseProperties, display: 'inline-block !important' };
      expect(mockReceiver).toHaveBeenCalledWith(expect.objectContaining({ display: 'inline-block !important' }));
    });
    it('overrides important property', () => {
      base.it = { ...baseProperties, display: 'inline-block !important' };
      mockReceiver.mockClear();
      addendum.it = { ...addendumProperties, display: 'none !important' };
      expect(mockReceiver).toHaveBeenCalledWith(expect.objectContaining({ display: 'none !important' }));
    });
  });
});

async function receiveProperties(sender: AfterEvent<[StypProperties]>): Promise<StypProperties> {
  return new Promise(resolve => sender(resolve));
}
