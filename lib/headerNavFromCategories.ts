/**
 * Storefront header mega-menu: build NavItem[] from API categories (header_nav=1).
 */

export type LinkItem = { label: string; href: string };

export type MegaBlock =
  | { type: 'links'; heading?: string; items: LinkItem[]; span?: number }
  | { type: 'banner'; image: string; href: string; cta: string; span?: number };

export type NavItem = { label: string; href: string; megaWidth?: number; blocks?: MegaBlock[] };

export type HeaderNavCategoryChild = {
  id: string;
  name: string;
  slug: string;
  sort_order?: number;
  image_url?: string | null;
  meta?: {
    nav?: {
      block: number;
      type: string;
      heading?: string;
      span?: number;
      cta?: string;
    };
  } | null;
};

export type HeaderNavCategoryRoot = {
  id: string;
  name: string;
  slug: string;
  sort_order?: number;
  meta?: { mega_width?: number } | Record<string, unknown> | null;
  children?: HeaderNavCategoryChild[];
};

export function categoriesToNavItems(roots: HeaderNavCategoryRoot[]): NavItem[] {
  const sortedRoots = [...roots].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  return sortedRoots.map((root) => {
    const href = `/categories/${root.slug}`;
    const meta = root.meta && typeof root.meta === 'object' ? root.meta : null;
    const megaWidth =
      meta && typeof (meta as { mega_width?: unknown }).mega_width === 'number'
        ? (meta as { mega_width: number }).mega_width
        : undefined;
    const children = [...(root.children ?? [])].sort(
      (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
    );
    if (children.length === 0) {
      return { label: root.name, href, megaWidth };
    }

    const blocks: MegaBlock[] = [];
    let lastBlockIndex: number | null = null;

    for (const ch of children) {
      const nav = ch.meta?.nav;
      const blockIdx = nav?.block ?? 0;
      const isBanner = nav?.type === 'banner';

      if (lastBlockIndex !== blockIdx) {
        lastBlockIndex = blockIdx;
        if (isBanner) {
          blocks.push({
            type: 'banner',
            image: ch.image_url ?? '',
            href: `/categories/${ch.slug}`,
            cta: nav?.cta ?? ch.name,
            span: nav?.span,
          });
        } else {
          blocks.push({
            type: 'links',
            heading: nav?.heading,
            span: nav?.span,
            items: [{ label: ch.name, href: `/categories/${ch.slug}` }],
          });
        }
      } else if (blocks.length > 0) {
        const last = blocks[blocks.length - 1];
        if (last.type === 'links') {
          last.items.push({ label: ch.name, href: `/categories/${ch.slug}` });
        }
      }
    }

    return { label: root.name, href, megaWidth, blocks };
  });
}

/** Used when the categories API is unavailable. */
export const HEADER_NAV_FALLBACK: NavItem[] = [
  {
    label: 'Wedding',
    href: '/categories/wedding',
    megaWidth: 1180,
    blocks: [
      {
        type: 'links',
        heading: 'Nikkah / Wedding',
        span: 2,
        items: [
          { label: 'Nikkah Certificate', href: '/categories/nikkah-certificate' },
          { label: 'Luxury Nikah Certificate', href: '/categories/luxury-nikah-certificate' },
          { label: 'Floral Nikah Certificate', href: '/categories/floral-nikkah-certificate' },
          { label: 'Nikkah Acrylic Thumb Board', href: '/categories/nikkah-acrylic-thumb-board' },
          { label: 'Nikkah Booklet', href: '/categories/nikkah-booklet' },
          { label: 'Nikkah Frame', href: '/categories/nikkah-frame' },
          { label: 'Nikkah Invitation Card', href: '/categories/nikkah-invitation-card' },
          { label: 'Digital Nikkah Invitation', href: '/categories/digital-nikkah-invitation' },
          { label: 'Haq Mahar', href: '/categories/haq-mehar' },
          { label: 'Artificial Flower Jewelry', href: '/categories/artificial-jewelry' },
          { label: 'Wedding Welcome Board', href: '/categories/wedding-welcome-board' },
        ],
      },
      {
        type: 'links',
        span: 2,
        items: [
          { label: 'Nikkah Pen', href: '/categories/nikkah-pen' },
          { label: 'Customized Nikah Pen', href: '/categories/customized-nikah-pen' },
          { label: 'Nikkah Tray', href: '/categories/nikkah-tray' },
          { label: 'Nikkah Dupatta', href: '/categories/nikkah-dupatta' },
          { label: 'Mithai Toppers', href: '/categories/mithai-toppers' },
          { label: 'Arm Band', href: '/categories/arm-band' },
          { label: 'Bridal Contract', href: '/categories/bridal-contract' },
          { label: 'Joota Chupai Contract', href: '/categories/joota-chupaii' },
          { label: 'Gajray', href: '/categories/gajray' },
          { label: 'Doodh Pilai Glass', href: '/categories/dood-pilai-glass' },
          { label: 'Doodh Pilai Wheel', href: '/categories/doodh-pilai-wheel' },
        ],
      },
      {
        type: 'links',
        heading: 'Engagement',
        span: 2,
        items: [
          { label: 'Digital Engagement Certificate', href: '/categories/digital-engagement-certificate' },
          { label: 'Printed Engagement Certificate', href: '/categories/printed-engagement-certificate' },
          { label: 'Engagement Frame', href: '/categories/engagement-frame' },
          { label: 'Engagement Invitation', href: '/categories/engagement-invitation' },
          { label: 'Digital Engagement invitation', href: '/categories/digital-engagement-invitation' },
          { label: 'Engagement Ring Tray', href: '/categories/engagement-ring-tray' },
        ],
      },
      {
        type: 'banner',
        span: 3,
        href: '/categories/wedding-deals',
        cta: 'Wedding Deals',
        image: 'https://beezle.store/cdn/shop/files/wedding-deals.jpg?v=1747229980',
      },
      {
        type: 'banner',
        span: 3,
        href: '/categories/fresh-flowers-jewellery',
        cta: 'Fresh Flowers',
        image: 'https://beezle.store/cdn/shop/files/Untitled-1_3315d026-d14a-484a-bb28-9ba44760a5da.jpg?v=1756475347',
      },
    ],
  },
  {
    label: 'Gifts',
    href: '/categories/gifts',
    megaWidth: 1000,
    blocks: [
      {
        type: 'links',
        heading: 'Gift Box',
        items: [
          { label: 'Chocolate Box', href: '/categories/chocolate-box' },
          { label: 'Snacks Box', href: '/categories/snacks-box' },
          { label: 'Cake Box', href: '/categories/cake-box' },
          { label: 'Accessories Box', href: '/categories/accessories-box' },
          { label: 'Balloon Box', href: '/categories/balloon-box' },
          { label: 'Flower Box', href: '/categories/flower-box' },
        ],
      },
      {
        type: 'links',
        heading: 'Gift Basket',
        items: [
          { label: 'Chocolate Basket', href: '/categories/chocolate-basket' },
          { label: 'Snacks Basket', href: '/categories/snacks-basket' },
          { label: 'Accessories Basket', href: '/categories/accessories-basket' },
          { label: 'Cake Basket', href: '/categories/cake-basket' },
          { label: 'Theme Basket', href: '/categories/theme-basket' },
          { label: 'Floral Basket', href: '/categories/floral-basket' },
          { label: 'Fruit Basket', href: '/categories/fruit-basket' },
        ],
      },
      {
        type: 'links',
        heading: 'Gift Bouquet',
        items: [
          { label: 'Premium Flower Bouquet', href: '/categories/premium-flower-bouquet' },
          { label: 'Red Rose Bouquet', href: '/categories/red-rose-bouquet' },
          { label: 'Chocolate Bouquet', href: '/categories/chocolate-bouquet' },
          { label: 'Accessories Bouquet', href: '/categories/accessories-bouquet' },
          { label: 'Snacks Bouquet', href: '/categories/snacks-bouquet' },
          { label: 'Scarf Bouquet', href: '/categories/scarf-bouquet' },
          { label: 'Money Bouquet', href: '/categories/money-bouquet' },
          { label: 'Crochet Bouquet', href: '/categories/crochet-bouquet' },
        ],
      },
      {
        type: 'links',
        heading: 'Cake',
        items: [
          { label: 'Customized Cake', href: '/categories/customized-cake-1' },
          { label: 'Layers Cake', href: '/categories/layers-cake' },
          { label: 'Bakery Cake', href: '/categories/bakery-cake' },
        ],
      },
      {
        type: 'links',
        heading: 'Other',
        items: [
          { label: 'Customized Mugs', href: '/categories/customized-mugs' },
          { label: 'Tumbler', href: '/categories/tumbler' },
          { label: 'Watches', href: '/categories/watches' },
          { label: 'Scented Candles', href: '/categories/scented-candles' },
          { label: 'Teddy Bear', href: '/categories/teddy-bear' },
          { label: 'Balloons', href: '/categories/balloons' },
          { label: 'Glasses', href: '/categories/glasses' },
          { label: 'Chocolate', href: '/categories/chocolate' },
        ],
      },
    ],
  },
  {
    label: 'Birthday Gifts',
    href: '/categories/birthday-gifts',
    megaWidth: 1200,
    blocks: [
      { type: 'banner', href: '/categories/birthday-gift-for-him', cta: 'Gift For Him', image: 'https://beezle.store/cdn/shop/files/gift-for-him.jpg?v=1747230283' },
      { type: 'banner', href: '/categories/birthday-gift-for-her', cta: 'Gift For Her', image: 'https://beezle.store/cdn/shop/files/BdY-GIFT-FOR-HER.-MENU.jpg?v=1747647789' },
      { type: 'banner', href: '/categories/birthday-gift-for-mother', cta: 'Gift For Mother', image: 'https://beezle.store/cdn/shop/files/gift-for-mother.jpg?v=1747230486' },
      { type: 'banner', href: '/categories/birthday-gift-for-father', cta: 'Gift For Father', image: 'https://beezle.store/cdn/shop/files/gift-for-father.jpg?v=1747230569' },
      { type: 'banner', href: '/categories/frame-for-birthday', cta: 'Birthday Frames', image: 'https://beezle.store/cdn/shop/files/bdy-frames.jpg?v=1747294615' },
    ],
  },
  {
    label: 'Anniversary Gifts',
    href: '/categories/anniversary-gifts',
    megaWidth: 1000,
    blocks: [
      { type: 'banner', href: '/categories/anniversary-gift-for-him', cta: 'Gift For Him', image: 'https://beezle.store/cdn/shop/files/gift-for-him_bd81d4bc-1fd0-4140-bcc6-924c066b947d.jpg?v=1747662951' },
      { type: 'banner', href: '/categories/anniversary-gift-for-her', cta: 'Gift For Her', image: 'https://beezle.store/cdn/shop/files/anniversary-Gift-For-HER_9057e63b-9d00-4ec6-b78e-0a23eac86e33.jpg?v=1747647789' },
      { type: 'banner', href: '/categories/couple-frames', cta: 'Couple Frames', image: 'https://beezle.store/cdn/shop/files/couple-frame.jpg?v=1747291983' },
    ],
  },
  {
    label: 'Occasions Gifts',
    href: '/categories/occasions-gifts',
    megaWidth: 1000,
    blocks: [
      {
        type: 'links',
        items: [
          { label: "Valentine's Day Gifts", href: '/categories/valentines-day-gifts' },
          { label: "Mother's Day Gifts", href: '/categories/mothers-day-gifts' },
          { label: "Father's Day Gifts", href: '/categories/fathers-day-gifts' },
          { label: "Brother's Day Gifts", href: '/categories/brothers-day-gifts' },
          { label: 'Eid Gifts', href: '/categories/eid-gifts' },
          { label: 'New Year Gifts', href: '/categories/new-year-gifts' },
          { label: 'Get Well Soon Gifts', href: '/categories/get-well-soon-gifts' },
          { label: 'Ramadan Gifts', href: '/categories/ramadan-gifts' },
        ],
      },
      { type: 'banner', href: '/categories/sorry-gifts', cta: 'Sorry Gifts', image: 'https://beezle.store/cdn/shop/files/soory.jpg?v=1756206512' },
      { type: 'banner', href: '/categories/missing-you-gifts', cta: 'Missing You Gifts', image: 'https://beezle.store/cdn/shop/files/Untitled-1_53b39135-65ce-4e47-9e2b-f9c34aee66b5.jpg?v=1747287511' },
      { type: 'banner', href: '/categories/new-born-baby-gifts', cta: 'New Born Baby', image: 'https://beezle.store/cdn/shop/files/new-bon-baby.jpg?v=1756206511' },
    ],
  },
  {
    label: 'Gift Bundles',
    href: '/categories/gift-bundles',
    megaWidth: 420,
    blocks: [
      {
        type: 'links',
        items: [
          { label: 'Curated Eid Gifts for Her', href: '/categories/curated-eid-gifts-for-her' },
          { label: 'The Luxury Eid Selection for Him', href: '/categories/the-luxury-eid-selection-for-him' },
          { label: 'Premium Birthday Surprises for Her', href: '/categories/premium-birthday-surprises-for-her' },
          { label: 'Royal Birthday Surprises for Him', href: '/categories/royal-birthday-surprises-for-him' },
          { label: 'Affordable Birthday Surprises for Her', href: '/categories/affordable-birthday-surprises-for-her' },
          { label: 'Budget-Friendly Birthday Surprise for Him', href: '/categories/budget-friendly-birthday-surprise-for-him' },
          { label: 'Luxury Anniversary Surprise for Love', href: '/categories/luxury-anniversary-surprise-for-love' },
          { label: 'Anniversary Surprises That Fit Your Budget', href: '/categories/anniversary-surprises-that-fit-your-budget' },
          { label: "Valentine's Day Special Deals", href: '/categories/valentines-day-special-deals' },
        ],
      },
    ],
  },
  { label: 'Best Selling', href: '/categories/best-selling' },
];
