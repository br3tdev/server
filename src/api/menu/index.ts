// import express from "express"
// import UssdMenu from "ussd-builder"
// import _ from "lodash"

// import { prisma } from "../../../lib/db"


// let menu = new UssdMenu();

// const index = () => {
//     menu.startState({
//         run: async () => {
//             const { phoneNumber } = menu.args;

//             const customer = await prisma.customer.findFirst({
//                 where: {
//                     mobileNumber: phoneNumber
//                 }
//             })

//             if (customer) {
//                 menu.end(
//                     `Welcome back ${customer.fullName} on USSD platform:` + "\nEnter your 4-digit PIN to continue:"
//                 )
//             } else {
//                 menu.end(
//                     `Welcome to the USSD platform:` + "\n1. Register" + "\n0. Exit"
//                 )
//             }
//         },
//         // next: {
//         //     "*\\d{4}": "dashboard",
//         //     "*\\w+": "register",
//         // },
//         defaultNext: "invalidOption"
//     });

//     menu.state("invalidOption", {
//         run: () => {
//             menu.end("Invalid option")
//         }
//     });

//     // _.over([dashboard])(menu)

//     return menu;
// }

// export default index;


import express from "express"
import UssdMenu from "ussd-builder"
import _ from "lodash"

import { prisma } from "../../../lib/db"

let menu = new UssdMenu();

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
                // Use menu.con() instead of menu.end() to continue the session
                menu.con(
                    `Welcome back ${customer.fullName} on USSD platform:` + 
                    "\nEnter your 4-digit PIN to continue:"
                )
            } else {
                // Use menu.con() to show options and wait for user input
                menu.con(
                    `Welcome to the USSD platform:` + 
                    "\n1. Register" + 
                    "\n0. Exit"
                )
            }
        },
        // Add next state transitions based on user input
        next: {
            "1": "register",  // When user enters "1", go to register state
            "0": "exit",      // When user enters "0", go to exit state
            "*\\d{4}": "dashboard"  // When user enters 4 digits, go to dashboard
        },
        defaultNext: "invalidOption"
    });

    menu.state("invalidOption", {
        run: () => {
            menu.end("Invalid option")
        }
    });

    // Add the missing states
    menu.state("register", {
        run: () => {
            menu.end("Registration flow would go here");
        }
    });

    menu.state("exit", {
        run: () => {
            menu.end("Goodbye!");
        }
    });

    menu.state("dashboard", {
        run: () => {
            // Handle PIN verification and show dashboard
            menu.end("Dashboard would show here after PIN verification");
        }
    });

    return menu;
}

export default index;