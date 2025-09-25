export const SAMEHADAKU_SELECTORS = {
  v2025_09: {
    home: {
      recentWrapper: ".post-show",
      recentItems: "ul li",
      movieItems: ".widgetseries ul li",
      batchLink: ".widget-title h3 .linkwidget",
      movieLink: ".widgets h3 .linkwidget",
      recentLink: ".wp-block-button__link",
    },
    genres: {
      list: ".filter_act.genres .tax_fil",
      input: "input",
    },
    animeList: {
      container: ".listupd",
      item: ".bs",
    },
  },
} as const;

export type SamehadakuSelectorVersion = keyof typeof SAMEHADAKU_SELECTORS;
export const CURRENT_SAMEHADAKU_SELECTOR_VERSION: SamehadakuSelectorVersion = "v2025_09";
