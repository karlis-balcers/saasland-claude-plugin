import { writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';

// Save an app's source ZIP from a get_app_source result. Only the signed
// saasland.io source-bucket link is accepted, redirects are refused and the
// SHA-256 must match. The link is never printed.
export async function downloadSource(path, result, send = fetch) {
  const source = result.structuredContent || result;
  const url = new URL(source.downloadUrl);
  if (url.protocol !== 'https:' || url.username || url.password || url.port || url.hash ||
      !/^[a-z0-9.-]+\.s3(?:[.-][a-z0-9-]+)?\.amazonaws\.com$/.test(url.hostname) ||
      !url.searchParams.has('X-Amz-Signature')) throw Error('Expected the signed saasland.io source-download URL.');
  if (!/^[A-Za-z0-9+/]{43}=$/.test(source.checksum || '')) throw Error('Missing checksum.');
  const response = await send(url, { redirect: 'error', signal: AbortSignal.timeout(120000) });
  if (!response.ok) throw Error(`Source download failed (HTTP ${response.status}).`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length > 25 * 1024 * 1024 || bytes.readUInt32LE(0) !== 0x04034b50) throw Error('The download is not a source ZIP.');
  if (createHash('sha256').update(bytes).digest('base64') !== source.checksum) throw Error('The download does not match its checksum.');
  await writeFile(path, bytes, { flag: 'wx' });
  return { saved: path, size: bytes.length, version: source.version?.id };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const [, , path] = process.argv;
    if (!path) throw Error('Usage: node source-download.mjs <new-zip-path>; reads the get_app_source result JSON from stdin.');
    const chunks = []; let size = 0;
    for await (const chunk of process.stdin) {
      size += chunk.length;
      if (size > 32768) throw Error('Download response is too large.');
      chunks.push(chunk);
    }
    console.log(JSON.stringify(await downloadSource(path, JSON.parse(Buffer.concat(chunks).toString('utf8')))));
  } catch {
    // Library errors can contain a signed URL. Never echo their details.
    console.error('Could not download the source ZIP. Check the target path (it must not exist yet) and ask get_app_source for a fresh link.');
    process.exitCode = 1;
  }
}
