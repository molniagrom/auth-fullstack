import { VerificationMessageParams } from '../types/auth.types';

export function createVerificationMessageLogger(clientBaseUrl: string) {
  return function logVerificationMessage(params: VerificationMessageParams) {
    const verificationLink = buildVerificationLink(clientBaseUrl, params.email, params.code);

    console.log('');
    console.log('=== SMTP Mock Adapter ===');
    console.log(`Reason: ${params.reason}`);
    console.log(`To: ${params.email}`);
    console.log(`Code: ${params.code}`);
    console.log(`Verification link: ${verificationLink}`);
    console.log('=========================');
    console.log('');
  };
}

function buildVerificationLink(clientBaseUrl: string, email: string, code: string) {
  const url = new URL('/verify-email', clientBaseUrl);
  url.searchParams.set('email', email);
  url.searchParams.set('code', code);
  return url.toString();
}
