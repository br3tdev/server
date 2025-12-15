import UssdMenu from "ussd-menu-builder";


interface ExtendedUssdMenu extends UssdMenu {
  session: {
    set: (key: string, value: any, callback?: () => void) => void;
    get: (key: string, callback: (err: Error | null, value: any) => void) => void;
  };
}

let sessions: { [sessionId: string]: { [key: string]: any } } = {};

let menu = new UssdMenu() as ExtendedUssdMenu;

menu.sessionConfig({
    start: (sessionId: string, callback?: () => void) => {
        // initialize current session if it doesn't exist
        if(!(sessionId in sessions)) sessions[sessionId] = {};
        if (callback) callback();
    },
    end: (sessionId: string, callback?: () => void) => {
        // clear current session
        delete sessions[sessionId];
        if (callback) callback();
    },
    set: (sessionId: string, key: string, value: any, callback?: () => void) => {
        // store key-value pair in current session
        if (!sessions[sessionId]) {
            sessions[sessionId] = {};
        }
        sessions[sessionId][key] = value;
        if (callback) callback();
    },
    get: (sessionId: string, key: string, callback?: (err: Error | null, value: any) => void) => {
        // retrieve value by key in current session
        const session = sessions[sessionId] || {};
        let value = session[key];
        if (callback) callback(null, value);
    }
});

export default menu;