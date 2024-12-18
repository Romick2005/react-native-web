/**
 * Copyright (c) Nicolas Gallagher.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { preprocess } from '../preprocess';

describe('StyleSheet/preprocess', () => {
  describe('non-standard styles', () => {
    test('converts non-standard logical styles', () => {
      expect(
        preprocess({
          end: 1,
          marginEnd: 1,
          marginHorizontal: 1,
          marginStart: 1,
          marginVertical: 1,
          paddingEnd: 1,
          paddingHorizontal: 1,
          paddingStart: 1,
          paddingVertical: 1,
          start: 1
        })
      ).toEqual({
        insetInlineEnd: 1,
        marginTop: 1,
        marginBottom: 1,
        marginLeft: 1,
        marginRight: 1,
        paddingTop: 1,
        paddingBottom: 1,
        paddingLeft: 1,
        paddingRight: 1,
        insetInlineStart: 1
      });
    });

    test('respects standard logical styles', () => {
      expect(
        preprocess({
          end: 1,
          marginEnd: 1,
          marginHorizontal: 1,
          marginStart: 1,
          marginVertical: 1,
          paddingEnd: 1,
          paddingHorizontal: 1,
          paddingStart: 1,
          paddingVertical: 1,
          start: 1,
          // standard
          insetInlineEnd: 2,
          insetInlineStart: 2,
          marginTop: 2,
          marginBottom: 2,
          marginLeft: 2,
          marginRight: 2,
          paddingTop: 2,
          paddingBottom: 2,
          paddingLeft: 2,
          paddingRight: 2
        })
      ).toEqual({
        insetInlineEnd: 2,
        insetInlineStart: 2,
        marginTop: 2,
        marginBottom: 2,
        marginLeft: 2,
        marginRight: 2,
        paddingTop: 2,
        paddingBottom: 2,
        paddingLeft: 2,
        paddingRight: 2
      });
    });

    test('converts non-standard textAlignVertical', () => {
      expect(
        preprocess({
          textAlignVertical: 'center'
        })
      ).toEqual({
        verticalAlign: 'middle'
      });

      expect(
        preprocess({
          verticalAlign: 'top',
          textAlignVertical: 'center'
        })
      ).toEqual({
        verticalAlign: 'top'
      });
    });

    test('aspectRatio', () => {
      expect(preprocess({ aspectRatio: 9 / 16 })).toEqual({
        aspectRatio: '0.5625'
      });

      expect(preprocess({ aspectRatio: '0.5' })).toEqual({
        aspectRatio: '0.5'
      });

      expect(preprocess({ aspectRatio: undefined })).toEqual({});
    });

    test('fontVariant', () => {
      expect(
        preprocess({ fontVariant: 'common-ligatures small-caps' })
      ).toEqual({
        fontVariant: 'common-ligatures small-caps'
      });

      expect(
        preprocess({ fontVariant: ['common-ligatures', 'small-caps'] })
      ).toEqual({
        fontVariant: 'common-ligatures small-caps'
      });
    });

    describe('transform', () => {
      // passthrough if transform value is ever a string
      test('string', () => {
        const transform =
          'perspective(50px) scaleX(20) translateX(20px) rotate(20deg)';
        const style = { transform };
        const resolved = preprocess(style);

        expect(resolved).toEqual({ transform });
      });

      test('array', () => {
        const style = {
          transform: [
            { perspective: 50 },
            { scaleX: 20 },
            { translateX: 20 },
            { rotate: '20deg' },
            { matrix: [1, 2, 3, 4, 5, 6] },
            { matrix3d: [1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4] }
          ]
        };
        const resolved = preprocess(style);

        expect(resolved).toEqual({
          transform:
            'perspective(50px) scaleX(20) translateX(20px) rotate(20deg) matrix(1,2,3,4,5,6) matrix3d(1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4)'
        });
      });
    });
  });

  describe('preprocesses multiple shadow styles into a single declaration', () => {
    test('shadowColor only', () => {
      expect(preprocess({ shadowColor: 'red' })).toEqual({
        boxShadow: '0px 0px 0px rgba(255,0,0,1.00)'
      });
    });

    test('shadowColor and shadowOpacity only', () => {
      expect(preprocess({ shadowColor: 'red', shadowOpacity: 0.5 })).toEqual({
        boxShadow: '0px 0px 0px rgba(255,0,0,0.50)'
      });
    });

    test('shadowOffset only', () => {
      expect(preprocess({ shadowOffset: { width: 1, height: 2 } })).toEqual({
        boxShadow: '1px 2px 0px rgba(0,0,0,1.00)'
      });
    });

    test('shadowRadius only', () => {
      expect(preprocess({ shadowRadius: 5 })).toEqual({
        boxShadow: '0px 0px 5px rgba(0,0,0,1.00)'
      });
    });

    test('shadowOffset, shadowRadius, shadowColor', () => {
      expect(
        preprocess({
          shadowColor: 'rgba(50,60,70,0.5)',
          shadowOffset: { width: 1, height: 2 },
          shadowOpacity: 0.5,
          shadowRadius: 3
        })
      ).toEqual({
        boxShadow: '1px 2px 3px rgba(50,60,70,0.25)'
      });
    });
  });

  describe('preprocesses multiple textShadow styles into a single declaration', () => {
    test('textShadowColor only', () => {
      expect(preprocess({ textShadowColor: 'red' })).toEqual({});
    });

    test('textShadowOffset only', () => {
      expect(preprocess({ textShadowOffset: { width: 1, height: 2 } })).toEqual(
        {}
      );
    });

    test('textShadowRadius only', () => {
      expect(preprocess({ textShadowRadius: 5 })).toEqual({});
    });

    test('textShadowColor and textShadowOffset only', () => {
      expect(
        preprocess({
          textShadowColor: 'red',
          textShadowOffset: { width: 0, height: 0 }
        })
      ).toEqual({});
      expect(
        preprocess({
          textShadowColor: 'red',
          textShadowOffset: { width: -1, height: 0 }
        })
      ).toEqual({
        textShadow: '-1px 0px 0px rgba(255,0,0,1.00)'
      });
      expect(
        preprocess({
          textShadowColor: 'red',
          textShadowOffset: { width: 1, height: 2 }
        })
      ).toEqual({
        textShadow: '1px 2px 0px rgba(255,0,0,1.00)'
      });
    });

    test('textShadowColor and textShadowRadius only', () => {
      expect(
        preprocess({ textShadowColor: 'red', textShadowRadius: 0 })
      ).toEqual({});
      expect(
        preprocess({ textShadowColor: 'red', textShadowRadius: 5 })
      ).toEqual({
        textShadow: '0px 0px 5px rgba(255,0,0,1.00)'
      });
    });

    test('textShadowColor, textShadowOffset, textShadowRadius', () => {
      expect(
        preprocess({
          textShadowColor: 'rgba(50,60,70,0.50)',
          textShadowOffset: { width: 5, height: 10 },
          textShadowRadius: 15
        })
      ).toEqual({
        textShadow: '5px 10px 15px rgba(50,60,70,0.50)'
      });
    });
  });

  describe('preprocesses multiple padding styles with different order', () => {
    test('padding first', () => {
      expect(
        preprocess({
          padding: 0,
          paddingTop: 1,
          paddingBottom: 2,
          paddingRight: 3,
          paddingLeft: 4
        })
      ).toEqual({
        paddingTop: 1,
        paddingBottom: 2,
        paddingRight: 3,
        paddingLeft: 4
      });
    });

    test('padding last', () => {
      expect(
        preprocess({
          paddingTop: 0,
          paddingBottom: 1,
          paddingRight: 2,
          paddingLeft: 3,
          padding: 4
        })
      ).toEqual({
        paddingTop: 4,
        paddingBottom: 4,
        paddingRight: 4,
        paddingLeft: 4
      });
    });

    test('paddingVertical/paddingHorizontal (paddingBlock/paddingInline) first', () => {
      expect(
        preprocess({
          paddingVertical: 0,
          paddingTop: 1,
          paddingBottom: 2,
          paddingHorizontal: 3,
          paddingRight: 4,
          paddingLeft: 5
        })
      ).toEqual({
        paddingTop: 1,
        paddingBottom: 2,
        paddingRight: 4,
        paddingLeft: 5
      });
    });

    test('paddingVertical/paddingHorizontal (paddingBlock/paddingInline) last', () => {
      expect(
        preprocess({
          paddingTop: 0,
          paddingBottom: 1,
          paddingVertical: 2,
          paddingRight: 3,
          paddingLeft: 4,
          paddingHorizontal: 5
        })
      ).toEqual({
        paddingTop: 2,
        paddingBottom: 2,
        paddingRight: 5,
        paddingLeft: 5
      });
    });
  });

  describe('preprocesses multiple margin styles with different order', () => {
    test('margin first', () => {
      expect(
        preprocess({
          margin: 0,
          marginTop: 1,
          marginBottom: 2,
          marginRight: 3,
          marginLeft: 4
        })
      ).toEqual({
        marginTop: 1,
        marginBottom: 2,
        marginRight: 3,
        marginLeft: 4
      });
    });

    test('margin last', () => {
      expect(
        preprocess({
          marginTop: 0,
          marginBottom: 1,
          marginRight: 2,
          marginLeft: 3,
          margin: 4
        })
      ).toEqual({
        marginTop: 4,
        marginBottom: 4,
        marginRight: 4,
        marginLeft: 4
      });
    });

    test('marginVertical/marginHorizontal (marginBlock/marginInline) first', () => {
      expect(
        preprocess({
          marginVertical: 0,
          marginTop: 1,
          marginBottom: 2,
          marginHorizontal: 3,
          marginRight: 4,
          marginLeft: 5
        })
      ).toEqual({
        marginTop: 1,
        marginBottom: 2,
        marginRight: 4,
        marginLeft: 5
      });
    });

    test('marginVertical/marginHorizontal (marginBlock/marginInline) last', () => {
      expect(
        preprocess({
          marginTop: 0,
          marginBottom: 1,
          marginVertical: 2,
          marginRight: 3,
          marginLeft: 4,
          marginHorizontal: 5
        })
      ).toEqual({
        marginTop: 2,
        marginBottom: 2,
        marginRight: 5,
        marginLeft: 5
      });
    });
  });
});
