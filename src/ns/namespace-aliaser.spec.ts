import { NamespaceDef } from './namespace';
import { NamespaceAliaser, newNamespaceAliaser } from './namespace-aliaser';

describe('NamespaceAliaser', () => {

  let nsAliaser: NamespaceAliaser;

  beforeEach(() => {
    nsAliaser = newNamespaceAliaser();
  });

  it('uses preferred alias', () => {
    expect(nsAliaser(new NamespaceDef('test/url', 'test'))).toBe('test');
  });
  it('uses second preferred alias when the first one occupied', () => {
    nsAliaser(new NamespaceDef('test/url', 'test'));
    expect(nsAliaser(new NamespaceDef('other/url', 'test', 'other'))).toBe('other');
  });
  it('uses registered alias', () => {

    const ns = new NamespaceDef('test/url', 'test');

    nsAliaser(ns);
    expect(nsAliaser(ns)).toBe('test');
  });
  it('generates unique alias if preferred one is absent', () => {

    const ns = new NamespaceDef('test/url', 'test');
    const alias = nsAliaser(ns);

    expect(nsAliaser(ns)).toBe(alias);
  });
  it('generates unique alias if preferred one is occupied', () => {

    const ns = new NamespaceDef('test/url', 'test');
    const alias = nsAliaser(ns);

    expect(nsAliaser(new NamespaceDef('test2/url', 'test'))).toBe(alias + 2);
    expect(nsAliaser(new NamespaceDef('test3/url', 'test'))).toBe(alias + 3);
  });
  it('generates unique alias if all preferred ones occupied', () => {
    nsAliaser(new NamespaceDef('tst/url', 'tst'));

    const alias = nsAliaser(new NamespaceDef('test/url', 'test'));

    expect(nsAliaser(new NamespaceDef('test2/url', 'test', 'tst'))).toBe(alias + 2);
    expect(nsAliaser(new NamespaceDef('test3/url', 'test', 'tst'))).toBe(alias + 3);
  });
});
