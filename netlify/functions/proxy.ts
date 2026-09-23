import type { Handler } from "@netlify/functions";

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
        'Access-Control-Allow-Headers': '*'
      },
      body: ''
    };
  }

  const targetUrl = event.queryStringParameters?.url;
  if (!targetUrl) {
    return {
      statusCode: 400,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: 'Missing url parameter'
    };
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*'
      }
    });

    const contentType = response.headers.get('content-type') || 'application/vnd.apple.mpegurl';
    const isPlaylist = targetUrl.includes('.m3u8') || targetUrl.includes('.m3u') || contentType.includes('mpegurl');

    const headers: Record<string, string> = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': '*',
      'Content-Type': contentType
    };

    if (isPlaylist) {
      const text = await response.text();
      const baseUrl = targetUrl.substring(0, targetUrl.lastIndexOf('/') + 1);
      const targetOrigin = new URL(targetUrl).origin;
      const host = event.headers.host || '';
      const proto = event.headers['x-forwarded-proto'] || 'https';
      const proxyBase = proto + '://' + host + '/.netlify/functions/proxy?url=';

      const rewritten = text.split('\n').map(line => {
        const trimmed = line.trim();
        if (!trimmed) return line;
        if (trimmed.startsWith('#')) {
          if (trimmed.includes('URI="')) {
            return trimmed.replace(/URI="([^"]+)"/g, (_, u) => {
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

      return {
        statusCode: response.status,
        headers,
        body: rewritten
      };
    }

    const arrayBuffer = await response.arrayBuffer();
    return {
      statusCode: response.status,
      headers,
      body: Buffer.from(arrayBuffer).toString('base64'),
      isBase64Encoded: true
    };
  } catch (err: any) {
    return {
      statusCode: 502,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: 'Proxy error: ' + err.message
    };
  }
};
