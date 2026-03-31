import { RequestHandler } from 'express';

import { LogoutHandlerDependencies } from '../types/handler-dependencies.types';

export function createLogoutHandler(
  dependencies: LogoutHandlerDependencies,
): RequestHandler<Record<string, never>, { message: string }> {
  return (req, res) => {
    try {
      const refreshToken = dependencies.readRefreshTokenFromRequest({
        headers: req.headers,
      });

      if (refreshToken) {
        const refreshPayload = dependencies.verifyRefreshToken(refreshToken);

        if (refreshPayload) {
          const session = dependencies.refreshSessionsStore.find(
            (item) => item.id === refreshPayload.sessionId,
          );

          if (session) {
            session.isRevoked = true;
          }
        }
      }

      dependencies.clearRefreshTokenCookie(res);

      res.status(200).json({ message: 'Logout successful.' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  };
}
