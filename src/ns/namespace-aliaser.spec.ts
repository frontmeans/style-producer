import { NamespaceAliaser, newNamespaceAliaser } from './namespace-aliaser';
import { NamespaceDef } from './namespace';

describe('NamespaceAliaser', () => {

  let nsAliaser: NamespaceAliaser;

  beforeEach(() => {
    nsAliaser = newNamespaceAliaser();
  });

  it('uses preferred alias', () => {
    expect(nsAliaser(new NamespaceDef('test'))).toBe('test');
  });
  it('uses second preferred alias when the first one occupied', () => {
    nsAliaser(new NamespaceDef('test'));
    expect(nsAliaser(new NamespaceDef('test', 'other'))).toBe('other');
  });
  it('uses registered alias', () => {

    const ns = new NamespaceDef('test');

    nsAliaser(ns);
    expect(nsAliaser(ns)).toBe('test');
  });
  it('generates unique alias if preferred one is absent', () => {

    const ns = new NamespaceDef('test');
    const alias = nsAliaser(ns);

    expect(nsAliaser(ns)).toBe(alias);
  });
  it('generates unique alias if preferred one is occupied', () => {

    const ns = new NamespaceDef('test');
    const alias = nsAliaser(ns);

    expect(nsAliaser(new NamespaceDef('test'))).toBe(alias + 2);
    expect(nsAliaser(new NamespaceDef('test'))).toBe(alias + 3);
  });
});
