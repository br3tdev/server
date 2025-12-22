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
}

// Upgrade to Redis or other Storage Driver
let session: { [sessionId: string]: CustomerKyc } = {};

// Helper functions
const getSession = (sessionId: string): CustomerKyc => {
  if (!session[sessionId]) {
    session[sessionId] = {};
  }
  return session[sessionId];
};

const updateSession = (sessionId: string, updates: Partial<CustomerKyc>) => {
  session[sessionId] = { ...getSession(sessionId), ...updates };
};

const createFamilyPlan = (menu: UssdMenu, planPrefix: string, policy: string) => {
  // Plan selection (already in main flow)
  // Primary member DOB
  menu.state(`${planPrefix}.dob`, {
    run: () => {
      const { args: { sessionId } } = menu;
      updateSession(sessionId, { policy });
      menu.con(`Enter DOB: (dd/mm/yyyy)`);
    },
    next: {
      [VALIDATION_PATTERNS.dob]: `${planPrefix}.fullName`,
    },
    defaultNext: "invalidOption"
  });

  // Primary member full name
  menu.state(`${planPrefix}.fullName`, {
    run: () => {
      const { val, args: { sessionId } } = menu;
      updateSession(sessionId, { dob: val });
      menu.con(`Enter Full Name:`);
    },
    next: {
      [VALIDATION_PATTERNS.name]: `${planPrefix}.idNumber`,
    },
    defaultNext: "invalidOption"
  });

  // Primary member ID
  menu.state(`${planPrefix}.idNumber`, {
    run: () => {
      const { val, args: { sessionId } } = menu;
      updateSession(sessionId, { fullName: val });
      menu.con(`Enter ID Number:`);
    },
    next: {
      [VALIDATION_PATTERNS.idNumber]: `${planPrefix}.dependantsCount`,
    },
    defaultNext: "invalidOption"
  });

  // Number of dependants
  menu.state(`${planPrefix}.dependantsCount`, {
    run: () => {
      const { val, args: { sessionId } } = menu;
      updateSession(sessionId, { idNumber: val });
      menu.con(`Enter number of dependants (max 5):`);
    },
    next: {
      "1": `${planPrefix}.dependant1.dob`,
      "2": `${planPrefix}.dependant1.dob`,
      "3": `${planPrefix}.dependant1.dob`,
      "4": `${planPrefix}.dependant1.dob`,
      "5": `${planPrefix}.dependant1.dob`
    },
    defaultNext: "invalidOption"
  });

  // Create states for up to 5 dependants
  for (let i = 1; i <= 5; i++) {
    const nextDependant = i < 5 ? i + 1 : null;
    
    // Dependant DOB
    menu.state(`${planPrefix}.dependant${i}.dob`, {
      run: () => {
        const { val, args: { sessionId } } = menu;
        // Store number of dependants from previous input
        if (!getSession(sessionId).noOfDependants) {
          updateSession(sessionId, { noOfDependants: i === 1 ? 1 : getSession(sessionId).noOfDependants });
        }
        menu.con(`Enter Dependant ${i}'s DOB: (dd/mm/yyyy)`);
      },
      next: {
        [VALIDATION_PATTERNS.dob]: `${planPrefix}.dependant${i}.fullName`
      },
      defaultNext: "invalidOption"
    });

    // Dependant full name
    menu.state(`${planPrefix}.dependant${i}.fullName`, {
      run: () => {
        const { val, args: { sessionId } } = menu;
        // Store DOB from previous state
        const currentSession = getSession(sessionId);
        const dependants = currentSession.dependants || [];
        dependants[i-1] = { ...(dependants[i-1] || {}), dob: val };
        updateSession(sessionId, { dependants });
        
        menu.con(`Enter Dependant ${i}'s Full Name:`);
      },
      next: {
        [VALIDATION_PATTERNS.name]: `${planPrefix}.dependant${i}.relationship`
      },
      defaultNext: "invalidOption"
    });

    // Dependant relationship
    menu.state(`${planPrefix}.dependant${i}.relationship`, {
      run: () => {
        const { val, args: { sessionId } } = menu;
        // Store full name from previous state
        const currentSession = getSession(sessionId);
        const dependants = currentSession.dependants || [];
        dependants[i-1] = { ...(dependants[i-1] || {}), fullName: val };
        updateSession(sessionId, { dependants });
        
        menu.con(`Enter relationship with dependant ${i}:\n1. Spouse\n2. Child`);
      },
      next: {
        "1": nextDependant ? `${planPrefix}.dependant${nextDependant}.dob` : `${planPrefix}.email`,
        "2": nextDependant ? `${planPrefix}.dependant${nextDependant}.dob` : `${planPrefix}.email`
      },
      defaultNext: "invalidOption"
    });

    // Additional state to save relationship choice
    menu.state(`${planPrefix}.dependant${i}.save`, {
      run: () => {
        const { val, args: { sessionId } } = menu;
        const relationship = val === "1" ? "SPOUSE" : "CHILD";
        
        // Store relationship
        const currentSession = getSession(sessionId);
        const dependants = currentSession.dependants || [];
        dependants[i-1] = { ...(dependants[i-1] || {}), relationship };
        updateSession(sessionId, { dependants });
        
        // Check if we need to collect more dependants
        const noOfDependants = currentSession.noOfDependants || 0;
        
        if (i < noOfDependants) {
          // Go to next dependant
          menu.go(`${planPrefix}.dependant${i + 1}.dob`);
        } else {
          // All dependants collected, go to email
          menu.go(`${planPrefix}.email`);
        }
      }
    });
    
    // Update relationship state to go to save state
    menu.state(`${planPrefix}.dependant${i}.relationship`, {
      run: () => {
        const { val, args: { sessionId } } = menu;
        // Store full name from previous state
        const currentSession = getSession(sessionId);
        const dependants = currentSession.dependants || [];
        dependants[i-1] = { ...(dependants[i-1] || {}), fullName: val };
        updateSession(sessionId, { dependants });
        
        menu.con(`Enter relationship with dependant ${i}:\n1. Spouse\n2. Child`);
      },
      next: {
        "1": `${planPrefix}.dependant${i}.save`,
        "2": `${planPrefix}.dependant${i}.save`
      },
      defaultNext: "invalidOption"
    });
  }

  // Email
  menu.state(`${planPrefix}.email`, {
    run: () => {
      menu.con(`Enter email address:`);
    },
    next: {
      [VALIDATION_PATTERNS.email]: `${planPrefix}.process.end`
    },
    defaultNext: "invalidOption"
  });

  // Process end
  menu.state(`${planPrefix}.process.end`, {
    run: async () => {
      const { val, args: { sessionId, phoneNumber } } = menu;
      const currentSession = getSession(sessionId);
      
      // Update email
      updateSession(sessionId, { email: val });
      
      console.log("Complete session data:", currentSession);
      
      const { dob, email, fullName, idNumber, policy, dependants } = currentSession;

      if (dob && email && fullName && idNumber && dependants) {
        try {
          const medicalCustomer = await prisma?.medicalCustomer.create({
            data: {
              mobileNumber: phoneNumber as string,
              dob,
              fullName,
              email,
              idNumber,
              dependants: {
                create: dependants
              }
            }
          });
          
          console.log("Saved to database:", medicalCustomer);

          if (medicalCustomer) {
            // Clear session after successful save
            delete session[sessionId];
            menu.end(`✓ Application successful!\nYour detailed quote will be sent to your email shortly.\nThank you for choosing us.`);
          } else {
            menu.end(`Error: Failed to save application. Please try again.`);
          }
        } catch (error) {
          console.error("Database error:", error);
          menu.end(`An error occurred while saving. Please try again.`);
        }
      } else {
        console.log("Missing data:", { dob, email, fullName, idNumber, dependants });
        menu.end(`Error: Incomplete information. Please start over.`);
      }
    }
  });
};

const tulizoFamily = (menu: UssdMenu) => {
  // Family plan selection
  menu.state("tulizo.family", {
    run: async () => {
      menu.con(`Select preferred benefits:\n1. IP 1M, OP 500K, Mat 250K\n2. IP 2M, OP 700K, Mat 550K\n3. IP 3M, OP 500K\n99. Go back`);
    },
    next: {
      "1": "family.base.dob",
      "2": "family.max.dob",
      "3": "family.lite.dob",
      "99": "medical.tulizo"
    },
    defaultNext: "invalidOption"
  });

  // Create all family plans with pre-defined states
  createFamilyPlan(menu, "family.base", "IP 1M, OP 500K, Mat 250K");
  createFamilyPlan(menu, "family.max", "IP 2M, OP 700K, Mat 550K");
  createFamilyPlan(menu, "family.lite", "IP 3M, OP 500K");

  // Invalid option state
  menu.state("invalidOption", {
    run: () => {
      menu.con("Invalid option. Please try again.");
      menu.go("tulizo.family");
    }
  });

  return menu;
}

export default tulizoFamily;