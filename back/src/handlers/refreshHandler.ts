import { RequestHandler } from 'express';

import { LoginSuccessResponse } from '../types/auth.types';
import { RefreshHandlerDependencies } from '../types/handler-dependencies.types';

export function createRefreshHandler(
  dependencies: RefreshHandlerDependencies,
): RequestHandler<Record<string, never>, LoginSuccessResponse | { message: string }> {
  return (req, res) => {
    try {
      const refreshToken = dependencies.readRefreshTokenFromRequest({
        headers: req.headers,
      });

      if (!refreshToken) {
        res.status(401).json({ message: 'Refresh token cookie is missing.' });
        return;
      }

      const refreshPayload = dependencies.verifyRefreshToken(refreshToken);

      if (!refreshPayload) {
        dependencies.clearRefreshTokenCookie(res);
        res.status(401).json({ message: 'Refresh token is invalid or expired.' });
        return;
      }

      const previousSession = dependencies.refreshSessionsStore.find(
        (session) => session.id === refreshPayload.sessionId,
      );

      if (!previousSession || previousSession.userId !== refreshPayload.sub) {
        dependencies.clearRefreshTokenCookie(res);
        res.status(401).json({ message: 'Refresh session was not found.' });
        return;
      }

      if (previousSession.isRevoked || previousSession.expiresAt <= Date.now()) {
        dependencies.clearRefreshTokenCookie(res);
        res.status(401).json({ message: 'Refresh session is no longer active.' });
        return;
      }

      const user = dependencies.usersStore.find((item) => item.id === previousSession.userId);

      if (!user) {
        dependencies.clearRefreshTokenCookie(res);
        res.status(401).json({ message: 'User for refresh session was not found.' });
        return;
      }

      const newSession = {
        id: dependencies.cryptoRandomId(),
        userId: user.id,
        expiresAt: Date.now() + dependencies.refreshTokenTtlMs,
        isRevoked: false,
        replacedBySessionId: null,
      };

      previousSession.isRevoked = true;
      previousSession.replacedBySessionId = newSession.id;
      dependencies.refreshSessionsStore.push(newSession);

      const accessToken = dependencies.createAccessToken({
        userId: user.id,
        email: user.email,
      });
      const rotatedRefreshToken = dependencies.createRefreshToken({
        userId: user.id,
        sessionId: newSession.id,
      });

      dependencies.setRefreshTokenCookie({
        token: rotatedRefreshToken,
        res,
      });

      res.status(200).json({
        message: 'Tokens refreshed successfully.',
        accessToken,
        user: {
          id: user.id,
          email: user.email,
        },
      });
    } catch (error) {
      console.error('Refresh error:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  };
}
