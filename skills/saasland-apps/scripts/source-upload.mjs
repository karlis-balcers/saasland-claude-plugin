import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';

function describe(bytes) {
  if (bytes.length < 4 || bytes.length > 25 * 1024 * 1024) throw Error('ZIP must be at most 25 MiB.');
  if (bytes.readUInt32LE(0) !== 0x04034b50) throw Error('Expected a source ZIP file.');
  return { size: bytes.length, checksum: createHash('sha256').update(bytes).digest('base64') };
}
export async function describeSource(path) { return describe(await readFile(path)); }
export async function uploadSource(path, result, send = fetch) {
  const upload = result.structuredContent || result;
  const bytes = await readFile(path), info = describe(bytes);
  const url = new URL(upload.url);
  if (url.protocol !== 'https:' || url.username || url.password || url.port || url.hash ||
      !/^[a-z0-9.-]+\.s3(?:[.-][a-z0-9-]+)?\.amazonaws\.com$/.test(url.hostname) ||
      !url.searchParams.has('X-Amz-Signature')) throw Error('Expected the signed saasland.io source-upload URL.');
  if (upload.headers?.['Content-Type'] !== 'application/zip' ||
      upload.headers?.['x-amz-checksum-sha256'] !== info.checksum ||
      Object.keys(upload.headers).length !== 2) throw Error('ZIP or upload headers changed; prepare a new upload.');
  if (!/^[a-f0-9-]{36}$/.test(upload.uploadId)) throw Error('Missing uploadId.');
  const response = await send(url, { method: 'PUT', headers: upload.headers, body: bytes, redirect: 'error', signal: AbortSignal.timeout(120000) });
  if (!response.ok) throw Error(`Source upload failed (HTTP ${response.status}); no deployment was requested.`);
  return { uploaded: true, uploadId: upload.uploadId, size: info.size };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const [, , action, path] = process.argv;
    if (!path || !['describe', 'put'].includes(action)) throw Error('Usage: node source-upload.mjs describe|put <zip>; put reads upload result JSON from stdin.');
    let result;
    if (action === 'describe') result = await describeSource(path);
    else {
      const chunks = []; let size = 0;
      for await (const chunk of process.stdin) {
        size += chunk.length;
        if (size > 32768) throw Error('Upload response is too large.');
        chunks.push(chunk);
      }
      result = await uploadSource(path, JSON.parse(Buffer.concat(chunks).toString('utf8')));
    }
    console.log(JSON.stringify(result));
  } catch {
    // Library errors can contain a signed URL. Never echo their details.
    console.error('Could not describe or upload the ZIP. Check the file and upload authorization. No deployment was requested.');
    process.exitCode = 1;
  }
}
