export default async (request: Request) => {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
        'Access-Control-Allow-Headers': '*'
      }
    });
  }

  const url = new URL(request.url);
  const targetUrl = url.searchParams.get('url');

  if (!targetUrl) {
    return new Response('Missing target url parameter (?url=...)', {
      status: 400,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  }

  try {
    const upstream = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*'
      }
    });

    const headers = new Headers();
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    headers.set('Access-Control-Allow-Headers', '*');
    headers.set('Access-Control-Expose-Headers', '*');
    headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');

    const upstreamContentType = upstream.headers.get('content-type') || '';
    headers.set('Content-Type', upstreamContentType || 'application/vnd.apple.mpegurl');

    const isPlaylist = targetUrl.includes('.m3u8') || targetUrl.includes('.m3u') ||
      upstreamContentType.includes('mpegurl') || upstreamContentType.includes('application/x-mpegurl');

    if (isPlaylist) {
      const text = await upstream.text();
      const baseUrl = targetUrl.substring(0, targetUrl.lastIndexOf('/') + 1);
      const targetOrigin = new URL(targetUrl).origin;
      const proxyBase = url.origin + '/api/proxy?url=';

      const rewritten = text.split('\n').map(line => {
        const trimmed = line.trim();
        if (!trimmed) return line;

        if (trimmed.startsWith('#')) {
          if (trimmed.includes('URI="')) {
            return trimmed.replace(/URI="([^"]+)"/g, (_m, u) => {
              const full = u.startsWith('http://') || u.startsWith('https://')
                ? u
                : (u.startsWith('/') ? targetOrigin + u : baseUrl + u);
              return 'URI="' + proxyBase + encodeURIComponent(full) + '"';
            });
          }
          return line;
        }

        const fullChunkUrl = trimmed.startsWith('http://') || trimmed.startsWith('https://')
          ? trimmed
          : (trimmed.startsWith('/') ? targetOrigin + trimmed : baseUrl + trimmed);

        return proxyBase + encodeURIComponent(fullChunkUrl);
      }).join('\n');

      return new Response(rewritten, {
        status: upstream.status,
        headers
      });
    }

    return new Response(upstream.body, {
      status: upstream.status,
      headers
    });
  } catch (err: any) {
    return new Response('Stream Proxy Error: ' + err.message, {
      status: 502,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  }
};

export const config = { path: "/api/proxy" };
