import * as facebookPassport from './facebook.passport';
import * as googlePassport from './google.passport';
import * as localPassport from './local.passport';

export const passportConfig={facebookPassport: facebookPassport, googlePassport: googlePassport, 
    localPassport: localPassport,isAuthenticated: localPassport.isAuthenticated,isAuthorized: localPassport.isAuthorized };