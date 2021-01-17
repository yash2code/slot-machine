export const errorCodes = {
    lowBalance: {
        code: 'LOW_BALANCE',
        msg: 'Your balance too low'
    },
};

export class GameError extends Error {
    constructor(code, message) {
        super();
        this.message = message || errorCodes[code];
        this.code = code;
    }
}
