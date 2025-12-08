import express from "express"
import _ from "lodash";
import UssdMenu from "ussd-builder";

import medical from "./medical"
import domestic from "./domestic"
import motor from "./motor"


const dashboardInstructions = `Choose a product: 
\n1. Domestic Package 
\n2. Medical Cover 
\n3. Motor Insurance 
`

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

    menu.state("gis", {
        run: () => {
            menu.end("GIS user flow would go here");
        }
    });

    _.over([medical, domestic, motor])(menu)
}

export default dashboard;