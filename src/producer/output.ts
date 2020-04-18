/**
 * @packageDocumentation
 * @module @proc7ts/style-producer
 */
export namespace StypOutput {

  /**
   * CSS stylesheet reference.
   *
   * It is an object created by [[StypOptions.addStyleSheet]] option.
   *
   * @category Rendering
   */
  export interface Sheet {

    /**
     * CSS stylesheet reference.
     */
    readonly styleSheet: CSSStyleSheet;

    /**
     * Removes stylesheet from the document.
     */
    remove(): void;

  }

}
