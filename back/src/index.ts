import express from 'express';

import { appConfig } from './config/app-config';
import { createAllowedClientOrigins, createCorsMiddleware, optionsMiddleware } from './middleware/cors';
import { registerAuthRoutes } from './routes/auth.routes';

const app = express();
const allowedClientOrigins = createAllowedClientOrigins(appConfig.clientBaseUrl);

app.use(express.json());
app.use(createCorsMiddleware(allowedClientOrigins));
app.use(optionsMiddleware);

app.get('/', (_req, res) => {
  res.status(200).json({
    message: 'Auth training backend is running',
    availableRoutes: [
      'POST /auth/register',
      'POST /auth/login',
      'POST /auth/verify-email',
      'POST /auth/resend-code',
      'POST /auth/refresh',
      'GET /auth/me',
      'POST /auth/logout',
    ],
    tokenLifetimes: {
      accessTokenSeconds: appConfig.accessTokenTtlSeconds,
      refreshTokenSeconds: appConfig.refreshTokenTtlSeconds,
    },
  });
});

registerAuthRoutes(app);

app.listen(appConfig.port, () => {
  console.log(`Auth backend started on port ${appConfig.port}`);
});
