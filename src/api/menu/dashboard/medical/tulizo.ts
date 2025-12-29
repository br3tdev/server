import type UssdMenu from "ussd-menu-builder";

import _ from "lodash";

import family from "./tulizo-family.js";
import self from "./tulizo-self.js";
// import family from "./b";

function tulizo(menu: UssdMenu) {
  menu.state("medical.tulizo", {
    run: () => {
      menu.con(`Medical cover for:\n1. Self\n2. For Family`);
    },
    next: {
      1: "tulizo.self",
      2: "medical.tulizo.family",
    },
    defaultNext: "invalidOption",
  });

  _.over([self, family])(menu);

  return menu;
}

export default tulizo;
