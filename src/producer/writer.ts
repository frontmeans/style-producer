/**
 * @packageDocumentation
 * @module @frontmeans/style-producer
 */

/**
 * CSS writer.
 *
 * Either style sheet writer, grouping at-rule writer, or CSS style declarations writer.
 *
 * @category Rendering
 */
export type StypWriter =
    | StypWriter.Sheet
    | StypWriter.Group
    | StypWriter.Style;

export namespace StypWriter {

  /**
   * CSS style sheet writer to add CSS rules to.
   *
   * It is an object created by {@link StypFormat.addSheet} style production format method.
   */
  export interface Sheet {

    readonly isGroup: true;

    /**
     * Inserts a new global CSS at-rule into target style sheet, with some restrictions.
     *
     * @param name - Rule name of newly inserted at-rule. E.g. `@namespace` or `@import`.
     * @param value - Verbatim value of newly inserted at-rule.
     * @param index - A positive integer less than or equal to the number of added rules, representing the newly inserted
     * rule's position in target style sheet. The default is the number of added rules.
     */
    addGlobal(name: string, value: string, index?: number): void;

    /**
     * Inserts a new grouping CSS at-rule into target style sheet, with some restrictions.
     *
     * @param name - Rule name of newly inserted at-rule. E.g. `@media`, `@keyframes`, or `@condition`.
     * @param params - Verbatim parameters of newly inserted rule. E.g. media query.
     * @param index - A positive integer less than or equal to the number of added rules, representing the newly inserted
     * rule's position in target style sheet. The default is the number of added rules.
     *
     * @returns  Inserted CSS style declarations writer.
     */
    addGroup(name: string, params: string, index?: number): Group;

    /**
     * Inserts a new empty CSS style declarations rule into target style sheet, with some restrictions.
     *
     * @param selector - CSS selector of the newly inserted rule.
     * @param index - A positive integer less than or equal to the number of added rules, representing the newly inserted
     * rule's position in target style sheet. The default is the number of added rules.
     *
     * @returns  Inserted CSS style declarations writer.
     */
    addStyle(selector: string, index?: number): Style;

    /**
     * Clears target style sheet by removing all nested rules.
     */
    clear(): void;

    /**
     * Removes this stylesheet from the document.
     */
    remove(): void;

    /**
     * Called by style producer after updates done to the style sheet.
     */
    done(): void;

  }

  /**
   * Grouping CSS at-rule writer of nested CSS rules.
   *
   * Supports at-rules like `@media`, `@keyframes`, or `@condition`.
   */
  export interface Group {

    readonly isGroup: true;

    /**
     * Inserts a nested empty grouping CSS at-rule into target one, with some restrictions.
     *
     * @param name - Rule name of newly inserted at-rule. E.g. `@media`, `@keyframes`, or `@condition`.
     * @param params - Verbatim parameters of newly inserted rule. E.g. media query.
     * @param index - A positive integer less than or equal to the number of added rules, representing the newly inserted
     * rule's position in target grouping rule. The default is the number of added rules.
     *
     * @returns  Inserted CSS style declarations writer.
     */
    addGroup(name: string, params?: string, index?: number): Group;

    /**
     * Inserts a nested empty CSS style declarations rule into target grouping one, with some restrictions.
     *
     * @param selector - CSS selector of the newly inserted rule.
     * @param index - A positive integer less than or equal to the number of added rules, representing the newly inserted
     * rule's position in target grouping rule. The default is the number of added rules.
     *
     * @returns  Inserted CSS style declarations writer.
     */
    addStyle(selector: string, index?: number): Style;

  }

  /**
   * CSS style declarations writer.
   */
  export interface Style {

    readonly isGroup: false;

    /**
     * Sets CSS property value.
     *
     * @param name - Property name (hyphen case) to be modified.
     * @param value - New property value.
     * @param priority - New property value priority. The value [[StypPriority.Important]] and above means the property
     * is `!important`.
     */
    set(name: string, value: string, priority: number): void;

    /**
     * Replaces CSS style declarations with the given CSS text.
     *
     * @param css - CSS text containing CSS style declarations.
     */
    replace(css: string): void;

  }

}
