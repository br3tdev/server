import type UssdMenu from "ussd-menu-builder";

import _ from "lodash";

import domestic from "./domestic";
import medical from "./medical";
import motor from "./motor";

const dashboardInstructions = `Select cover type:\n1. Domestic Package\n2. Medical Cover\n3. Motor Insurance\n4. Personal Accident`;

function dashboard(menu: UssdMenu) {
  menu.state("dashboard", {
    run: () => {
      menu.con(dashboardInstructions);
    },
    next: {
      1: "dashboard.domestic",
      2: "dashboard.medical",
      3: "dashboard.motor",
      4: "personalAccident",
    },
  });

  menu.state("invalidOption", {
    run: () => {
      menu.end("Invalid option");
    },
    defaultNext: "dashboard",
  });

  menu.state("personalAccident", {
    run: () => {
      menu.end(`Personal Accident cover info. You'll receive full details by SMS shortly.`);
    },
  });

  _.over([domestic, medical, motor])(menu);
}

export default dashboard;
