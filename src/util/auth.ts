const moment = require("moment");
const attemptsBeforeLockout = 5;
const loginSpanInMinutes = 15;
const lockoutInMinutes = 5;

export const authUtil = {
    loginAttempt: (login) => {
        login.lastLoginAttempt = Date.now();
        login.loginAttempts++;

        //see if this is out of span of counting, if so re-set count
        const mattempt = moment(login.lastLoginAttempt);
        if (mattempt.add(loginSpanInMinutes, 'minutes') <= moment){
            login.loginAttempts = 1;
        }

        login.save();
    },
    loginSuccess: (login) => {
        login.lockedOut = false;
        login.loginAttempts = 0;
        login.lastLogin = Date.now();
        login.save();
    },
    calculateLockout: (login) => {
        if (login.lockedOut && login.lastLockout) {
            const mlockout = moment(login.lastLockout);
            //see if they've served their time
            if (mlockout.add(lockoutInMinutes, 'minutes') <= moment()) {
                login.lockedOut = false;
                login.loginAttempts = 0;
                login.save();
                return;
            }
        }

        if (attemptsBeforeLockout < login.loginAttempts){
            login.lastLockout = Date.now();
            login.lockedOut = true;
            login.save();
        }
    }
};
