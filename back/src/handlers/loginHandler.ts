import bcrypt from 'bcrypt';
import { RequestHandler } from 'express';

import { LoginHandlerDependencies } from '../types/handler-dependencies.types';
import { LoginBody, LoginSuccessResponse } from '../types/auth.types';

export function createLoginHandler(
  dependencies: LoginHandlerDependencies,
): RequestHandler<Record<string, never>, LoginSuccessResponse | { message: string }, LoginBody> {
  return async (req, res) => {
    try {
      const email = dependencies.normalizeEmail(req.body.email);
      const password = req.body.password?.trim() ?? '';

      if (!dependencies.isValidEmail(email) || !password) {
        res.status(400).json({ message: 'Email and password are required.' });
        return;
      }

      const user = dependencies.usersStore.find((item) => item.email === email);

      if (!user) {
        res.status(401).json({ message: 'Invalid email or password.' });
        return;
      }

      const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);

      if (!isPasswordCorrect) {
        res.status(401).json({ message: 'Invalid email or password.' });
        return;
      }

      if (!user.isEmailVerified) {
        res.status(403).json({ message: 'Email is not verified.' });
        return;
      }

      const refreshSession = {
        id: dependencies.cryptoRandomId(),
        userId: user.id,
        expiresAt: Date.now() + dependencies.refreshTokenTtlMs,
        isRevoked: false,
        replacedBySessionId: null,
      };

      dependencies.refreshSessionsStore.push(refreshSession);

      const accessToken = dependencies.createAccessToken({
        userId: user.id,
        email: user.email,
      });
      const refreshToken = dependencies.createRefreshToken({
        userId: user.id,
        sessionId: refreshSession.id,
      });

      dependencies.setRefreshTokenCookie({
        token: refreshToken,
        res,
      });

      res.status(200).json({
        message: 'Login successful.',
        accessToken,
        user: {
          id: user.id,
          email: user.email,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  };
}
