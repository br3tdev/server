import express from "express"
import UssdMenu from "ussd-builder"
import _ from "lodash"

import { prisma } from "../../../../../lib/db";



const domesticInstructions = `Domestic user flow ends up here.`

const index = (menu: UssdMenu) => {
    menu.startState({
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

export default index;