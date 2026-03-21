const { isTokenExpired, getSecurityAction } = require('../../scripts/auth.js');

describe('Security Guard Logic', () => {

    test('isTokenExpired should return true if the token does not exist', () => {

        expect(isTokenExpired(null, 1000)).toBe(true);

    });

    test('isTokenExpired should return true if the token has expired', () => {

        // Simulate JWT payload: { "exp": 1000 }
        const fakeToken = "header." + btoa(JSON.stringify({ exp: 1000 })) + ".signature";

        const now = 2000; // Current time is greater than exp

        expect(isTokenExpired(fakeToken, now)).toBe(true);

    });

    test('getSecurityAction should request Logout if expired and on Dashboard', () => {

        // isExpired = true, isAuthPage = false 
        const action = getSecurityAction(true, false); 

        expect(action).toBe('LOGOUT_AND_REDIRECT'); 
    }); 

    test('getSecurityAction should request Dashboard if the token is valid and is on the Login page', () => { 

        // isExpired = false, isAuthPage = true 
        const action = getSecurityAction(false, true); 
        
        expect(action).toBe('GO_TO_DASHBOARD'); 
    });
});