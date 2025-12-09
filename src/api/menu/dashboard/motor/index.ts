import express from "express"
import UssdMenu from "ussd-builder"
import _ from "lodash"

import { prisma } from "../../../../../lib/db";


const medicalInstructions = `Choose medical product. \n1. Get Individual Tulizo Bora Insurance`

const index = (menu: UssdMenu) => {
    menu.startState({
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
           menu.end("")
        }
    })

    return menu;
}

export default index;