import { AfterEvent, afterEventFrom, EventEmitter, EventInterest, trackValue, ValueTracker } from 'fun-events';
import { readProperties } from '../spec';
import { StypProperties } from './properties';
import { mergeStypProperties, stypPropertiesBySpec } from './properties.impl';
import { StypRule } from './rule';
import Mock = jest.Mock;

describe('stypPropertiesBySpec', () => {

  let rule: StypRule;

  beforeEach(() => {
    rule = { name: 'style rule' } as any;
  });

  it('sends empty properties by default', async () => {

    const after = afterEventFrom(stypPropertiesBySpec(rule));

    expect(await readProperties(after)).toEqual({});
  });
  it('sends provided CSS text', async () => {

    const css = 'font-size: 12px';
    const after = afterEventFrom(stypPropertiesBySpec(rule, css));

    expect(await readProperties(after)).toEqual({ $$css: css });
  });
  it('sends provided properties', async () => {

    const initial = { fontSize: '12px' };
    const after = afterEventFrom(stypPropertiesBySpec(rule, initial));

    expect(await readProperties(after)).toEqual(initial);
  });
  it('sends emitted properties', async () => {

    const emitter = new EventEmitter<[StypProperties]>();
    const after = afterEventFrom(stypPropertiesBySpec(rule, emitter));

    expect(await readProperties(after)).toEqual({});

    const updated = { fontSize: '13px' };

    emitter.send(updated);
    expect(await readProperties(after)).toEqual(updated);
  });
  it('sends tracked properties', async () => {

    const initial = { fontSize: '12px' };
    const tracker = trackValue(initial);
    const after = afterEventFrom(stypPropertiesBySpec(rule, tracker));

    expect(await readProperties(after)).toEqual(initial);

    const updated = { fontSize: '13px' };

    tracker.it = updated;
    expect(await readProperties(after)).toEqual(updated);
  });
  it('prevents tracked properties duplicates', () => {

    const initial = { fontSize: '12px' };
    const tracker = trackValue(initial);
    const after = afterEventFrom(stypPropertiesBySpec(rule, tracker));
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
  it('sends similar tracked properties with different properties order', () => {

    const initial = { border: '1px solid white', borderWidth: '2px' };
    const tracker = trackValue(initial);
    const after = afterEventFrom(stypPropertiesBySpec(rule, tracker));
    const receiver = jest.fn();

    after(receiver);
    expect(receiver).toHaveBeenCalledWith(initial);

    const updated = { borderWidth: '2px', border: '1px solid white' };

    tracker.it = updated;
    expect(receiver).toHaveBeenCalledWith(updated);
    expect(receiver).toHaveBeenCalledTimes(2);
  });
  it('handles raw properties', async () => {

    const initial = { fontSize: '12px' };
    const tracker = trackValue<StypProperties | string>(initial);
    const after = afterEventFrom(stypPropertiesBySpec(rule, tracker));
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
    const after = afterEventFrom(stypPropertiesBySpec(rule, () => initial));

    expect(await readProperties(after)).toEqual(initial);
  });
  it('sends constructed CSS text', async () => {

    const css = 'font-size: 12px';
    const after = afterEventFrom(stypPropertiesBySpec(rule, () => css));

    expect(await readProperties(after)).toEqual({ $$css: css });
  });
  it('sends constructed emitted properties', async () => {

    const emitter = new EventEmitter<[StypProperties]>();
    const after = afterEventFrom(stypPropertiesBySpec(rule, () => emitter));

    expect(await readProperties(after)).toEqual({});

    const updated = { fontSize: '13px' };

    emitter.send(updated);
    expect(await readProperties(after)).toEqual(updated);
  });
  it('sends constructed tracked properties', async () => {

    const initial = { fontSize: '12px' };
    const tracker = trackValue(initial);
    const after = afterEventFrom(stypPropertiesBySpec(rule, () => tracker));

    expect(await readProperties(after)).toEqual(initial);

    const updated = { fontSize: '13px' };

    tracker.it = updated;
    expect(await readProperties(after)).toEqual(updated);
  });
  it('prevents constructed tracked properties duplicates', () => {

    const initial = { fontSize: '12px' };
    const updated = { fontSize: '13px' };
    const properties = { ...initial };
    const emitter = new EventEmitter<[StypProperties]>();
    const tracker = afterEventFrom(emitter, [properties]);
    const after = afterEventFrom(stypPropertiesBySpec(rule, () => tracker));
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
    expect(await readProperties(merged)).toEqual({ ...baseProperties, ...addendumProperties });
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
