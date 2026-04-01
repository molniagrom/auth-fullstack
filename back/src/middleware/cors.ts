import { RequestHandler } from 'express';

export function createAllowedClientOrigins(primaryClientUrl: string) {
  const origins = new Set<string>([
    primaryClientUrl,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:4173',
    'http://127.0.0.1:4173',
  ]);

  return Array.from(origins);
}

export function createCorsMiddleware(allowedClientOrigins: string[]): RequestHandler {
  return (req, res, next) => {
    const requestOrigin = req.headers.origin;

    if (requestOrigin && allowedClientOrigins.includes(requestOrigin)) {
      res.header('Access-Control-Allow-Origin', requestOrigin);
      res.header('Vary', 'Origin');
      res.header('Access-Control-Allow-Credentials', 'true');
    }

    res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    next();
  };
}

export const optionsMiddleware: RequestHandler = (req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }

  next();
};
