/**
 * Loads a GLB file that was split into chunks with SHA-256 integrity checks.
 * Fetches the manifest, downloads all chunks in parallel, verifies each
 * chunk's SHA-256, reassembles the original buffer, and verifies the whole
 * file's SHA-256 before returning it.
 */

async function sha256(buffer) {
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function loadChunkedGLB(manifestUrl, onProgress) {
  const manifestRes = await fetch(manifestUrl);
  if (!manifestRes.ok) {
    throw new Error(`Failed to fetch manifest: ${manifestRes.status}`);
  }
  const manifest = await manifestRes.json();

  const baseUrl = manifestUrl.substring(0, manifestUrl.lastIndexOf("/") + 1);
  let loadedBytes = 0;

  const chunkBuffers = await Promise.all(
    manifest.chunks.map(async (chunk) => {
      const url = baseUrl + chunk.file;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Failed to fetch chunk ${chunk.file}: ${res.status}`);
      }
      const buf = await res.arrayBuffer();

      if (buf.byteLength !== chunk.size) {
        throw new Error(
          `Chunk ${chunk.file} size mismatch: expected ${chunk.size}, got ${buf.byteLength}`,
        );
      }

      const hash = await sha256(buf);
      if (hash !== chunk.sha256) {
        throw new Error(
          `Chunk ${chunk.file} SHA-256 mismatch:\n  expected: ${chunk.sha256}\n  got:      ${hash}`,
        );
      }

      loadedBytes += buf.byteLength;
      if (onProgress) {
        onProgress({
          loaded: loadedBytes,
          total: manifest.totalSize,
          percent: ((loadedBytes / manifest.totalSize) * 100).toFixed(1),
          chunkIndex: chunk.index,
          totalChunks: manifest.totalChunks,
        });
      }

      return { index: chunk.index, buffer: buf };
    }),
  );

  chunkBuffers.sort((a, b) => a.index - b.index);

  const assembled = new Uint8Array(manifest.totalSize);
  let offset = 0;
  for (const { buffer } of chunkBuffers) {
    assembled.set(new Uint8Array(buffer), offset);
    offset += buffer.byteLength;
  }

  const fileHash = await sha256(assembled.buffer);
  if (fileHash !== manifest.sha256) {
    throw new Error(
      `Assembled file SHA-256 mismatch:\n  expected: ${manifest.sha256}\n  got:      ${fileHash}`,
    );
  }

  console.log(
    `GLB loaded: ${manifest.fileName} (${manifest.totalSize} bytes, ${manifest.totalChunks} chunks, SHA-256 verified)`,
  );

  return assembled.buffer;
}
