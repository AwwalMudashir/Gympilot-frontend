export const lightColors = {
  background: '#F6F8F6', surface: '#FFFFFF', surfaceRaised: '#FFFFFF',
  primary: '#3FA36C', primaryPressed: '#2E7D50', primarySoft: '#E7F5EC',
  accent: '#C9F26B', text: '#121814', textOnPrimary: '#FFFFFF', muted: '#66706A',
  border: '#DDE5DF', danger: '#C53D3D', warning: '#9A6812', shadow: '#102117',
} as const;

export const darkColors = {
  background: '#0C110E', surface: '#151D18', surfaceRaised: '#1B2520',
  primary: '#62C78C', primaryPressed: '#43A76D', primarySoft: '#1C3A29',
  accent: '#C9F26B', text: '#F3F7F4', textOnPrimary: '#08110B', muted: '#A6B0AA',
  border: '#2B3730', danger: '#FF8B8B', warning: '#F3C76B', shadow: '#000000',
} as const;

export type AppColors = Record<keyof typeof lightColors, string>;
export const colors = lightColors;
