let cachedHandler = null;

export default async function handler(req, res) {
  if (!cachedHandler) {
    const mod = await import('../dist/donideli/server/server.mjs');
    cachedHandler = mod.reqHandler ?? mod.default;
  }

  return cachedHandler(req, res);
}
