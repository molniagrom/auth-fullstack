import { UserRecord, VerificationMessageParams } from './auth.types';

export type SharedHandlerDependencies = {
  usersStore: UserRecord[];
  normalizeEmail: (email: string | undefined) => string;
  isValidEmail: (email: string) => boolean;
};

export type RegisterHandlerDependencies = SharedHandlerDependencies & {
  createVerificationCode: () => string;
  cryptoRandomId: () => string;
  logVerificationMessage: (params: VerificationMessageParams) => void;
};

export type VerifyEmailHandlerDependencies = SharedHandlerDependencies;

export type ResendCodeHandlerDependencies = SharedHandlerDependencies & {
  createVerificationCode: () => string;
  logVerificationMessage: (params: VerificationMessageParams) => void;
};

export type LoginHandlerDependencies = SharedHandlerDependencies;
