import type UssdMenu from "ussd-menu-builder";

import { prisma } from "../../../../../lib/db";
import { VALIDATION_PATTERNS } from "../../../../../utils/validation-patterns";

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
    relationship: "SPOUSE" | "CHILD";
  }>;
  currentDependantIndex?: number;
  currentDependantData?: {
    dob?: string;
    fullName?: string;
    relationship?: "SPOUSE" | "CHILD";
  };
};

// Upgrade to Redis or other Storage Driver
const session: { [sessionId: string]: CustomerKyc } = {};

function getSession(sessionId: string): CustomerKyc {
  if (!session[sessionId]) {
    session[sessionId] = {
      dependants: [],
      currentDependantIndex: 0,
    };
  }

  return session[sessionId];
}

function resetCurrentDependant(sessionId: string) {
  session[sessionId].currentDependantData = {};
}

function tulizoFamily(menu: UssdMenu) {
  // Family plan
  menu.state("medical.tulizo.family", {
    run: async () => {
      // ! TODO: Pull benefits from database
      const planMenu = `Tulizo Bora Family Plans:\n1. Family Standard\n   IP: 1M, OP: 500K\n   Maternity: 250K\n2. Family Comprehensive\n   IP: 2M, OP: 700K\n   Maternity: 550K\n3. Family Basic\n   IP: 3M, OP: 500K\n0. Back`;
      menu.con(planMenu);
    },
    next: {
      1: "medical.tulizo.family.base",
      2: "medical.tulizo.family.max",
      3: "medical.tulizo.family.lite",
      0: "medical.tulizo",
    },
    defaultNext: "medical.tulizo.family.invalidOption",
  });

  menu.state("medical.tulizo.family.invalidOption", {
    run: () => {
      menu.con(`Invalid option. Please select:\n1. Family Standard\n   IP: 1M, OP: 500K\n   Maternity: 250K\n2. Family Comprehensive\n   IP: 2M, OP: 700K\n   Maternity: 550K\n3. Family Basic\n   IP: 3M, OP: 500K\n0. Back`);
    },
    next: {
      1: "medical.tulizo.family.base",
      2: "medical.tulizo.family.max",
      3: "medical.tulizo.family.lite",
      0: "medical.tulizo",
    },
    defaultNext: "medical.tulizo.family.invalidOption",
  });

  const createPlanState = (planType: string, planName: string) => {
    menu.state(`medical.tulizo.family.${planType}`, {
      run: () => {
        const { args: { sessionId } } = menu;
        const customer = getSession(sessionId);
        customer.policy = planName;
        resetCurrentDependant(sessionId);

        menu.con(`${planName} selected.\nEnter your Date of Birth\nFormat: (DD/MM/YYYY)`);
      },
      next: {
        [VALIDATION_PATTERNS.dob]: "medical.tulizo.family.fullName",
      },
      defaultNext: "medical.tulizo.family.dobError",
    });
  };

  // Create the three plan states
  createPlanState("base", "Family Standard - IP 1M, OP 500K, Mat 250K");
  createPlanState("max", "Family Comprehensive - IP 2M, OP 700K, Mat 550K");
  createPlanState("lite", "Family Basic - IP 3M, OP 500K");

  menu.state("medical.tulizo.family.dobError", {
    run: () => {
      menu.con(`Use DD/MM/YYYY format\nExample: 15/05/1990\nEnter your Date of Birth:`);
    },
    next: {
      [VALIDATION_PATTERNS.dob]: "medical.tulizo.family.fullName",
    },
    defaultNext: "medical.tulizo.family.dobError",
  });

  menu.state("medical.tulizo.family.fullName", {
    run: () => {
      const { val, args: { sessionId } } = menu;
      const customer = getSession(sessionId);
      customer.dob = val;

      menu.con(`Enter Full Name:`);
    },
    next: {
      [VALIDATION_PATTERNS.name]: "medical.tulizo.family.idNumber",
    },
    defaultNext: "medical.tulizo.family.nameError",
  });

  menu.state("medical.tulizo.family.nameError", {
    run: () => {
      menu.con(`Use letters only please.\nExample: John Kamau Mwangi\nEnter Your Full Name:`);
    },
    next: {
      [VALIDATION_PATTERNS.name]: "medical.tulizo.family.idNumber",
    },
    defaultNext: "medical.tulizo.family.nameError",
  });

  menu.state("medical.tulizo.family.idNumber", {
    run: () => {
      const { val, args: { sessionId } } = menu;
      const customer = getSession(sessionId);
      customer.fullName = val;

      menu.con(`Enter ID Number:`);
    },
    next: {
      [VALIDATION_PATTERNS.idNumber]: "medical.tulizo.family.dependantsCount",
    },
    defaultNext: "medical.tulizo.family.idError",
  });

  menu.state("medical.tulizo.family.idError", {
    run: () => {
      menu.con(`ID must be 8 digits.\nEnter ID:`);
    },
    next: {
      [VALIDATION_PATTERNS.idNumber]: "medical.tulizo.family.dependantsCount",
    },
    defaultNext: "medical.tulizo.family.idError",
  });

  menu.state("medical.tulizo.family.dependantsCount", {
    run: () => {
      const { val, args: { sessionId } } = menu;
      const customer = getSession(sessionId);
      customer.idNumber = val;

      menu.con(`Enter number of dependants:\nInclude spouse and children.`);
    },
    next: {
      "*\\d": "medical.tulizo.family.dependantStart",
    },
    defaultNext: "medical.tulizo.family.countError",
  });

  menu.state("medical.tulizo.family.countError", {
    run: () => {
      menu.con(`Invalid.\nEnter number of dependants:`);
    },
    next: {
      "*\\d": "medical.tulizo.family.dependantStart",
    },
    defaultNext: "medical.tulizo.family.countError",
  });

  menu.state("medical.tulizo.family.dependantStart", {
    run: () => {
      const { val, args: { sessionId } } = menu;
      const customer = getSession(sessionId);
      const count = Number.parseInt(val);

      if (count < 1 || count > 10) {
        menu.con(`Maximum 10 dependants.\nPlease enter valid number of dependants:`);
        return;
      }

      customer.noOfDependants = count;
      customer.currentDependantIndex = 1;
      resetCurrentDependant(sessionId);

      if (count === 0) {
        menu.go("medical.tulizo.family.email");
      }
      else {
        menu.con(`Dependant ${customer.currentDependantIndex} of ${count}\nDate of Birth\nFormat: (DD/MM/YYYY):`);
      }
    },
    next: {
      [VALIDATION_PATTERNS.dob]: "medical.tulizo.family.dependantName",
    },
    defaultNext: "medical.tulizo.family.dependent.dobError",
  });

  menu.state("medical.tulizo.family.dependent.dobError", {
    run: () => {
      menu.con(`Use DD/MM/YYYY format\nExample: 15/05/1990\nEnter dependent Date of Birth:`);
    },
    next: {
      [VALIDATION_PATTERNS.dob]: "medical.tulizo.family.dependantName",
    },
    defaultNext: "medical.tulizo.family.dependent.dobError",
  });

  menu.state("medical.tulizo.family.dependantName", {
    run: () => {
      const { val, args: { sessionId } } = menu;
      const customer = getSession(sessionId);
      if (!customer.currentDependantData) {
        customer.currentDependantData = {};
      }
      customer.currentDependantData.dob = val;

      menu.con(`Dependant ${customer.currentDependantIndex} of ${customer.noOfDependants}\nEnter dependant Full Name:`);
    },
    next: {
      [VALIDATION_PATTERNS.name]: "medical.tulizo.family.dependantRelationship",
    },
    defaultNext: "medical.tulizo.family.dependant.nameError",
  });

  menu.state("medical.tulizo.family.dependant.nameError", {
    run: () => {
      menu.con(`Use letters only please.\nExample: John Kamau Mwangi\nEnter Dependant Full Name:`);
    },
    next: {
      [VALIDATION_PATTERNS.name]: "medical.tulizo.family.dependantRelationship",
    },
    defaultNext: "medical.tulizo.family.dependant.nameError",
  });

  menu.state("medical.tulizo.family.dependantRelationship", {
    run: () => {
      const { val, args: { sessionId } } = menu;
      const customer = getSession(sessionId);
      if (customer.currentDependantData) {
        customer.currentDependantData.fullName = val;
      }

      menu.con(`Dependant ${customer.currentDependantIndex} of ${customer.noOfDependants}\nEnter relationship with dependant\n1. Spouse\n2. Child`);
    },
    next: {
      1: "medical.tulizo.family.saveDependant",
      2: "medical.tulizo.family.saveDependant",
    },
    defaultNext: "medical.tulizo.family.relationshipError",
  });

  menu.state("medical.tulizo.family.relationshipError", {
    run: () => {
      const { args: { sessionId } } = menu;
      const customer = getSession(sessionId);

      menu.con(`Please select 1 or 2:\nDependant ${customer.currentDependantIndex} of ${customer.noOfDependants}\n1. Spouse\n2. Child`);
    },
    next: {
      1: "medical.tulizo.family.saveDependant",
      2: "medical.tulizo.family.saveDependant",
    },
    defaultNext: "medical.tulizo.family.relationshipError",
  });

  menu.state("medical.tulizo.family.saveDependant", {
    run: () => {
      const { val, args: { sessionId } } = menu;
      const customer = getSession(sessionId);

      if (customer.currentDependantData) {
        const relationship = val === "1" ? "SPOUSE" : "CHILD";
        customer.currentDependantData.relationship = relationship;

        if (!customer.dependants) {
          customer.dependants = [];
        }

        customer.dependants.push({
          dob: customer.currentDependantData.dob!,
          fullName: customer.currentDependantData.fullName!,
          relationship,
        });

        const remaining = customer.noOfDependants! - customer.currentDependantIndex!;

        if (remaining > 0) {
          customer.currentDependantIndex!++;
          resetCurrentDependant(sessionId);

          menu.con(`✓ Dependant ${customer.currentDependantIndex! - 1} saved.\n${remaining} more to add.\n1. Add next dependant\n2. Finish & continue\n0. Cancel`);
        }
        else {
          menu.con(`✓ All ${customer.noOfDependants} dependants saved.\n1. Add another dependant\n2. Continue to email\n0. Cancel`);
        }
      }
    },
    next: {
      1: "medical.tulizo.family.dependantStart",
      2: "medical.tulizo.family.email",
      0: "medical.tulizo",
    },
    defaultNext: "medical.tulizo.family.saveDependant",
  });

  menu.state("medical.tulizo.family.email", {
    run: () => {
      const { args: { sessionId } } = menu;
      const customer = getSession(sessionId);

      const dependantSummary = customer.dependants?.length
        ? `Covering: You + ${customer.dependants.length} dependant(s)`
        : "Covering: You only";

      menu.con(`Enter your Email Address to complete application\n${dependantSummary}\nYour quote will be sent here.`);
    },
    next: {
      [VALIDATION_PATTERNS.email]: "medical.tulizo.family.confirm",
    },
    defaultNext: "medical.tulizo.family.emailError",
  });

  menu.state("medical.tulizo.family.emailError", {
    run: () => {
      menu.con(`Email format incorrect.\nEnter your email Address\nExample: john@email.com`);
    },
    next: {
      [VALIDATION_PATTERNS.email]: "medical.tulizo.family.confirm",
    },
    defaultNext: "medical.tulizo.family.emailError",
  });

  menu.state("medical.tulizo.family.confirm", {
    run: () => {
      const { val, args: { sessionId } } = menu;
      const customer = getSession(sessionId);
      customer.email = val;

      let summary = `Please confirm:\nPlan: ${customer.policy}\nMain member: ${customer.fullName}\nDOB: ${customer.dob}\nID: ${customer.idNumber}\nEmail: ${customer.email}`;

      if (customer.dependants && customer.dependants.length > 0) {
        summary += `\nDependants: ${customer.dependants.length}`;
        customer.dependants.forEach((dep, idx) => {
          summary += `\n${idx + 1}. ${dep.fullName} (${dep.relationship})`;
        });
      }

      summary += `\n1. Confirm & Submit\n2. Edit Information\n0. Cancel`;

      menu.con(summary);
    },
    next: {
      1: "medical.tulizo.family.submit",
      2: "medical.tulizo.family",
      0: "medical.tulizo",
    },
    defaultNext: "medical.tulizo.family.confirm",
  });

  menu.state("medical.tulizo.family.submit", {
    run: async () => {
      const { args: { sessionId, phoneNumber } } = menu;
      const customer = session[sessionId];

      if (!customer.dob || !customer.email || !customer.fullName || !customer.idNumber) {
        menu.end(`Information incomplete. Please start over.`);
        delete session[sessionId];
        return;
      }

      try {
        const medicalCustomer = await prisma.medicalCustomer.create({
          data: {
            mobileNumber: phoneNumber,
            dob: customer.dob,
            fullName: customer.fullName,
            email: customer.email,
            idNumber: customer.idNumber,
            dependants: customer.dependants && customer.dependants.length > 0
              ? {
                  create: customer.dependants,
                }
              : undefined,
          },
        });

        console.log("Medical customer created successfully", medicalCustomer);

        if (medicalCustomer) {
          const totalCovered = 1 + (customer.dependants?.length || 0);
          menu.end(`✓ Family Application Submitted!\nCovering ${totalCovered} family members(s)\nQuote will be emailed to:\n${customer.email}\nYou will also receive SMS confirmation.\nThank you for choosing us.`);
        }
        else {
          menu.end(`We encountered an issue. Please try again or call 0700 100 200 for assistance.`);
        }
      }
      catch (error) {
        console.error("Database error:", error);
        menu.end(`System busy. Please try again in 2 minutes or call 0700 100 200 for assistance.`);
      }
    },
  });

  return menu;
}

export default tulizoFamily;

// menu.state("medical.tulizo.family.base", {
//     run: () => {
//         const { args: { sessionId } } = menu
//         session[sessionId] = { policy: "IP 1M, OP 500K, Mat 250K" };
//         menu.con(`Enter DOB: (dd/mm/yyyy)`)
//     },
//     next: {
//         [VALIDATION_PATTERNS.dob]: "family.base.fullName.process",
//     },
//     defaultNext: "invalidOption"
// })

// menu.state("family.max", {
//     run: () => {
//         const { args: { sessionId } } = menu
//         session[sessionId] = { policy: "IP 2M, OP 700K, Mat 550K" };
//         menu.con(`Enter DOB: (dd/mm/yyyy)`)
//     },
//     next: {
//         [VALIDATION_PATTERNS.dob]: "family.base.fullName.process",
//     },
//     defaultNext: "invalidOption"
// })

// menu.state("family.lite", {
//     run: () => {
//         const { args: { sessionId } } = menu
//         session[sessionId] = { policy: "IP 3M, OP 500K" };
//         menu.con(`Enter DOB: (dd/mm/yyyy)`)
//     },
//     next: {
//         [VALIDATION_PATTERNS.dob]: "family.base.fullName.process",
//     },
//     defaultNext: "invalidOption"
// })

// menu.state("family.base.dependant.dob.process", {
//     run: () => {
//         const { val, args: { sessionId } } = menu
//         session[sessionId].noOfDependants = parseInt(val);

//         menu.con(`Enter Dependant's Dob:`)
//     },
//     next: {
//         [VALIDATION_PATTERNS.dob]: "family.base.dependant.fullName.process"
//     },
//     defaultNext: "invalidOption"
// })

// menu.state("family.base.dependant.fullName.process", {
//     run: () => {
//         const { val, args: { sessionId } } = menu
//         session[sessionId].currentDependantData = {};
//         session[sessionId].currentDependantData.dob = val;
//         menu.con(`Enter Dependant's Full name:`)
//     },
//     next: {
//         [VALIDATION_PATTERNS.name]: "family.base.dependant.relationship.process",
//     },
//     defaultNext: "invalidOption"
// })

// menu.state("family.base.dependant.relationship.process", {
//     run: () => {
//         const { val, args: { sessionId } } = menu
//         session[sessionId].currentDependantData!.fullName = val;
//         menu.con(`Enter relationship with dependant:\n1. Spouse\n2. Child`)
//     },
//     next: {
//         [VALIDATION_PATTERNS.relationship]: "family.base.confirmComplete.process"
//     },
//     defaultNext: "invalidOption"
// })

// menu.state("family.base.confirmComplete.process", {
//     run: () => {
//         const { val, args: { sessionId } } = menu
//         session[sessionId].currentDependantData!.relationship = (val === "1" ? "SPOUSE" : "CHILD")
//         const dependantData = (session[sessionId].currentDependantData) as { dob: string; fullName: string; relationship: 'SPOUSE' | 'CHILD' }
//         session[sessionId].dependants = []
//         session[sessionId].dependants.push(dependantData)
//         menu.con(`Successfully registered dependant:\n1. Add other dependant\n2. Proceed to complete application`)
//     },
//     next: {
//         "1": "family.base.dependant.dob.process",
//         "2": "family.base.email.process"
//     }
// })

// menu.state("family.base.email.process", {
//     run: () => {
//         // const { val, args: { sessionId } } = menu
//         // session[sessionId].email = val;
//         menu.con(`Enter email address:`)
//     },
//     next: {
//         [VALIDATION_PATTERNS.email]: "family.process.end"
//     },
//     defaultNext: "invalidOption"
// })

// menu.state("family.process.end", {
//     run:  async () => {
//         const { val, args: { sessionId, phoneNumber } } = menu;
//         session[sessionId].email = val;

//         console.log(sessionId)
//         console.log(session[sessionId])

//         const { dob, email, fullName, idNumber, dependants } = session[sessionId]

//         if (dob && email && fullName && idNumber && dependants) {
//             const medicalCustomer = await prisma?.medicalCustomer.create({
//                 data: {
//                     mobileNumber: phoneNumber,
//                     dob,
//                     fullName,
//                     email: val,
//                     idNumber,
//                     dependants: {
//                         create: dependants
//                     }
//                 }
//             })
//             console.log(medicalCustomer)

//             if (medicalCustomer) {
//                 menu.end(`✓ Application successful!\nYour detailed quote will be sent to your email shortly.\nThank you for choosing us.`);
//             }
//         } else {
//             menu.end(`Error occured`)
//         }

//     },
// })
