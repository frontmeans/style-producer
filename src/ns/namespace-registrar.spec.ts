import { NamespaceRegistrar, newNamespaceRegistrar } from './namespace-registrar';
import { NamespaceDef } from './namespace';

describe('NamespaceRegistrar', () => {

  let nsRegistrar: NamespaceRegistrar;

  beforeEach(() => {
    nsRegistrar = newNamespaceRegistrar();
  });

  it('uses preferred alias', () => {
    expect(nsRegistrar(new NamespaceDef('test'))).toBe('test');
  });
  it('uses second preferred alias when the first one occupied', () => {
    nsRegistrar(new NamespaceDef('test'));
    expect(nsRegistrar(new NamespaceDef('test', 'other'))).toBe('other');
  });
  it('uses registered alias', () => {

    const ns = new NamespaceDef('test');

    nsRegistrar(ns);
    expect(nsRegistrar(ns)).toBe('test');
  });
  it('generates unique alias if preferred one is absent', () => {

    const ns = new NamespaceDef('test');
    const alias = nsRegistrar(ns);

    expect(nsRegistrar(ns)).toBe(alias);
  });
  it('generates unique alias if preferred one is occupied', () => {

    const ns = new NamespaceDef('test');
    const alias = nsRegistrar(ns);

    expect(nsRegistrar(new NamespaceDef('test'))).toBe(alias + 2);
    expect(nsRegistrar(new NamespaceDef('test'))).toBe(alias + 3);
  });
});
