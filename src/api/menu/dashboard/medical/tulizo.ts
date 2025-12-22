import UssdMenu from "ussd-menu-builder"
import _ from "lodash"

import self from "./tulizo-self";
import family from "./tulizo-family";
// import family from "./b";


const tulizo = (menu: UssdMenu) => {
    menu.state("medical.tulizo", {
        run: () => {
           menu.con(`Medical cover for:\n1. Self\n2. For Family`)
        },
        next: {
            "1": "tulizo.self",
            "2": "tulizo.family"
        },
        defaultNext: "invalidOption"
    })

    _.over([self, family])(menu)
    
    return menu
}

export default tulizo;