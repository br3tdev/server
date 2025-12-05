import express from "express"
import UssdMenu from "ussd-builder"
import _ from "lodash"

import { prisma } from "../../../lib/db"

import dashboard from "./dashboard"

let menu = new UssdMenu();

export type UssdMenuType = typeof menu;

const index = (req: unknown) => {
    menu.startState({
        run: async () => {
            const { phoneNumber } = menu.args;

            const customer = await prisma.customer.findFirst({
                where: {
                    mobileNumber: phoneNumber
                }
            })

            if (customer) {
                menu.con(
                    `Welcome back ${customer.fullName} on USSD platform:` + 
                    "\nEnter your 4-digit PIN to continue:"
                )
            } else {
                menu.con(
                    `Welcome to the USSD platform:` + 
                    "\n1. Register" + 
                    "\n0. Exit"
                )
            }
        },
        
        next: {
            "1": "register",
            "0": "exit",
            "*\\d{4}": "dashboard"
        },
        defaultNext: "invalidOption"
    });

    menu.state("invalidOption", {
        run: () => {
            menu.end("Invalid option")
        }
    });

    // // Add the missing states
    // menu.state("register", {
    //     run: () => {
    //         menu.end("Registration flow would go here");
    //     }
    // });

    // menu.state("exit", {
    //     run: () => {
    //         menu.end("Goodbye!");
    //     }
    // });

    // menu.state("dashboard", {
    //     run: () => {
    //         // Handle PIN verification and show dashboard
    //         menu.end("Dashboard would show here after PIN verification");
    //     }
    // });

    _.over([dashboard])(menu)

    return menu;
}

export default index;