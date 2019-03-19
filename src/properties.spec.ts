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
});
