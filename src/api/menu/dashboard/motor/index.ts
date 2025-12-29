import type UssdMenu from "ussd-menu-builder";

const motorCoverInstructions = `Choose medical product. \n1. Get Comprehensive Insurance`;

function motor(menu: UssdMenu) {
  menu.state("dashboard.motor", {
    run: async () => {
      menu.con(motorCoverInstructions);
    },

    next: {
      1: "comp",
    },
    defaultNext: "invalidOption",
  });

  menu.state("invalidOption", {
    run: () => {
      menu.end("Invalid option");
    },
  });

  menu.state("comp", {
    run: () => {
      menu.end("Comprehensive cover user flow goes here");
    },
  });

  return menu;
}

export default motor;
