/**
 * @module style-producer
 */
import cssesc from 'cssesc';
import { stypSplitPriority } from './priority';
import { StypValue, StypValueStruct } from './value';

/**
 * Structured [URL](https://developer.mozilla.org/en-US/docs/Web/CSS/url) CSS property value.
 *
 * @category CSS Value
 */
export class StypURL extends StypValueStruct<StypURL> {

  /**
   * Target URL.
   */
  readonly url: string;

  // noinspection JSMethodCanBeStatic
  /**
   * `url` value type.
   */
  get type(): 'url' {
    return 'url';
  }

  /**
   * Maps the given CSS property value to URL. Defaults to `undefined` if mapping is not possible.
   *
   * This method allows to use a [[StypURL]] class as [CSS property mapping][[StypMapper.Mapping]].
   *
   * Strings are treated as URLs (without `url()` functional syntax). `!important` suffix is respected.
   *
   * @param source  A raw property value that should be converted.
   *
   * @returns Mapped property value or `undefined`.
   */
  static by(source: StypValue): StypURL | undefined {
    switch (typeof source) {
      case 'string':

        const [url, priority] = stypSplitPriority(source);

        return new StypURL(url, { priority });
      case 'object':
        if (source.type === 'url') {
          return source;
        }
    }
    return;
  }

  /**
   * Constructs URL value.
   *
   * @param url  Target URL.
   * @param opts  Construction options.
   */
  constructor(url: string, opts?: StypValue.Opts) {
    super(opts);
    this.url = url;
  }

  by(source: StypValue): StypURL {
    return StypURL.by(source) || this;
  }

  prioritize(priority: number): StypURL {
    return priority === this.priority ? this : new StypURL(this.url, { priority });
  }

  is(other: StypValue): boolean {
    return typeof other === 'object'
        && other.type === 'url'
        && other.url === this.url
        && other.priority === this.priority;
  }

  toString(): string {
    return `url('${cssesc(this.url)}')`;
  }

}
