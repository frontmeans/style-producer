import { immediateRenderScheduler, RenderScheduler } from '@frontmeans/render-scheduler';
import { EventEmitter, OnEvent } from '@proc7ts/fun-events';
import { StypPriority } from '../../value';
import { StypFormat, StypFormatConfig } from '../format';
import { StypWriter } from '../writer';

/**
 * Textual CSS production format.
 *
 * Represents each style sheet in textual form and reports it to registered receivers. Such receivers should be
 * registered before {@link produceStyle style production} started in order to receive all style sheets.
 *
 * @category Rendering
 */
export interface StypTextFormat extends StypFormat, StypTextFormatConfig {

  /**
   * Detailed configuration of CSS text pretty print, or `false` for compact output.
   */
  readonly pretty: StypTextFormatConfig.PrettyPrint | false;

  /**
   * An `OnEvent` sender of style sheet textual representation.
   *
   * Sends textual representation of each rendered style sheet on each update.
   */
  readonly onSheet: OnEvent<[StypSheetText]>;

}

/**
 * Configuration of {@link stypTextFormat textual CSS production format}.
 *
 * @category Rendering
 */
export interface StypTextFormatConfig extends StypFormatConfig {

  /**
   * DOM rendering operations scheduler.
   *
   * Creates a render schedule per rule.
   *
   * Uses `immediateRenderScheduler` by default.
   */
  readonly scheduler?: RenderScheduler | undefined;

  /**
   * How to pretty-print generated CSS text.
   *
   * - `false` to disable pretty print and generate compact output,
   * - `true` (default value) for default pretty print,
   * - {@link StypTextFormatConfig.PrettyPrint detailed configuration object}.
   */
  readonly pretty?: boolean | StypTextFormatConfig.PrettyPrint | undefined;

}

/**
 * @category Rendering
 */
export namespace StypTextFormatConfig {

  /**
   * Detailed configuration of CSS text pretty print.
   */
  export interface PrettyPrint {

    /**
     * Indentation string to use when formatting CSS text.
     *
     * Two spaces by default.
     */
    indent?: string | undefined;

  }

}

/**
 * Style sheet textual representation.
 *
 * This is sent when producing styles in {@link StypTextFormat.onSheet textual format}.
 *
 * @category Rendering
 */
export interface StypSheetText {

  /**
   * Unique style sheet identifier.
   *
   * Style sheet is reported with the same identifier on each update.
   */
  readonly id: string;

  /**
   * The textual representation of style sheet formatted accordingly to {@link StypTextFormatConfig options},
   * or `undefined` to inform that corresponding style sheet have been removed.
   */
  readonly css?: string | undefined;

}

/**
 * @internal
 */
interface StypTextFormatter {
  readonly pre: string;
  readonly nv: string;
  readonly eol: string;
  indent(): StypTextFormatter;
}

/**
 * @internal
 */
const defaultPrettyPrint: StypTextFormatConfig.PrettyPrint = {
  indent: '  ',
};

/**
 * @internal
 */
const compactStypTextFormatter: StypTextFormatter = {
  nv: '',
  eol: '',
  pre: '',
  indent() {
    return this;
  },
};

/**
 * @internal
 */
class StypTextFormatter$ implements StypTextFormatter {

  constructor(
      private readonly _config: StypTextFormatConfig.PrettyPrint,
      readonly pre = '',
  ) {
  }

  get nv(): string {
    return ' ';
  }

  get eol(): string {
    return '\n';
  }

  indent(): StypTextFormatter$ {
    return new StypTextFormatter$(this._config, this.pre + this._config.indent!);
  }

}

/**
 * @internal
 */
class StypStyleTextWriter implements StypWriter.Style {

  private readonly nf: StypTextFormatter;
  private body = '';

  constructor(
      private readonly f: StypTextFormatter,
      readonly selector: string,
  ) {
    this.nf = f.indent();
  }

  get isGroup(): false {
    return false;
  }

  set(name: string, value: string, priority: number): void {

    const p = priority >= StypPriority.Important ? ' !important' : '';
    const { pre, nv, eol } = this.nf;

    if (this.body) {
      this.body += `;${eol}`;
    }

    this.body += `${pre}${name}:${nv}${value}${p}`;
  }

  replace(css: string): void {
    this.body = css.trim();
    if (this.body.endsWith(';')) {
      this.body = this.body.substr(0, this.body.length - 1);
    }
  }

  toString(): string {

    const { pre, nv, eol } = this.f;

    if (this.body) {

      const afterBody = eol ? `;${eol}` : '';

      return `${pre}${this.selector}${nv}{${eol}${this.body}${afterBody}${pre}}`;
    }

    return '';
  }

}

/**
 * @internal
 */
abstract class AbstractStypGroupTextWriter implements StypWriter.Group {

  readonly _nested: any[] = [];

  protected constructor(readonly nf: StypTextFormatter) {
  }

  get isGroup(): true {
    return true;
  }

  addGroup(name: string, params: string, index?: number): StypWriter.Group {
    return this._add(new StypGroupTextWriter(this.nf, name, params), index);
  }

  addStyle(selector: string, index?: number): StypWriter.Style {
    return this._add(new StypStyleTextWriter(this.nf, selector), index);
  }

  toString(): string {

    let out = '';

    for (const nested of this._nested) {

      const text = String(nested);

      if (text) {
        if (out) {
          out += this.nf.eol;
        }
        out += text;
      }
    }

    return out;
  }

  protected _add<TNested>(nested: TNested, index = this._nested.length): TNested {
    this._nested.splice(index, 0, nested);

    return nested;
  }

}

/**
 * @internal
 */
class StypGroupTextWriter extends AbstractStypGroupTextWriter implements StypWriter.Group {

  constructor(readonly f: StypTextFormatter, readonly name: string, readonly params: string) {
    super(f.indent());
  }

  toString(): string {

    const body = super.toString();

    if (!body) {
      return '';
    }

    const { pre, nv, eol } = this.f;

    return `${pre}${this.name} ${this.params}${nv}{${eol}${body}${eol}${pre}}`;
  }

}

/**
 * @internal
 */
class StypSheetTextWriter extends AbstractStypGroupTextWriter implements StypWriter.Sheet {

  constructor(
      readonly id: string,
      readonly f: StypTextFormatter,
      readonly sender: EventEmitter<[StypSheetText]>,
  ) {
    super(f);
  }

  addGlobal(name: string, value: string, index?: number): void {
    this._add(`${this.f.pre}${name} ${value};`, index);
  }

  clear(): void {
    this._nested.length = 0;
  }

  remove(): void {
    this.clear();
    this.sender.send({ id: this.id });
  }

  done(): void {
    this.sender.send({
      id: this.id,
      css: this.toString(),
    });
  }

}

/**
 * Builds textual CSS production format.
 *
 * It is necessary to register {@link StypTextFormat.onSheet CSS text receiver(s)} prior to start {@link produceStyle
 * style production} in order to receive CSS text for style sheets.
 *
 * @category Rendering
 * @param config - Textual format config.
 *
 * @returns Textual CSS production format.
 */
export function stypTextFormat(config: StypTextFormatConfig = {}): StypTextFormat {

  const pretty: StypTextFormatConfig.PrettyPrint | false = config.pretty === true || config.pretty == null
      ? defaultPrettyPrint
      : (config.pretty || false);
  const { scheduler = immediateRenderScheduler } = config;
  const sender = new EventEmitter<[StypSheetText]>();
  const formatter: StypTextFormatter = pretty ? new StypTextFormatter$(pretty) : compactStypTextFormatter;
  let idSeq = 0;

  return {
    ...config,
    pretty,
    scheduler,
    onSheet: sender.on,
    addSheet() {
      return new StypSheetTextWriter(String(++idSeq), formatter, sender);
    },
  };
}
