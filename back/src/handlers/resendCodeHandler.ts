import { RequestHandler } from 'express';

import { ResendCodeHandlerDependencies } from '../types/handler-dependencies.types';
import { ResendCodeBody } from '../types/auth.types';

export function createResendCodeHandler(
  dependencies: ResendCodeHandlerDependencies,
): RequestHandler<Record<string, never>, unknown, ResendCodeBody> {
  return (req, res) => {
    const email = dependencies.normalizeEmail(req.body.email);

    if (!dependencies.isValidEmail(email)) {
      res.status(400).json({ message: 'Valid email is required.' });
      return;
    }

    const user = dependencies.usersStore.find((item) => item.email === email);

    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    if (user.isEmailVerified) {
      res.status(400).json({ message: 'Email is already verified.' });
      return;
    }

    user.verificationCode = dependencies.createVerificationCode();

    dependencies.logVerificationMessage({
      email: user.email,
      code: user.verificationCode,
      reason: 'resend-code',
    });

    res.status(200).json({
      message: 'New verification code was logged to the backend console.',
    });
  };
}
