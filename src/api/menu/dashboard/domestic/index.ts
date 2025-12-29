import type UssdMenu from "ussd-menu-builder";

const domesticInstructions = `Domestic user flow ends up here.`;

function domestic(menu: UssdMenu) {
  menu.state("dashboard.domestic", {
    run: async () => {
      menu.con(domesticInstructions);
    },

    next: {
      1: "domestic.product",
    },
    defaultNext: "invalidOption",
  });

  menu.state("invalidOption", {
    run: () => {
      menu.end("Invalid option");
    },
  });

  return menu;
}

export default domestic;
