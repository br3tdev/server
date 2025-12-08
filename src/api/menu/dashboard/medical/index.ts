import express from "express"
import UssdMenu from "ussd-builder"
import _ from "lodash"

import { prisma } from "../../../../../lib/db";


const medicalInstructions = `Choose medical product. \n1. Get Individual Tulizo Bora Insurance`

const index = (menu: UssdMenu) => {
    menu.state("medical", {
        run: async () => {
            menu.con(medicalInstructions)
        },
        next: {
            "1": "tulizo",
        },
        defaultNext: "invalidOption"
    });

    menu.state("invalidOption", {
        run: () => {
            menu.end("Invalid option")
        }
    });

    menu.state("tulizo", {
        run: () => {
           menu.end(`Select Your Desirable Limit. 1. IP limit 2. OP limit 3.Maternity limit`)
        }
    })

    return menu;
}

export default index;