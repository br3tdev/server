import type UssdMenu from "ussd-menu-builder";

import _ from "lodash";

import tulizo from "./tulizo.js";

const medicalInstructions = `Choose medical cover:\n1. Tulizo Bora Medical Cover\n0. Back to main menu`;

function medical(menu: UssdMenu) {
  menu.state("dashboard.medical", {
    run: async () => {
      menu.con(medicalInstructions);
    },
    next: {
      1: "medical.tulizo",
      0: "__start__",
    },
    defaultNext: "invalidOption",
  });

  menu.state("dashboard.medical.invalidOption", {
    run: () => {
      // ENHANCED: Self-correcting error message
      menu.con(`Invalid option. Please select:\n1. Tulizo Bora Medical Cover\n0. Back to main menu`);
    },
    next: {
      1: "medical.tulizo",
      0: "__start__",
    },
    defaultNext: "dashboard.medical.invalidOption",
  });

  _.over([tulizo])(menu);

  return menu;
}

export default medical;
