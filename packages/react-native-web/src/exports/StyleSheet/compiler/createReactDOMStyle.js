/**
 * Copyright (c) Nicolas Gallagher.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import normalizeValueWithProperty from './normalizeValueWithProperty';
import STYLE_SHORT_FORM_EXPANSIONS from '../constants/shortFormExpansions';
import canUseDOM from '../../../modules/canUseDom';

type Style = { [key: string]: any };

/**
 * The browser implements the CSS cascade, where the order of properties is a
 * factor in determining which styles to paint. React Native is different. It
 * gives giving precedence to the more specific style property. For example,
 * the value of `paddingTop` takes precedence over that of `padding`.
 *
 * This module creates mutally exclusive style declarations by expanding all of
 * React Native's supported shortform properties (e.g. `padding`) to their
 * longfrom equivalents.
 */

const emptyObject = {};

const supportsCSS3TextDecoration =
  !canUseDOM ||
  (window.CSS != null &&
    window.CSS.supports != null &&
    (window.CSS.supports('text-decoration-line', 'none') ||
      window.CSS.supports('-webkit-text-decoration-line', 'none')));

const MONOSPACE_FONT_STACK = 'monospace,monospace';

const SYSTEM_FONT_STACK =
  '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif';

/**
 * Reducer
 */

const createReactDOMStyle = (style: Style, isInline?: boolean): Style => {
  if (!style) {
    return emptyObject;
  }

  const resolvedStyle = {};

  for (const prop in style) {
    const value = style[prop];

    if (
      // Ignore everything with a null value
      value == null
    ) {
      continue;
    }

    if (prop === 'backgroundClip') {
      // TODO: remove once this issue is fixed
      // https://github.com/rofrischmann/inline-style-prefixer/issues/159
      if (value === 'text') {
        resolvedStyle.backgroundClip = value;
        resolvedStyle.WebkitBackgroundClip = value;
      }
    } else if (prop === 'flex') {
      if (value === -1) {
        resolvedStyle.flexGrow = 0;
        resolvedStyle.flexShrink = 1;
        resolvedStyle.flexBasis = 'auto';
      } else {
        resolvedStyle.flex = value;
      }
    } else if (prop === 'font') {
      resolvedStyle[prop] = value.replace('System', SYSTEM_FONT_STACK);
    } else if (prop === 'fontFamily') {
      if (value.indexOf('System') > -1) {
        const stack = value.split(/,\s*/);
        stack[stack.indexOf('System')] = SYSTEM_FONT_STACK;
        resolvedStyle[prop] = stack.join(',');
      } else if (value === 'monospace') {
        resolvedStyle[prop] = MONOSPACE_FONT_STACK;
      } else {
        resolvedStyle[prop] = value;
      }
    } else if (prop === 'textDecorationLine') {
      // use 'text-decoration' for browsers that only support CSS2
      // text-decoration (e.g., IE, Edge)
      if (!supportsCSS3TextDecoration) {
        resolvedStyle.textDecoration = value;
      } else {
        resolvedStyle.textDecorationLine = value;
      }
    } else if (prop === 'writingDirection') {
      resolvedStyle.direction = value;
    } else {
      const value = normalizeValueWithProperty(style[prop], prop);

      if (isInline && prop === 'inset') {
        if (style.insetInline == null) {
          resolvedStyle.left = value;
          resolvedStyle.right = value;
        }
        if (style.insetBlock == null) {
          resolvedStyle.top = value;
          resolvedStyle.bottom = value;
        }
      } else if (isInline && prop === 'margin') {
        if (style.marginInline == null) {
          resolvedStyle.marginLeft = value;
          resolvedStyle.marginRight = value;
        }
        if (style.marginBlock == null) {
          resolvedStyle.marginTop = value;
          resolvedStyle.marginBottom = value;
        }
      } else if (isInline && prop === 'padding') {
        if (style.paddingInline == null) {
          resolvedStyle.paddingLeft = value;
          resolvedStyle.paddingRight = value;
        }
        if (style.paddingBlock == null) {
          resolvedStyle.paddingTop = value;
          resolvedStyle.paddingBottom = value;
        }
      } else {
        const longFormProperties = STYLE_SHORT_FORM_EXPANSIONS[prop];

        if (Array.isArray(longFormProperties)) {
          for (let i = 0, len = longFormProperties.length; i < len; i++) {
            resolvedStyle[longFormProperties[i]] = value;
          }
        } else {
          resolvedStyle[prop] = value;
        }
      }
    }
  }

  return resolvedStyle;
};

export default createReactDOMStyle;
