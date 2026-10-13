import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';

function describe(bytes) {
  if (bytes.length < 8 || bytes.length > 2 * 1024 * 1024) throw Error('Artwork must be at most 2 MiB.');
  const contentType = bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) ? 'image/png'
    : bytes[0] === 255 && bytes[1] === 216 ? 'image/jpeg' : null;
  if (!contentType) throw Error('Expected JPEG or PNG artwork.');
  return { size: bytes.length, checksum: createHash('sha256').update(bytes).digest('base64'), contentType };
}
export async function describeArtwork(path) { return describe(await readFile(path)); }
export async function uploadArtwork(path, result, send = fetch) {
  const upload = result.structuredContent || result;
  const bytes = await readFile(path), info = describe(bytes), url = new URL(upload.url);
  if (url.protocol !== 'https:' || url.username || url.password || url.port || url.hash ||
      !/^[a-z0-9.-]+\.s3(?:[.-][a-z0-9-]+)?\.amazonaws\.com$/.test(url.hostname) ||
      !url.searchParams.has('X-Amz-Signature')) throw Error('Expected the signed artwork-upload URL.');
  if (upload.headers?.['Content-Type'] !== info.contentType || upload.headers?.['x-amz-checksum-sha256'] !== info.checksum ||
      Object.keys(upload.headers).length !== 2) throw Error('Image or headers changed; prepare another upload.');
  if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(upload.uploadId)) throw Error('Missing uploadId.');
  const response = await send(url, { method: 'PUT', headers: upload.headers, body: bytes, redirect: 'error', signal: AbortSignal.timeout(120000) });
  if (!response.ok) throw Error(`Artwork upload failed (HTTP ${response.status}); no draft was completed.`);
  return { uploaded: true, uploadId: upload.uploadId, size: info.size };
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const [, , action, path] = process.argv;
    if (!path || !['describe', 'put'].includes(action)) throw Error('Use describe|put <image>; put reads the upload response from stdin.');
    let result;
    if (action === 'describe') result = await describeArtwork(path);
    else {
      const chunks = []; let size = 0;
      for await (const chunk of process.stdin) { size += chunk.length; if (size > 32768) throw Error('Upload response too large.'); chunks.push(chunk); }
      result = await uploadArtwork(path, JSON.parse(Buffer.concat(chunks).toString('utf8')));
    }
    console.log(JSON.stringify(result));
  } catch {
    // Fetch errors may contain the signed URL; never echo them.
    console.error('Could not describe or upload the artwork. Check the image and authorization. No draft was completed.');
    process.exitCode = 1;
  }
}
