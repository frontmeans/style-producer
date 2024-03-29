# Style Producer

[![NPM][npm-image]][npm-url]
[![Build Status][build-status-img]][build-status-link]
[![Code Quality][quality-img]][quality-link]
[![Coverage][coverage-img]][coverage-link]
[![GitHub Project][github-image]][github-url]
[![API Documentation][api-docs-image]][api-docs-url]

Produces and dynamically updates stylesheets right in the browser.

Usage example:

```typescript
import { produceStyle, stypObjectFormat, stypRoot } from '@frontmeans/style-producer';

const root = stypRoot(); // Create root CSS rule
const h1 = root.rules.add(
  { e: 'h1' }, // Define CSS rule for `h1` element
  {
    fontSize: '24px',
  },
);

// ...add more CSS rules

const supply = produceStyle(root.rules, stypObjectFormat()); // Produce stylesheets

// Update CSS rule. Stylesheet will be updated automatically
h1.add({
  fontWeight: 'bold',
  fontSize: '22px',
});

supply.off(); // Remove produced stylesheets
```

[npm-image]: https://img.shields.io/npm/v/@frontmeans/style-producer.svg?logo=npm
[npm-url]: https://www.npmjs.com/package/@frontmeans/style-producer
[build-status-img]: https://github.com/frontmeans/style-producer/workflows/Build/badge.svg
[build-status-link]: https://github.com/frontmeans/style-producer/actions?query=workflow%3ABuild
[quality-img]: https://app.codacy.com/project/badge/Grade/34e46f8191ec486bb9d45dd64d539c86
[quality-link]: https://www.codacy.com/gh/frontmeans/style-producer/dashboard?utm_source=github.com&utm_medium=referral&utm_content=frontmeans/style-producer&utm_campaign=Badge_Grade
[coverage-img]: https://app.codacy.com/project/badge/Coverage/34e46f8191ec486bb9d45dd64d539c86
[coverage-link]: https://www.codacy.com/gh/frontmeans/style-producer/dashboard?utm_source=github.com&utm_medium=referral&utm_content=frontmeans/style-producer&utm_campaign=Badge_Coverage
[github-image]: https://img.shields.io/static/v1?logo=github&label=GitHub&message=project&color=informational
[github-url]: https://github.com/frontmeans/style-producer
[api-docs-image]: https://img.shields.io/static/v1?logo=typescript&label=API&message=docs&color=informational
[api-docs-url]: https://frontmeans.github.io/style-producer/

## Structured CSS Selectors

Style Producer utilizes structured CSS selectors implemented by [Doqry].

[doqry]: https://www.npmjs.com/package/@frontmeans/doqry

## CSS Rules

CSS rules are represented by `StypRule` class and organized in hierarchy.

The top of the hierarchy is root CSS rule. It may be constructed by `stypRoot()` function.

Rules are added to the hierarchy using `StypRule.rules.add()` method like this:

```typescript
const nested = rule.rules.add(selector, properties);
```

where `selector` is structured CSS selector, and `properties` is CSS properties map.

CSS rule may be removed from hierarchy with `StypRule.remove()` method.

`StypRule.rules` property contains a dynamically updated CSS rule list including all rules in hierarchy starting from
current one. To obtain only rules directly nested within current one use a `StypRule.rules.nested` property.

It is possible to grab a subset of matching rules using a `StypRule.rules.grab()` method:

```typescript
rule.rules.grab({ e: 'button' }); // Grab all CSS rules for the `button` element.
```

### CSS Properties

CSS properties are represented by object with camel-cased property names and their corresponding string, scalar,
or structured values:

```typescript
const cssProperties = {
  position: 'fixed',
  display: 'block',
  width: '100%',
  height: '120px',
  borderBottom: '1px solid black',
};
```

CSS rule may be constructed with initial properties. Properties may be appended using `StypRule.add()` method,
replaced using `StypRule.set()` method, or removed all together using `StypRule.clear()` method.

CSS properties with names started with anything but ASCII letter are not rendered as CSS. Still, they can be referenced
and used internally.

CSS property string values ending with `!important` suffix are recognized as having `!important` priority. Note that the
order of properties is meaningful. But important property values are always take precedence over non-important ones.

CSS rule properties may be defined by `EventKeeper` instance that may update properties dynamically.

### Type-Safe CSS Properties

Apart from being scalars and strings, CSS property values may be structured. I.e represented by objects implementing
`StypValueStruct` interface.

There are several implementations of structured values available:

- Numeric values supporting arithmetic operations (`StypDimension`, `StypCalc`):
  - `StypAngle`/`StypAnglePt` - for [angle]/[angle-percentage] values,
  - `StypFrequency`/`StypFrequencyPt` - for [frequency]/[frequency-percentage] values,
  - `StypLength`/`StypLengthPt` - for [length]/[length-percentage] values,
  - `StypResolution` - for [resolution] values, and
  - `StypTime`/`StypTimePt` - for [time]/[time-percentage] values.
- Color values supporting [color] manipulations (`StypColor`):
  - `StypRGB` - for [RGB colors], and
  - `StypHSL` for [HSL colors].
- `StypURL` representing [url] values.

Any custom implementation can be added.

It is possible to declare CSS properties structure to work with them in type safe manner. For that declare properties
interface and use `StypMapper` to map arbitrary CSS properties to that interface, or `StypRuleRef` to access CSS rule
in type safe manner:

```typescript
import { RefStypRule, StypColor, StypLengthPt, StypRGB, stypRoot } from '@frontmeans/style-producer';
import { mapAfter } from '@proc7ts/fun-events';

// Type-safe CSS properties representing custom settings
interface MySettings {
  $color: StypColor;
  $bgColor: StypColor;
  $gap: StypLengthPt;
}

// Construct a mapping function for custom settings
const MySettings = RefStypRule.by<MySettings>(
  { $: '.my-settings' }, // Selector of CSS rule containing settings
  {
    // Mappings for settings
    $color: new StypRGB({ r: 0, g: 0, b: 0 }), // Text is black by default
    $bgColor: new StypRGB({ r: 255, g: 255, b: 255 }), // Background is white by default
    $gap: StypLengthPt.of(4, 'px'), // Gaps are 4 pixels by default
  },
);

// CSS rules root
const root = stypRoot();

// Settings CSS rule reference
const mySettingsRef = MySettings(root);

// Define `<body>` style
root.add(
  mySettingsRef.read.do(
    mapAfter(({ $color, $bgColor, $gap }) => ({
      color: $color, // Apply default text color
      backgroundColor: $bgColor, // Apply default background color
      padding: $gap, // Padding is based on default gap
    })),
  ),
);

// Define `<input>` element style based on default settings.
root.rules.add(
  { e: 'input' },
  mySettingsRef.read.do(
    mapAfter(({ $color, $bgColor, $gap }) => ({
      color: $color,
      backgroundColor: $bgColor.hsl.set(hsl => ({ l: hsl.l * 0.85 })), // Convert to HSL and darken input background
      padding: `${$gap} ${$gap.mul(1.5)}`, // Padding is based on default gap
      border: `1px solid ${$color}`,
    })),
  ),
);

// Make text dark grey
mySettingsRef.set({
  $color: new StypRGB({ r: 192, g: 192, b: 192 }), // Override default value
});
```

[angle]: https://developer.mozilla.org/en-US/docs/Web/CSS/angle
[angle-percentage]: https://developer.mozilla.org/en-US/docs/Web/CSS/angle-percentage
[frequency]: https://developer.mozilla.org/en-US/docs/Web/CSS/frequency
[frequency-percentage]: https://developer.mozilla.org/en-US/docs/Web/CSS/frequency-percentag
[length]: https://developer.mozilla.org/en-US/docs/Web/CSS/length
[length-percentage]: https://developer.mozilla.org/en-US/docs/Web/CSS/length-percentage
[resolution]: https://developer.mozilla.org/en-US/docs/Web/CSS/resolution
[time]: https://developer.mozilla.org/en-US/docs/Web/CSS/time
[time-percentage]: https://developer.mozilla.org/en-US/docs/Web/CSS/time-percentage
[color]: https://developer.mozilla.org/en-US/docs/Web/CSS/color_value
[rgb colors]: https://developer.mozilla.org/en-US/docs/Web/CSS/color_value#RGB_colors
[hsl colors]: https://developer.mozilla.org/en-US/docs/Web/CSS/color_value#HSL_colors
[url]: https://developer.mozilla.org/en-US/docs/Web/CSS/url

## Producing CSS

Stylesheets can be produced by `produceStyle()` function. It accepts a dynamically updated list of CSS rules
(e.g. `StypRules.rules`) and production format.

The `stypObjectFormat()` format creates a `<style>` element per CSS rule inside a document head. This element's
stylesheet is filled and updated with that rule contents. Once the rule is removed the corresponding `<style>` element
is removed too.

When CSS is no longer needed an `off()` method of the `EventSupply` instance returned from `produceStyle()` function
may be called. That would remove all `<style>` elements.

### CSS Renderers

Style production is performed by CSS renderers that may be specified as `renderer` production format option.

By default, all renderers are enabled. This may be not what is needed. In that case a `produceBasicStyle()` function
can be called instead. The latter enables CSS properties rendering only. The rest of the necessary renderers may be
specified with the `renderer` production format option. This may reduce the final bundle size a bit.

### Raw CSS Text

CSS rule properties may be specified as raw text. This is the same as specifying a special `$$css` property.

The `stypRenderText` renderer treats this text as plain CSS. This text is rendered before the rest of the properties,
so the latter take precedence.

### [@media] and other [at-rules]

There is no dedicated `@media` properties in structured CSS selector. However, a `stypRenderAtRules` renderer recognizes
selector qualifiers as [at-rules] and renders corresponding rules. So, CSS rule with selector like this:
`{ c: 'screen-only', $: '@media=screen' }` would be rendered as

```css
@media screen {
  .screen-only {
    /* CSS properties */
  }
}
```

`stypRenderAtRules` renderer treats all qualifiers starting with `@` as at-rule qualifiers. So the qualifier name may
be e.g. [@keyframes]. The value of qualifier (if present) is used as at-rule query.

It is also possible to specify at-rule query as CSS property. For that the property name should be the same as qualifier
one. E.g. if CSS rule selector is `{ c: 'screen-only', $: '@media:sr' }` and CSS rule properties contain
`{ '@media:sr': 'screen' }`, the rendered CSS would be the same as above. This technique makes it possible to
dynamically update the at-rule queries.

[at-rules]: https://developer.mozilla.org/en-US/docs/Web/CSS/At-rule
[@media]: https://developer.mozilla.org/en-US/docs/Web/CSS/@media
[@keyframes]: https://developer.mozilla.org/en-US/docs/Web/CSS/@keyframes

### [@import] and [@namespace] rules

These rules are rendered by `stypRenderGlobals` renderer. This renderer interprets properly named CSS properties and
renders corresponding CSS rules.

**`@import:url`** property value is treated as media query and appended after stylesheet URL. I.e.

```json
{
  "@import:path/to/included.css": "screen"
}
```

becomes

```css
@import url(path/to/included.css) screen;
```

**`@namespace`** property value is treated as default namespace URL. I.e.

```json
{
  "@namespace": "http://www.w3.org/1999/xhtml"
}
```

becomes

```css
@namespace url(http://www.w3.org/1999/xhtml);
```

**`@namespace:prefix`** property value is treated as namespace URL with the given prefix. I.e

```json
{
  "@namespace:svg": "http://www.w3.org/2000/svg"
}
```

becomes

```css
@namespace svg url(http://www.w3.org/2000/svg);
```

[@import]: https://developer.mozilla.org/en-US/docs/Web/CSS/@import
[@namespace]: https://developer.mozilla.org/en-US/docs/Web/CSS/@namespace

### Namespaces

It is possible to specify namespaces for CSS selector elements. I.e. not only XML element namespace, but also
the one for HTML element name, element identifier, or element class.

Then the unique namespace alias will be applied to original name or identifier. This can be used to avoid naming
conflicts.

Example:

```typescript
import { NamespaceDef } from '@frontmeans/namespace-aliaser';
import { stypRoot } from '@frontmeans/style-producer';

// Declare custom namespace
const customNs = new NamespaceDef(
  'https://wesib.github.io/elements', // Unique namespace URL
  'b', // Preferred namespace aliases, from most wanted to less wanted
  'wesib',
);

const root = stypRoot(); // Root CSS rule
// Declare styles for custom element
const rule = root.rules.add(
  { e: ['button', customNs] },
  {
    background: 'gray',
  },
);
```

The code above would add a unique prefix to the `button` element. E.g. by making it `b-button`.

The `i` (element identifier) and `c` (element class name(s)) properties accept namespaced values too.

The `ns` (XML namespace) property accepts namespace (`NamespaceDef`) value instead of plain string. The corresponding
[@namespace] rule would be rendered automatically by `stypRenderXmlNs` renderer.
