import UssdMenu from "ussd-menu-builder"
import { prisma } from "../../../../../lib/db";

const VALIDATION_PATTERNS = {
  dob: "*\\d{2}/\\d{2}/\\d{4}",
  name: "*[A-Za-z][A-Za-z\\s\\-'\\\\.]+",
  idNumber: "*\\d{8}",
  email: "*[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}",
  digit: "*\\d",
  relationship: "*\\d{1}"
} as const;

type CustomerKyc = {
  dob?: string;
  fullName?: string;
  idNumber?: string;
  email?: string;
  noOfDependants?: number;
  policy?: string;
  dependants?: Array<{
    dob: string;
    fullName: string;
    relationship: 'SPOUSE' | 'CHILD';
  }>;
  currentDependantIndex?: number;
  currentDependantData?: {
    dob?: string;
    fullName?: string;
    relationship?: 'SPOUSE' | 'CHILD';
  };
}

// Upgrade to Redis or other Storage Driver
let session: { [sessionId: string]: CustomerKyc } = {};

const tulizoFamily = (menu: UssdMenu) => {
    // Family plan
    menu.state("tulizo.family", {
        run: async () => {
            // ! TODO: Pull benefits from database
            menu.con(`Select preferred benefits:\n1. IP 1M, OP 500K, Mat 250K\n2. IP 2M, OP 700K, Mat 550K\n3. IP 3M, OP 500K\n99. Go back`)
        },
        next: {
            "1": "family.base",
            "2": "family.max",
            "3": "family.lite",
            "99": () => { menu.go("medical.tulizo") }
        },
        defaultNext: "invalidOption"
    })

    menu.state("family.base", {
        run: () => {
            const { args: { sessionId } } = menu
            session[sessionId] = { policy: "IP 1M, OP 500K, Mat 250K" };
            menu.con(`Enter DOB: (dd/mm/yyyy)`)
        },
        next: {
            [VALIDATION_PATTERNS.dob]: "family.base.fullName.process",
        },
        defaultNext: "invalidOption"
    })

    menu.state("family.max", {
        run: () => {
            const { args: { sessionId } } = menu
            session[sessionId] = { policy: "IP 2M, OP 700K, Mat 550K" };
            menu.con(`Enter DOB: (dd/mm/yyyy)`)
        },
        next: {
            [VALIDATION_PATTERNS.dob]: "family.base.fullName.process",
        },
        defaultNext: "invalidOption"
    })
    
    menu.state("family.lite", {
        run: () => {
            const { args: { sessionId } } = menu
            session[sessionId] = { policy: "IP 3M, OP 500K" };
            menu.con(`Enter DOB: (dd/mm/yyyy)`)
        },
        next: {
            [VALIDATION_PATTERNS.dob]: "family.base.fullName.process",
        },
        defaultNext: "invalidOption"
    })

    menu.state("family.base.fullName.process", {
        run: () => {
            const { val, args: { sessionId } } = menu
            session[sessionId].dob = val;
            menu.con(`Enter Full Name:`)
        },
        next: {
            [VALIDATION_PATTERNS.name]: "family.base.idNumber.process",
        },
        defaultNext: "invalidOption"
    })

    menu.state("family.base.idNumber.process", {
        run: () => {
            const { val, args: { sessionId } } = menu
            session[sessionId].fullName = val;
            menu.con(`Enter ID Number:`)
        },
        next: {
            [VALIDATION_PATTERNS.idNumber]: "family.base.noOfdependants.process"
        },
        defaultNext: "invalidOption"
    })

    menu.state("family.base.noOfdependants.process", {
        run: () => {
            const { val, args: { sessionId } } = menu
            session[sessionId].idNumber = val;
            menu.con(`Enter number of dependants:`)
        },
        next: {
            "*\\d": "family.base.dependant.dob.process",
        },
        defaultNext: "invalidOption"
    })

    menu.state("family.base.dependant.dob.process", {
        run: () => {
            const { val, args: { sessionId } } = menu
            session[sessionId].noOfDependants = parseInt(val);

            menu.con(`Enter Dependant's Dob:`)
        },
        next: {
            [VALIDATION_PATTERNS.dob]: "family.base.dependant.fullName.process"
        },
        defaultNext: "invalidOption"
    })

    menu.state("family.base.dependant.fullName.process", {
        run: () => {
            const { val, args: { sessionId } } = menu
            session[sessionId].currentDependantData = {};
            session[sessionId].currentDependantData.dob = val;
            menu.con(`Enter Dependant's Full name:`)
        },
        next: {
            [VALIDATION_PATTERNS.name]: "family.base.dependant.relationship.process",
        },
        defaultNext: "invalidOption"
    })

    menu.state("family.base.dependant.relationship.process", {
        run: () => {
            const { val, args: { sessionId } } = menu
            session[sessionId].currentDependantData!.fullName = val;
            menu.con(`Enter relationship with dependant:\n1. Spouse\n2. Child`)
        },
        next: {
            [VALIDATION_PATTERNS.relationship]: "family.base.confirmComplete.process"
        },
        defaultNext: "invalidOption"
    })

    menu.state("family.base.confirmComplete.process", {
        run: () => {
            const { val, args: { sessionId } } = menu
            session[sessionId].currentDependantData!.relationship = (val === "1" ? "SPOUSE" : "CHILD")
            const dependantData = (session[sessionId].currentDependantData) as { dob: string; fullName: string; relationship: 'SPOUSE' | 'CHILD' }
            session[sessionId].dependants = []
            session[sessionId].dependants.push(dependantData)
            menu.con(`Successfully registered dependant:\n1. Add other dependant\n2. Proceed to complete application`)
        },
        next: {
            "1": "family.base.dependant.dob.process",
            "2": "family.base.email.process"
        }
    })

    menu.state("family.base.email.process", {
        run: () => {
            // const { val, args: { sessionId } } = menu
            // session[sessionId].email = val;
            menu.con(`Enter email address:`)
        },
        next: {
            [VALIDATION_PATTERNS.email]: "family.process.end"
        },
        defaultNext: "invalidOption"
    })

    menu.state("family.process.end", {
        run:  async () => {
            const { val, args: { sessionId, phoneNumber } } = menu;
            session[sessionId].email = val;

            console.log(sessionId)
            console.log(session[sessionId])

            const { dob, email, fullName, idNumber, dependants } = session[sessionId]

            if (dob && email && fullName && idNumber && dependants) {
                const medicalCustomer = await prisma?.medicalCustomer.create({
                    data: {
                        mobileNumber: phoneNumber,
                        dob,
                        fullName,
                        email: val,
                        idNumber,
                        dependants: {
                            create: dependants
                        }
                    }
                })
                console.log(medicalCustomer)

                if (medicalCustomer) {
                    menu.end(`✓ Application successful!\nYour detailed quote will be sent to your email shortly.\nThank you for choosing us.`);
                } 
            } else {
                menu.end(`Error occured`)
            }
            
        },
    })

    return menu
}

export default tulizoFamily;