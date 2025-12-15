import express from "express"
import _ from "lodash";
import UssdMenu from "ussd-menu-builder";

import medical from "./medical"
import domestic from "./domestic"
import motor from "./motor"


const dashboardInstructions = `Choose a product:\n1. Domestic Package\n2. Medical Cover\n3. Motor Insurance\n4. Personal Accident`

const dashboard = (menu: UssdMenu) => {
    menu.state("dashboard", {
        run: () => {
            menu.con(dashboardInstructions)
        },
        next: {
            "1": "dashboard.domestic",
            "2": "dashboard.medical",
            "3": "dashboard.motor"
        }
    });

    menu.state("invalidOption", {
        run: () => {
            menu.end("Invalid option")
        },
        defaultNext: "dashboard"
    });

    _.over([domestic, medical, motor])(menu)
}

export default dashboard;