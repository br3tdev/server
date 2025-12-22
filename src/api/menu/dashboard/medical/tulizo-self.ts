import UssdMenu from "ussd-menu-builder"
import { prisma } from "../../../../../lib/db";
import MedicalService from "../../../../../services/medical.service";
import { formatPlanOptions } from "../../../../../utils/common";

const VALIDATION_PATTERNS = {
  dob: "*\\d{2}/\\d{2}/\\d{4}",
  name: "*[A-Za-z][A-Za-z\\s\\-'\\\\.]+",
  idNumber: "*\\d{8}",
  email: "*[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}",
  digit: "*\\d",
  relationship: "*\\d{1}",
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
    relationship: 'Spouse' | 'Child';
  }>;
  currentDependantIndex?: number;
  currentDependantData?: {
    dob?: string;
    fullName?: string;
    relationship?: 'Spouse' | 'Child';
  };
}

interface PolicyOption {
  id: string;
  displayText: string;
  policyDetails: string;
}

const POLICY_OPTIONS: Record<string, PolicyOption> = {
  base: {
    id: "base",
    displayText: "IP 1M, OP 500K, Mat 250K",
    policyDetails: "IP 1M, OP 500K, Mat 250K"
  },
  max: {
    id: "max",
    displayText: "IP 2M, OP 700K, Mat 550K",
    policyDetails: "IP 2M, OP 700K, Mat 550K"
  },
  lite: {
    id: "lite",
    displayText: "IP 3M, OP 500K",
    policyDetails: "IP 3M, OP 500K"
  }
};

// Upgrade to Redis or other Storage Driver
let session: { [sessionId: string]: CustomerKyc } = {};

let initialMessage = `Select preferred benefits:\n1. IP 1M, OP 500K, Mat 250K\n2. IP 2M, OP 700K, Mat 550K\n99. Go back`

const tulizoSelf = (menu: UssdMenu) => {
    menu.state("tulizo.self", {
        run: async () => {
            // ! TODO: Pull benefits from database
            const benefits = await MedicalService.getMedicalProductBenefits();
            if (benefits) {
                let message = formatPlanOptions(benefits)
                menu.con(message)
            } else {
                menu.end(`Service unavailable`)
            }
        },
        next: {
            "1": "tulizo.self.base",
            "2": "tulizo.self.max"
        },
        defaultNext: "invalidOption"
    })

    menu.state("tulizo.self.base", {
        run: () => {
            const { val, args: { sessionId } } = menu;
            session[sessionId] = { policy: "IP 1M, OP 500K, Mat 250K" }
            menu.con(`Enter DOB: (dd/mm/yyyy)`)
        },
        next: {
            [VALIDATION_PATTERNS.dob]: "base.fullName.process",
        },
        defaultNext: "invalidOption"
    })


    menu.state("tulizo.self.max", {
        run: () => {
            const { val, args: { sessionId } } = menu;
            session[sessionId] = { policy: "IP 2M, OP 700K, Mat 550K" }
            menu.con(`Enter DOB: (dd/mm/yyyy)`)
        },
        next: {
            [VALIDATION_PATTERNS.dob]: "base.fullName.process",
        },
        defaultNext: "invalidOption"
    })

    menu.state("base.fullName.process", {
        run: () => {
            const { val, args: { sessionId } } = menu;
            session[sessionId].dob = val ;
            menu.con(`Enter Full Name:`)
        },
        next: {
            [VALIDATION_PATTERNS.name]: "base.idNumber.process",
        },
        defaultNext: "invalidOption"
    })

    menu.state("base.idNumber.process", {
        run: () => {
            const { val, args: { sessionId } } = menu;
            session[sessionId].fullName = val;
            menu.con(`Enter ID Number:`)
        },
        next: {
            [VALIDATION_PATTERNS.idNumber]: "base.email.process"
        },
        defaultNext: "invalidOption"
    })

    menu.state("base.email.process", {
        run: () => {
            const { val, args: { sessionId } } = menu;
            session[sessionId].idNumber = val;
            menu.con(`Enter email address:`)
        },
        next: {
            [VALIDATION_PATTERNS.email]: "process.end"
        },
        defaultNext: "invalidOption"
    })

    menu.state("process.end", {
        run:  async () => {
            const { val, args: { sessionId, phoneNumber } } = menu;
            session[sessionId].email = val;

            console.log(sessionId)

            const { dob, email, fullName, idNumber } = session[sessionId]

            if (dob && email && fullName && idNumber) {
                const medicalCustomer = await prisma?.medicalCustomer.create({
                    data: {
                        mobileNumber: phoneNumber,
                        dob,
                        fullName,
                        email: val,
                        idNumber
                    }
                })
                console.log(session[sessionId])
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

export default tulizoSelf;