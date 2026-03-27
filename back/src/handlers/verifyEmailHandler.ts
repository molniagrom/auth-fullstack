import { RequestHandler } from 'express';

import { VerifyEmailHandlerDependencies } from '../types/handler-dependencies.types';
import { VerifyEmailBody } from '../types/auth.types';

export function createVerifyEmailHandler(
  dependencies: VerifyEmailHandlerDependencies,
): RequestHandler<Record<string, never>, unknown, VerifyEmailBody> {
  return (req, res) => {
    const email = dependencies.normalizeEmail(req.body.email);
    const code = req.body.code?.trim() ?? '';

    if (!dependencies.isValidEmail(email) || !code) {
      res.status(400).json({ message: 'Email and code are required.' });
      return;
    }

    const user = dependencies.usersStore.find((item) => item.email === email);

    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    if (user.isEmailVerified) {
      res.status(200).json({ message: 'Email is already verified.' });
      return;
    }

    if (user.verificationCode !== code) {
      res.status(400).json({ message: 'Verification code is invalid.' });
      return;
    }

    user.isEmailVerified = true;
    user.verificationCode = '';

    res.status(200).json({ message: 'Email verified successfully.' });
  };
}
