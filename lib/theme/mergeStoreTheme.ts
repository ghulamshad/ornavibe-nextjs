import { createTheme, type Theme } from '@mui/material/styles';
import { alpha, lighten } from '@mui/material/styles';
import baseTheme from '@/theme';

export type SiteThemePayload = {
  primary?: string;
  secondary?: string;
  background_default?: string;
  paper?: string;
};

function isWhiteHex(hex: string): boolean {
  const h = hex.trim().toLowerCase();
  return h === '#fff' || h === '#ffffff';
}

/**
 * Extends the app base theme with optional storefront colors from site settings.
 * Empty / missing values keep defaults from `@/theme`.
 */
export function mergeStorefrontTheme(overrides: SiteThemePayload | undefined): Theme {
  const primaryMain = overrides?.primary?.trim() || baseTheme.palette.primary.main;
  const secondaryMain = overrides?.secondary?.trim() || primaryMain;
  const bgDefault =
    overrides?.background_default?.trim() || baseTheme.palette.background.default;
  const paper = overrides?.paper?.trim() || baseTheme.palette.background.paper;
  const sectionSoft = isWhiteHex(bgDefault) ? '#f9fafb' : lighten(bgDefault, 0.04);
  const sectionContrast = lighten(primaryMain, 0.85);

  return createTheme(baseTheme, {
    palette: {
      primary: { main: primaryMain },
      secondary: { main: secondaryMain },
      background: {
        default: bgDefault,
        paper,
        sectionSoft,
        sectionContrast,
      } as any,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          containedPrimary: {
            boxShadow: `0 18px 38px ${alpha(primaryMain, 0.45)}`,
          },
        },
      },
    },
  });
}
