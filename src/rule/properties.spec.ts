import { AfterEvent, afterSupplied, EventEmitter, EventSupply, trackValue, ValueTracker } from '@proc7ts/fun-events';
import { noop, valuesProvider } from '@proc7ts/primitives';
import { readProperties } from '../spec';
import { StypLengthPt } from '../value';
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

    const spec = stypPropertiesBySpec(rule);

    expect(await readProperties(spec)).toEqual({});
  });
  it('sends provided CSS text', async () => {

    const css = 'font-size: 12px';
    const spec = stypPropertiesBySpec(rule, css);

    expect(await readProperties(spec)).toEqual({ $$css: css });
  });
  it('sends provided properties', async () => {

    const initial = { fontSize: '12px' };
    const spec = stypPropertiesBySpec(rule, initial);

    expect(await readProperties(spec)).toEqual(initial);
  });
  it('sends emitted properties', async () => {

    const emitter = new EventEmitter<[StypProperties]>();
    const spec = trackSpec(stypPropertiesBySpec(rule, emitter));

    expect(await readProperties(spec)).toEqual({});

    const updated = { fontSize: '13px' };

    emitter.send(updated);
    expect(await readProperties(spec)).toEqual(updated);
  });
  it('sends tracked properties', async () => {

    const initial = { fontSize: '12px' };
    const tracker = trackValue(initial);
    const spec = trackSpec(stypPropertiesBySpec(rule, tracker));

    expect(await readProperties(spec)).toEqual(initial);

    const updated = { fontSize: '13px' };

    tracker.it = updated;
    expect(await readProperties(spec)).toEqual(updated);
  });
  it('prevents tracked properties duplicates', () => {

    const initial = { fontSize: '12px' };
    const tracker = trackValue(initial);
    const spec = trackSpec(stypPropertiesBySpec(rule, tracker));
    const receiver = jest.fn();

    spec.to(receiver);
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
    const spec = trackSpec(stypPropertiesBySpec(rule, tracker));
    const receiver = jest.fn();

    spec.to(receiver);
    expect(receiver).toHaveBeenCalledWith(initial);

    const updated = { borderWidth: '2px', border: '1px solid white' };

    tracker.it = updated;
    expect(receiver).toHaveBeenCalledWith(updated);
    expect(receiver).toHaveBeenCalledTimes(2);
  });
  it('handles raw properties', () => {

    const initial = { fontSize: '12px' };
    const tracker = trackValue<StypProperties | string>(initial);
    const spec = trackSpec(stypPropertiesBySpec(rule, tracker));
    const receiver = jest.fn();

    spec.to(receiver);
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
    const spec = stypPropertiesBySpec(rule, () => initial);

    expect(await readProperties(spec)).toEqual(initial);
  });
  it('sends constructed CSS text', async () => {

    const css = 'font-size: 12px';
    const spec = stypPropertiesBySpec(rule, () => css);

    expect(await readProperties(spec)).toEqual({ $$css: css });
  });
  it('sends constructed emitted properties', async () => {

    const emitter = new EventEmitter<[StypProperties]>();
    const spec = trackSpec(stypPropertiesBySpec(rule, () => emitter));

    expect(await readProperties(spec)).toEqual({});

    const updated = { fontSize: '13px' };

    emitter.send(updated);
    expect(await readProperties(spec)).toEqual(updated);
  });
  it('sends constructed tracked properties', async () => {

    const initial = { fontSize: '12px' };
    const tracker = trackValue(initial);
    const spec = trackSpec(stypPropertiesBySpec(rule, () => tracker));

    expect(await readProperties(spec)).toEqual(initial);

    const updated = { fontSize: '13px' };

    tracker.it = updated;
    expect(await readProperties(spec)).toEqual(updated);
  });
  it('prevents constructed tracked properties duplicates', () => {

    const initial = { fontSize: '12px' };
    const updated = { fontSize: '13px' };
    const properties = { ...initial };
    const emitter = new EventEmitter<[StypProperties]>();
    const tracker = afterSupplied(emitter, valuesProvider(properties));
    const spec = trackSpec(stypPropertiesBySpec(rule, () => tracker));
    const receiver = jest.fn();

    spec.to(receiver);

    properties.fontSize = updated.fontSize;
    emitter.send(properties);
    expect(receiver).toHaveBeenCalledWith(updated);
    expect(receiver).toHaveBeenCalledTimes(2);
  });
});

function trackSpec(spec: AfterEvent<[StypProperties]>): AfterEvent<[StypProperties]> {
  spec.to(noop); // Need this to keep updating properties
  return spec;
}

describe('mergeStypProperties', () => {

  let baseProperties: StypProperties;
  let base: ValueTracker<StypProperties>;
  let addendumProperties: StypProperties;
  let addendum: ValueTracker<StypProperties>;

  beforeEach(() => {
    baseProperties = {
      display: 'block',
      width: '100%',
    };
    addendumProperties = {
      display: 'none',
      fontSize: StypLengthPt.of(12, 'px'),
    };
    base = trackValue(baseProperties);
    addendum = trackValue(addendumProperties);
  });

  let merged: AfterEvent<[StypProperties]>;

  beforeEach(() => {
    merged = mergeStypProperties(base.read(), addendum.read());
  });

  it('keeps initial properties', () => {

    const receiver = jest.fn();

    merged.once(receiver);

    expect(receiver).toHaveBeenCalledWith({ ...baseProperties, ...addendumProperties });
  });
  it('merges initial properties', async () => {
    expect(await readProperties(merged)).toEqual({ ...baseProperties, ...addendumProperties });
  });

  describe('merging', () => {

    let mockReceiver: Mock<void, [StypProperties]>;
    let supply: EventSupply;

    beforeEach(() => {
      mockReceiver = jest.fn();
      supply = merged.to(mockReceiver);
      mockReceiver.mockClear();
    });

    it('is aborted when supply is cut off', () => {
      supply.off();
      addendum.it = {
        ...addendumProperties,
        display: 'none !important',
      };
      expect(mockReceiver).not.toHaveBeenCalled();
    });
    it('prefers property added later', () => {
      base.it = {
        ...baseProperties,
        display: 'inline-block',
      };
      expect(mockReceiver).not.toHaveBeenCalled();
    });
    it('prefers property with structured value added later', () => {
      base.it = {
        ...baseProperties,
        fontSize: StypLengthPt.of(13, 'px'),
      };
      expect(mockReceiver).not.toHaveBeenCalled();
    });
    it('prefers important property over usual one added later', () => {
      base.it = {
        ...baseProperties,
        display: 'inline-block !important',
      };
      expect(mockReceiver).toHaveBeenCalledWith(expect.objectContaining({
        display: 'inline-block !important',
      }));
    });
    it('prefers important property with structured structured value over usual one added later', () => {
      base.it = {
        ...baseProperties,
        fontSize: StypLengthPt.of(13, 'px').important(),
      };
      expect(mockReceiver).toHaveBeenCalledWith(expect.objectContaining({
        fontSize: StypLengthPt.of(13, 'px').important(),
      }));
    });
    it('prefers important property added later', () => {
      base.it = {
        ...baseProperties,
        display: 'inline-block !important',
      };
      mockReceiver.mockClear();
      addendum.it = {
        ...addendumProperties,
        display: 'none !important',
      };
      expect(mockReceiver).toHaveBeenCalledWith(expect.objectContaining({
        display: 'none !important',
      }));
    });
  });
});
