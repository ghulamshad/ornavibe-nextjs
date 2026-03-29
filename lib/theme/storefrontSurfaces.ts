import type { Theme } from '@mui/material/styles';
import { alpha, lighten, darken } from '@mui/material/styles';

/** Section bands (aligned with `mergeStoreTheme` `sectionSoft`). */
export function surfaceSoft(theme: Theme): string {
  const b = theme.palette.background as { sectionSoft?: string };
  return b.sectionSoft ?? theme.palette.grey[100];
}

/** Neutral placeholder / skeleton fills */
export function neutralSlate(theme: Theme, coeff = 0.08): string {
  return alpha(theme.palette.text.primary, coeff);
}

export function paperTranslucent(theme: Theme, a: number): string {
  return alpha(theme.palette.background.paper, a);
}

export function scrim(theme: Theme, a: number): string {
  return alpha(theme.palette.common.black, a);
}

export function mediaScrimLight(theme: Theme): string {
  return scrim(theme, 0.15);
}

export function elevatedCardShadow(theme: Theme): string {
  return `0 24px 70px ${alpha(theme.palette.text.primary, 0.14)}`;
}

export function softDropShadow(theme: Theme): string {
  return `0 18px 40px ${alpha(theme.palette.common.black, 0.15)}`;
}

/** Hero / slider fallbacks when no image is set */
export function softHeroGradient(theme: Theme): string {
  const p = theme.palette.primary.main;
  const cool = lighten(theme.palette.info.main, 0.78);
  const cool2 = lighten(theme.palette.info.main, 0.64);
  return `linear-gradient(135deg, ${lighten(p, 0.32)} 0%, ${cool} 50%, ${cool2} 100%)`;
}

export function heroRadialBackground(theme: Theme): string {
  const p = theme.palette.primary.main;
  const bg = theme.palette.background.default;
  const cool = lighten(theme.palette.info.main, 0.8);
  return `radial-gradient(circle at top left, ${lighten(p, 0.34)} 0, ${bg} 45%, ${cool} 100%)`;
}

export function heroDecorativeSpots(theme: Theme): string {
  const p = theme.palette.primary.main;
  const i = theme.palette.info.main;
  return `radial-gradient(circle at 18% 40%, ${alpha(p, 0.12)} 0, transparent 55%), radial-gradient(circle at 82% 75%, ${alpha(i, 0.12)} 0, transparent 55%)`;
}

/** Category carousel / ribbon fallback */
export function categoryRibbonGradient(theme: Theme): string {
  const p = theme.palette.primary.main;
  const info = theme.palette.info.main;
  const sec = theme.palette.secondary.main;
  return `linear-gradient(135deg, ${lighten(p, 0.32)}, ${lighten(info, 0.72)}, ${lighten(sec, 0.58)})`;
}

export function ctaBandGradient(theme: Theme): string {
  const p = theme.palette.primary.main;
  return `linear-gradient(135deg, ${lighten(p, 0.22)} 0%, ${p} 55%, ${lighten(p, 0.08)} 100%)`;
}

export function promoStripeGradient(theme: Theme): string {
  const p = theme.palette.primary.main;
  return `linear-gradient(120deg, ${lighten(p, 0.2)}, ${darken(p, 0.08)})`;
}

export function softPrimaryTint(theme: Theme): string {
  return alpha(theme.palette.primary.main, 0.14);
}

export function cardSpotlightGradient(theme: Theme): string {
  const p = theme.palette.primary.main;
  return `linear-gradient(135deg, ${lighten(p, 0.18)}, ${p})`;
}

/** Dark page hero strip (about, blog): ties to theme text/paper, not fixed grey.900 */
export function pageHeroBg(theme: Theme): string {
  return alpha(theme.palette.text.primary, 0.92);
}

export function onHeroPaper(theme: Theme, opacity = 1): string {
  return alpha(theme.palette.background.paper, opacity);
}
