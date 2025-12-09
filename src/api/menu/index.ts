import express from "express"
import UssdMenu from "ussd-builder"
import _ from "lodash"

import dashboard from "./dashboard"

let menu = new UssdMenu();

export type UssdMenuType = typeof menu;

const defaultMenu = `Welcome to MUA Insurance: \n1: Get Covered \n2: View Policies \n99: Exit`

const index = (req: unknown) => {
    menu.startState({
        run: async () => {
            menu.con(defaultMenu)
        },
        
        next: {
            "1": "dashboard",
            "2": "policies",
            "99": "exit",
        },
        defaultNext: "invalidOption"
    });

    menu.state("policies", {
        run: () => {
            menu.end(`View user policy user flow goes here`)
        }
    })

    menu.state("exit", {
        run: () => {
            menu.end(`Thank you for visiting.`)
        }
    })

    menu.state("invalidOption", {
        run: () => {
            menu.end("Invalid option")
        }
    });

    _.over([dashboard])(menu)

    return menu;
}

export default index;