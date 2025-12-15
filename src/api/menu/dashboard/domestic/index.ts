import express from "express"
import UssdMenu from "ussd-menu-builder"
import _ from "lodash"

import { prisma } from "../../../../../lib/db";



const domesticInstructions = `Domestic user flow ends up here.`

const domestic = (menu: UssdMenu) => {
    menu.state("dashboard.domestic", {
        run: async () => {
            menu.con(domesticInstructions)
        },
        
        next: {
            "1": "domestic.product",
        },
        defaultNext: "invalidOption"
    });

    menu.state("invalidOption", {
        run: () => {
            menu.end("Invalid option")
        }
    });

    return menu;
}

export default domestic;