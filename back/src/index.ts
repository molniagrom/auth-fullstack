import express, { Request, Response } from 'express';

type UserRecord = {
  id: string;
  email: string;
  password: string;
  verificationCode: string;
  isEmailVerified: boolean;
};

type RegisterBody = {
  email?: string;
  password?: string;
};

type VerifyEmailBody = {
  email?: string;
  code?: string;
};

type ResendCodeBody = {
  email?: string;
};

const app = express();
const port = Number(process.env.PORT) || 3001;
const clientBaseUrl = process.env.CLIENT_BASE_URL || 'http://localhost:5173';
const usersStore: UserRecord[] = [];

app.use(express.json());

app.use((_, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.options('*', (_req, res) => {
  res.sendStatus(204);
});

app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    message: 'Auth training backend is running',
    availableRoutes: [
      'POST /auth/register',
      'POST /auth/verify-email',
      'POST /auth/resend-code',
    ],
  });
});

app.post(
  '/auth/register',
  (req: Request<Record<string, never>, unknown, RegisterBody>, res: Response) => {
    const email = normalizeEmail(req.body.email);
    const password = req.body.password?.trim() ?? '';

    if (!isValidEmail(email)) {
      res.status(400).json({ message: 'Valid email is required.' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ message: 'Password must be at least 6 characters.' });
      return;
    }

    const existingUser = usersStore.find((user) => user.email === email);

    if (existingUser) {
      res.status(409).json({ message: 'User with this email already exists.' });
      return;
    }

    const verificationCode = createVerificationCode();

    const user: UserRecord = {
      id: cryptoRandomId(),
      email,
      password,
      verificationCode,
      isEmailVerified: false,
    };

    usersStore.push(user);

    logVerificationMessage({
      email: user.email,
      code: user.verificationCode,
      reason: 'register',
    });

    res.status(201).json({
      message: 'Registration completed. Check backend console log for the verification link.',
    });
  },
);

app.post(
  '/auth/verify-email',
  (req: Request<Record<string, never>, unknown, VerifyEmailBody>, res: Response) => {
    const email = normalizeEmail(req.body.email);
    const code = req.body.code?.trim() ?? '';

    if (!isValidEmail(email) || !code) {
      res.status(400).json({ message: 'Email and code are required.' });
      return;
    }

    const user = usersStore.find((item) => item.email === email);

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
  },
);

app.post(
  '/auth/resend-code',
  (req: Request<Record<string, never>, unknown, ResendCodeBody>, res: Response) => {
    const email = normalizeEmail(req.body.email);

    if (!isValidEmail(email)) {
      res.status(400).json({ message: 'Valid email is required.' });
      return;
    }

    const user = usersStore.find((item) => item.email === email);

    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    if (user.isEmailVerified) {
      res.status(400).json({ message: 'Email is already verified.' });
      return;
    }

    user.verificationCode = createVerificationCode();

    logVerificationMessage({
      email: user.email,
      code: user.verificationCode,
      reason: 'resend-code',
    });

    res.status(200).json({
      message: 'New verification code was logged to the backend console.',
    });
  },
);

app.listen(port, () => {
  console.log(`Auth backend started on port ${port}`);
});

function normalizeEmail(email: string | undefined) {
  return email?.trim().toLowerCase() ?? '';
}

function isValidEmail(email: string) {
  return /\S+@\S+\.\S+/.test(email);
}

function createVerificationCode() {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

function cryptoRandomId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function buildVerificationLink(email: string, code: string) {
  const url = new URL('/verify-email', clientBaseUrl);
  url.searchParams.set('email', email);
  url.searchParams.set('code', code);
  return url.toString();
}

function logVerificationMessage(params: {
  email: string;
  code: string;
  reason: 'register' | 'resend-code';
}) {
  const verificationLink = buildVerificationLink(params.email, params.code);

  console.log('');
  console.log('=== SMTP Mock Adapter ===');
  console.log(`Reason: ${params.reason}`);
  console.log(`To: ${params.email}`);
  console.log(`Code: ${params.code}`);
  console.log(`Verification link: ${verificationLink}`);
  console.log('=========================');
  console.log('');
}
