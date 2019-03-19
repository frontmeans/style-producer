import { stypRoot } from './root';
import { afterEventFrom, trackValue } from 'fun-events';
import { StypDeclaration } from './declaration';
import { stypPropertiesBySpec } from './properties.impl';

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
    const tracker = trackValue(initial);
    const after = afterEventFrom(stypPropertiesBySpec(decl, () => tracker));
    const receiver = jest.fn();

    after(receiver);

    const updated = { fontSize: '13px' };

    tracker.it = { ...initial };
    tracker.it = updated;
    expect(receiver).toHaveBeenCalledWith(updated);
    expect(receiver).toHaveBeenCalledTimes(2);
  });
});
