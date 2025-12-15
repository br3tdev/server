import express from "express"
import UssdMenu from "ussd-menu-builder"
import _ from "lodash"

import { prisma } from "../../../../../lib/db";


const motorCoverInstructions = `Choose medical product. \n1. Get Comprehensive Insurance`

const motor = (menu: UssdMenu) => {
    menu.state("dashboard.motor", {
        run: async () => {
            menu.con(motorCoverInstructions)
        },
        
        next: {
            "1": "comp",
        },
        defaultNext: "invalidOption"
    });

    menu.state("invalidOption", {
        run: () => {
            menu.end("Invalid option")
        }
    });

    menu.state("comp", {
        run: () => {
           menu.end("Comprehensive cover user flow goes here")
        }
    })

    return menu;
}

export default motor;