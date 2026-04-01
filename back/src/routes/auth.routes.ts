import { Express } from 'express';

import { createLoginHandler } from '../handlers/loginHandler';
import { createLogoutHandler } from '../handlers/logoutHandler';
import { createMeHandler } from '../handlers/meHandler';
import { createRegisterHandler } from '../handlers/registerHandler';
import { createRefreshHandler } from '../handlers/refreshHandler';
import { createResendCodeHandler } from '../handlers/resendCodeHandler';
import { createVerifyEmailHandler } from '../handlers/verifyEmailHandler';
import { createAuthDependencies } from '../composition/auth-dependencies';

export function registerAuthRoutes(app: Express) {
  const authDependencies = createAuthDependencies();

  app.post('/auth/register', createRegisterHandler(authDependencies));

  app.post('/auth/verify-email', createVerifyEmailHandler(authDependencies));

  app.post('/auth/resend-code', createResendCodeHandler(authDependencies));

  app.post('/auth/login', createLoginHandler(authDependencies));

  app.post('/auth/refresh', createRefreshHandler(authDependencies));

  app.get('/auth/me', createMeHandler(authDependencies));

  app.post('/auth/logout', createLogoutHandler(authDependencies));
}
