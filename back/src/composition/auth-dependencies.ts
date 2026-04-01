import { appConfig } from '../config/app-config';
import {
  createVerificationCode,
  cryptoRandomId,
  isValidEmail,
  normalizeEmail,
} from '../lib/auth-helpers';
import { readAccessTokenFromRequest } from '../utils/access-token';
import {
  clearRefreshTokenCookie,
  readRefreshTokenFromRequest,
  setRefreshTokenCookie,
} from '../utils/cookies';
import { createJwtAuthService } from '../utils/jwt';
import { createVerificationMessageLogger } from '../services/verification-message.service';
import { refreshSessionsStore, usersStore } from '../store/in-memory-stores';

export function createAuthDependencies() {
  const refreshTokenTtlMs = appConfig.refreshTokenTtlSeconds * 1000;
  const jwtAuthService = createJwtAuthService({
    accessSecret: appConfig.accessTokenSecret,
    refreshSecret: appConfig.refreshTokenSecret,
    accessTokenTtlSeconds: appConfig.accessTokenTtlSeconds,
    refreshTokenTtlSeconds: appConfig.refreshTokenTtlSeconds,
  });
  const logVerificationMessage = createVerificationMessageLogger(appConfig.clientBaseUrl);

  return {
    usersStore,
    refreshSessionsStore,
    normalizeEmail,
    isValidEmail,
    createVerificationCode,
    cryptoRandomId,
    logVerificationMessage,
    accessTokenTtlMs: appConfig.accessTokenTtlSeconds * 1000,
    refreshTokenTtlMs,
    createAccessToken: jwtAuthService.createAccessToken,
    createRefreshToken: jwtAuthService.createRefreshToken,
    verifyAccessToken: jwtAuthService.verifyAccessToken,
    verifyRefreshToken: jwtAuthService.verifyRefreshToken,
    readAccessTokenFromRequest,
    readRefreshTokenFromRequest,
    clearRefreshTokenCookie,
    setRefreshTokenCookie: ({ token, res }: { token: string; res: Parameters<typeof setRefreshTokenCookie>[0]['res'] }) =>
      setRefreshTokenCookie({ token, res, maxAgeMs: refreshTokenTtlMs }),
  };
}
