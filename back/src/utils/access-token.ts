export function readAccessTokenFromRequest(params: {
  headers: Record<string, string | string[] | undefined>;
}) {
  const authorizationHeader = params.headers.authorization;
  const rawAuthorizationHeader = Array.isArray(authorizationHeader)
    ? authorizationHeader[0]
    : authorizationHeader;

  if (!rawAuthorizationHeader?.startsWith('Bearer ')) {
    return '';
  }

  return rawAuthorizationHeader.slice('Bearer '.length).trim();
}
