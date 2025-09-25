export const OTAKUDESU_SELECTORS = {
  v2025_09: {
    home: {
      navigationLinks: ".rapi > a",
      sections: ".venz",
      card: "ul li .detpost",
    },
    schedule: {
      container: ".kglist321",
      header: "h2",
      item: "ul li a",
    },
    animeList: {
      group: ".bariskelom",
      header: ".barispenz a",
      item: ".jdlbar a",
    },
    ongoing: {
      cards: ".venutama ul li",
    },
    completed: {
      cards: ".venutama ul li",
    },
    search: {
      results: "ul.chivsrc li",
    },
  },
} as const;

export type OtakudesuSelectorVersion = keyof typeof OTAKUDESU_SELECTORS;
export const CURRENT_OTAKUDESU_SELECTOR_VERSION: OtakudesuSelectorVersion = "v2025_09";
