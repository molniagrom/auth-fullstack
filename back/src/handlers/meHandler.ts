import { RequestHandler } from 'express';

import { AuthenticatedUserResponse } from '../types/auth.types';
import { MeHandlerDependencies } from '../types/handler-dependencies.types';

export function createMeHandler(
  dependencies: MeHandlerDependencies,
): RequestHandler<Record<string, never>, AuthenticatedUserResponse | { message: string }> {
  return (req, res) => {
    try {
      const accessToken = dependencies.readAccessTokenFromRequest({
        headers: req.headers,
      });

      if (!accessToken) {
        res.status(401).json({ message: 'Access token is missing.' });
        return;
      }

      const accessPayload = dependencies.verifyAccessToken(accessToken);

      if (!accessPayload) {
        res.status(401).json({ message: 'Access token is invalid or expired.' });
        return;
      }

      const user = dependencies.usersStore.find((item) => item.id === accessPayload.sub);

      if (!user) {
        res.status(401).json({ message: 'User for access token was not found.' });
        return;
      }

      res.status(200).json({
        id: user.id,
        email: user.email,
      });
    } catch (error) {
      console.error('Current user error:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  };
}
