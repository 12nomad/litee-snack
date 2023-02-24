import { Request } from 'express';

export const getTokensFromRawHeaders = (req: Request) => {
  const mergedTokens = req.rawHeaders.filter((el) =>
    el.startsWith('access_token'),
  );
  const tokens = mergedTokens
    .toString()
    .split(';')
    .filter(
      (el) =>
        el.trim().startsWith('access_token') ||
        el.trim().startsWith('refresh_token'),
    );
  const at = tokens[0].trim().replace('access_token=', '');
  const rt = tokens[1].trim().replace('refresh_token=', '');
  return { at, rt };
};
