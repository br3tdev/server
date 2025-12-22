import UssdMenu from "ussd-menu-builder";
import { VALIDATION_PATTERNS } from "./validation-patterns";

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

const formatPlanOptions = (options: {
    code: number;
    name: string;
    medicalProductCode: number;
}[]): string => {
  let message = options.map(opt => opt.name).join("\n");

  return message;
}

export { commonStates, formatPlanOptions };