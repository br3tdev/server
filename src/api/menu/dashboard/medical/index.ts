import express from "express"
import UssdMenu from "ussd-menu-builder"
import _ from "lodash"

import tulizo from "./tulizo";

import { prisma } from "#lib/db";


const medicalInstructions = `Choose medical product. \n1. Tulizo Bora Medical Cover`

const medical = (menu: UssdMenu) => {
    menu.state("dashboard.medical", {
        run: async () => {
            menu.con(medicalInstructions)
        },
        next: {
            "1": "medical.tulizo",
        },
        defaultNext: "invalidOption"
    });

    menu.state("invalidOption", {
        run: () => {
            menu.end("Invalid option")
        }
    });

    _.over([tulizo])(menu)

    return menu;
}

export default medical;