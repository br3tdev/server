import express from "express"
import UssdMenu from "ussd-builder"
import _ from "lodash"

import { prisma } from "../../../lib/db"


let menu = new UssdMenu();

const index = () => {
    menu.startState({
        run: async () => {
            const { phoneNumber } = menu.args;

            const customer = await prisma.customer.findFirst({
                where: {
                    mobileNumber: phoneNumber
                }
            })

            if (customer) {
                menu.end(
                    `Welcome back ${customer.fullName} on USSD platform:` + "\nEnter your 4-digit PIN to continue:"
                )
            } else {
                menu.end(
                    `Welcome to the USSD platform:` + "\n1. Register" + "\n0. Exit"
                )
            }
        },
        // next: {
        //     "*\\d{4}": "dashboard",
        //     "*\\w+": "register",
        // },
        defaultNext: "invalidOption"
    });

    menu.state("invalidOption", {
        run: () => {
            menu.end("Invalid option")
        }
    });

    // _.over([dashboard])(menu)

    return menu;
}

export default index;