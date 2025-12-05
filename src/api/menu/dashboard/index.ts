import express from "express"
import _ from "lodash";
import UssdMenu from "ussd-builder";
// import { UssdMenuType } from "../index";


const dashboardInstructions = `Choose a service to product: \n1. Domestic Package \n2. Medical Cover \n3. Motor Insurance \n4. View My Policy`;

const dashboard = (menu: UssdMenu) => {
    // Define menu states
    menu.state("dashboard", {
        run: async () => {
            const { val, args: { phoneNumber } } = menu;

            menu.con(dashboardInstructions)
        },
        next: {
            '1': 'dashboard.gis',
            '2': 'dashboard.medical',
            '3': 'dashboard.motor'
        }
    });

    menu.state("invalidOption", {
        run: () => {
            menu.end("Invalid option")
        }
    });

    menu.state("gis", {
        run: () => {
            menu.end("GIS user flow would go here");
        }
    });

    menu.state("medical", {
        run: () => {
            menu.end("Medical user flow would go here");
        }
    });

    menu.state("motor", {
        run: () => {
            menu.end("Motor user flow would go here");
        }
    });

    // _.over([gis, medical, motor])(menu)
}

export default dashboard;