import { Platform } from 'react-native';

export const Typography = {
  fonts: {
    regular: Platform.select({ ios: 'Helvetica Neue', android: 'sans-serif', default: 'Helvetica Neue' }),
    medium: Platform.select({ ios: 'Helvetica Neue', android: 'sans-serif-medium', default: 'Helvetica Neue' }),
    bold: Platform.select({ ios: 'Helvetica Neue', android: 'sans-serif-bold', default: 'Helvetica Neue' }),
    rounded: Platform.select({ ios: 'Helvetica Neue', android: 'sans-serif', default: 'Helvetica Neue' }),
  },
  sizes: {
    hero: 48,
    title1: 32,
    title2: 18,
    body: 15,
    caption: 13,
    small: 10,
  },
  lineHeights: {
    hero: 56,
    title1: 40,
    title2: 32,
    body: 28,
    caption: 20,
  }
};
