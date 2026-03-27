import { RequestHandler } from 'express';

import { RegisterHandlerDependencies } from '../types/handler-dependencies.types';
import { RegisterBody, UserRecord } from '../types/auth.types';

export function createRegisterHandler(
  dependencies: RegisterHandlerDependencies,
): RequestHandler<Record<string, never>, unknown, RegisterBody> {
  return (req, res) => {
    const email = dependencies.normalizeEmail(req.body.email);
    const password = req.body.password?.trim() ?? '';

    if (!dependencies.isValidEmail(email)) {
      res.status(400).json({ message: 'Valid email is required.' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ message: 'Password must be at least 6 characters.' });
      return;
    }

    const existingUser = dependencies.usersStore.find((user) => user.email === email);

    if (existingUser) {
      res.status(409).json({ message: 'User with this email already exists.' });
      return;
    }

    const verificationCode = dependencies.createVerificationCode();

    const user: UserRecord = {
      id: dependencies.cryptoRandomId(),
      email,
      password,
      verificationCode,
      isEmailVerified: false,
    };

    dependencies.usersStore.push(user);

    dependencies.logVerificationMessage({
      email: user.email,
      code: user.verificationCode,
      reason: 'register',
    });

    res.status(201).json({
      message: 'Registration completed. Check backend console log for the verification link.',
    });
  };
}
