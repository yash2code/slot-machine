import EventEmitter from 'events';

class GameEmitter extends EventEmitter {
    constructor() {
        super();
        this.logging = false;
    }

    log(msg, args) {
        if (!this.logging) {
            return undefined;
        }
        console.log(`[GameEmitter]: ${msg} `, args);
    }

    enableLogging() {
        this.logging = true;
    }

    disableLogging() {
        this.logging = false;
    }

    on(type, listener) {
        this.log('[ON]', {type});
        return super.on(type, listener);
    }

    emit(type, ...args) {
        this.log('[EMIT]', {type, args});
        return super.emit(type, ...args);
    }

    off(type, listener) {
        this.log('[OFF]', {type});
        return super.off(type, listener);
    }
}

const ee = new GameEmitter();

export const eventTypes = {
    gameStart: 'GAME:START',
    gameEnd: 'GAME:END',
    spinEnd: 'GAME:SPIN:END',
    win: 'GAME:WIN',
    loose: 'GAME:LOOSE',
    result: 'GAME:RESULT',
    setFixedMode: 'GAME:MODE:FIXED',
    setRandomMode: 'GAME:MODE:RANDOM',

    requestFixedValues: 'REQUEST:FIXED_VALUES',
    responseFixedValues: 'RESPONSE:FIXED_VALUES'
};

export default ee;
