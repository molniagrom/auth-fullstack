export const appConfig = {
  port: Number(process.env.PORT) || 3001,
  clientBaseUrl: process.env.CLIENT_BASE_URL || 'http://localhost:5173',
  accessTokenTtlSeconds: Number(process.env.ACCESS_TOKEN_TTL_SECONDS) || 15,
  refreshTokenTtlSeconds: Number(process.env.REFRESH_TOKEN_TTL_SECONDS) || 60 * 60 * 24,
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET || 'dev-access-secret-change-me',
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || 'dev-refresh-secret-change-me',
};
