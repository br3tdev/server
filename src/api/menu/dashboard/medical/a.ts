import UssdMenu from "ussd-menu-builder"

// Common validation patterns
const VALIDATION_PATTERNS = {
  dob: "*\\d{2}/\\d{2}/\\d{4}",
  name: "*[A-Za-z][A-Za-z\\s\\-'\\\\.]+",
  idNumber: "*\\d{8}",
  email: "*[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}",
  digit: "*\\d",
  relationship: "*\\d{1}"
} as const;

// Common state handlers
const commonStates = {
  dobState: (menu: UssdMenu, nextState: string, message = "Enter DOB: (dd/mm/yyyy)") => {
    menu.state(nextState, {
      run: () => {
        menu.con(message);
      },
      next: {
        [VALIDATION_PATTERNS.dob]: `${nextState}.fullName`
      },
      defaultNext: "invalidOption"
    });
  },

  fullNameState: (menu: UssdMenu, nextState: string, message = "Enter Full Name:") => {
    menu.state(`${nextState}.fullName`, {
      run: () => {
        menu.con(message);
      },
      next: {
        [VALIDATION_PATTERNS.name]: `${nextState}.idNumber`
      },
      defaultNext: "invalidOption"
    });
  },

  idNumberState: (menu: UssdMenu, nextState: string, message = "Enter ID Number:") => {
    menu.state(`${nextState}.idNumber`, {
      run: () => {
        menu.con(message);
      },
      next: {
        [VALIDATION_PATTERNS.idNumber]: `${nextState}.email`
      },
      defaultNext: "invalidOption"
    });
  },

  emailState: (menu: UssdMenu, nextState: string, message = "Enter email address:") => {
    menu.state(`${nextState}.email`, {
      run: () => {
        menu.con(message);
      },
      next: {
        [VALIDATION_PATTERNS.email]: "process.end"
      },
      defaultNext: "invalidOption"
    });
  }
};

// Dependant management
class DependantManager {
  private menu: UssdMenu;
  private currentDependant: number = 1;
  private totalDependants: number = 0;
  private basePlan: string = "";

  constructor(menu: UssdMenu) {
    this.menu = menu;
  }

  setTotalDependants(total: number) {
    this.totalDependants = total;
    this.currentDependant = 1;
  }

  setBasePlan(plan: string) {
    this.basePlan = plan;
  }

  hasMoreDependants(): boolean {
    return this.currentDependant <= this.totalDependants;
  }

  nextDependant() {
    this.currentDependant++;
  }

  getCurrentDependant(): number {
    return this.currentDependant;
  }

  createDependantStates() {
    // Dependant DOB state
    this.menu.state(`${this.basePlan}.dependant.dob`, {
      run: () => {
        //Error here
        menu.con(`Enter Dependant ${this.currentDependant}'s DOB: (dd/mm/yyyy)`);
      },
      next: {
        [VALIDATION_PATTERNS.dob]: `${this.basePlan}.dependant.fullName`
      },
      defaultNext: "invalidOption"
    });

    // Dependant Full Name state
    this.menu.state(`${this.basePlan}.dependant.fullName`, {
      run: () => {
        // Error here
        menu.con(`Enter Dependant ${this.currentDependant}'s Full Name:`);
      },
      next: {
        [VALIDATION_PATTERNS.name]: `${this.basePlan}.dependant.relationship`
      },
      defaultNext: "invalidOption"
    });

    // Dependant Relationship state
    this.menu.state(`${this.basePlan}.dependant.relationship`, {
      run: () => {
        // Error here
        menu.con(`Enter relationship with dependant ${this.currentDependant}:\n1. Spouse\n2. Child`);
      },
      next: {
        [VALIDATION_PATTERNS.relationship]: `${this.basePlan}.dependant.next`
      },
      defaultNext: "invalidOption"
    });

    // Next dependant or proceed
    this.menu.state(`${this.basePlan}.dependant.next`, {
      run: () => {
        if (this.hasMoreDependants()) {
          this.nextDependant();
          this.menu.go(`${this.basePlan}.dependant.dob`);
        } else {
          this.menu.go(`${this.basePlan}.email`);
        }
      }
    });
  }
}

const tulizo = (menu: UssdMenu) => {
  const dependantManager = new DependantManager(menu);

  // Helper function to create plan selection
  const createPlanSelection = (
    stateName: string,
    options: string[],
    nextStates: Record<string, string>,
    goBackOption = true
  ) => {
    menu.state(stateName, {
      run: () => {
        let message = options.join('\n');
        if (goBackOption) {
          message += '\n99. Go back';
        }
        menu.con(message);
      },
      next: nextStates,
      defaultNext: "invalidOption"
    });
  };

  // Helper function to create a complete individual plan flow
  const createIndividualPlanFlow = (
    planName: string,
    planType: string,
    benefits: string
  ) => {
    const baseState = `${planName}.${planType}`;
    
    menu.state(baseState, {
      run: () => {
        menu.con(`You selected: ${benefits}\nEnter DOB: (dd/mm/yyyy)`);
      },
      next: {
        [VALIDATION_PATTERNS.dob]: `${baseState}.fullName`
      },
      defaultNext: "invalidOption"
    });

    commonStates.fullNameState(menu, baseState);
    commonStates.idNumberState(menu, baseState);
    commonStates.emailState(menu, baseState);
  };

  // Helper function to create a family plan flow
  const createFamilyPlanFlow = (
    planName: string,
    planType: string,
    benefits: string
  ) => {
    const baseState = `${planName}.${planType}`;
    
    menu.state(baseState, {
      run: () => {
        menu.con(`You selected: ${benefits}\nEnter DOB: (dd/mm/yyyy)`);
      },
      next: {
        [VALIDATION_PATTERNS.dob]: `${baseState}.fullName`
      },
      defaultNext: "invalidOption"
    });

    commonStates.fullNameState(menu, baseState, "Enter Primary Member Full Name:");

    // ID Number state for family plan
    menu.state(`${baseState}.idNumber`, {
      run: () => {
        menu.con("Enter Primary Member ID Number:");
      },
      next: {
        [VALIDATION_PATTERNS.idNumber]: `${baseState}.dependantsCount`
      },
      defaultNext: "invalidOption"
    });

    // Number of dependants state
    menu.state(`${baseState}.dependantsCount`, {
      run: () => {
        menu.con("Enter number of dependants:");
      },
      next: {
        [VALIDATION_PATTERNS.digit]: `${baseState}.processDependants`
      },
      defaultNext: "invalidOption"
    });

    // Process dependants state
    menu.state(`${baseState}.processDependants`, {
      run: () => {
        const dependantsCount = parseInt(menu.val);
        dependantManager.setTotalDependants(dependantsCount);
        dependantManager.setBasePlan(baseState);
        
        if (dependantsCount > 0) {
          dependantManager.createDependantStates();
          menu.go(`${baseState}.dependant.dob`);
        } else {
          menu.go(`${baseState}.email`);
        }
      }
    });

    // Email state for family plan
    commonStates.emailState(menu, baseState);
  };

  // Main menu
  menu.state("medical.tulizo", {
    run: () => {
      menu.con("Medical cover for:\n1. Self\n2. Family");
    },
    next: {
      "1": "tulizo.self",
      "2": "tulizo.family"
    },
    defaultNext: "invalidOption"
  });

  // Individual plan selection
  createPlanSelection(
    "tulizo.self",
    [
      "1. IP 1M, OP 500K, Mat 250K",
      "2. IP 2M, OP 700K, Mat 550K"
    ],
    {
      "1": "tulizo.self.base",
      "2": "tulizo.self.max"
    }
  );

  // Create individual plans
  createIndividualPlanFlow(
    "tulizo.self",
    "base",
    "IP 1M, OP 500K, Mat 250K"
  );

  createIndividualPlanFlow(
    "tulizo.self",
    "max",
    "IP 2M, OP 700K, Mat 550K"
  );

  // Family plan selection
  createPlanSelection(
    "tulizo.family",
    [
      "1. IP 1M, OP 500K, Mat 250K",
      "2. IP 2M, OP 700K, Mat 550K",
      "3. IP 3M, OP 500K"
    ],
    {
      "1": "family.base",
      "2": "family.max",
      "3": "family.lite"
    }
  );

  // Create family plans
  createFamilyPlanFlow(
    "family",
    "base",
    "IP 1M, OP 500K, Mat 250K"
  );

  createFamilyPlanFlow(
    "family",
    "max",
    "IP 2M, OP 700K, Mat 550K"
  );

  createFamilyPlanFlow(
    "family",
    "lite",
    "IP 3M, OP 500K"
  );

  // End state
  menu.state("process.end", {
    run: () => {
      menu.end("✓ Application successful!\nYour detailed quote will be sent to your email shortly.\nThank you for choosing us.");
    },
  });

  return menu;
}

export default tulizo;