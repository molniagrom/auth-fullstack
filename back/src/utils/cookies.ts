import { Response } from 'express';

const refreshTokenCookieName = 'refreshToken';

function parseCookieHeader(cookieHeader: string | undefined) {
  if (!cookieHeader) {
    return {};
  }

  return cookieHeader.split(';').reduce<Record<string, string>>((acc, part) => {
    const [rawName, ...rawValueParts] = part.trim().split('=');

    if (!rawName) {
      return acc;
    }

    acc[rawName] = decodeURIComponent(rawValueParts.join('='));
    return acc;
  }, {});
}

export function readRefreshTokenFromRequest(params: {
  headers: Record<string, string | string[] | undefined>;
}) {
  const cookieHeader = params.headers.cookie;
  const rawCookieHeader = Array.isArray(cookieHeader) ? cookieHeader.join(';') : cookieHeader;
  const cookies = parseCookieHeader(rawCookieHeader);

  return cookies[refreshTokenCookieName] ?? '';
}

export function setRefreshTokenCookie(params: { token: string; res: Response; maxAgeMs: number }) {
  params.res.cookie(refreshTokenCookieName, params.token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    path: '/auth',
    maxAge: params.maxAgeMs,
  });
}

export function clearRefreshTokenCookie(res: Response) {
  res.clearCookie(refreshTokenCookieName, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    path: '/auth',
  });
}
