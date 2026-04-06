import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { createHash } from "crypto";
import { basename, join, resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const CHUNK_SIZE = 2 * 1024 * 1024; // 2 MB per chunk

function splitFile(inputPath, outputDir) {
  const fileName = basename(inputPath, ".glb");
  const chunkDir = join(outputDir, `${fileName}.chunks`);

  if (!existsSync(chunkDir)) {
    mkdirSync(chunkDir, { recursive: true });
  }

  const buffer = readFileSync(inputPath);
  const totalSize = buffer.byteLength;
  const totalChunks = Math.ceil(totalSize / CHUNK_SIZE);

  const fileSha256 = createHash("sha256").update(buffer).digest("hex");

  const manifest = {
    version: 1,
    fileName: `${fileName}.glb`,
    totalSize,
    chunkSize: CHUNK_SIZE,
    totalChunks,
    sha256: fileSha256,
    chunks: [],
  };

  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, totalSize);
    const chunk = buffer.subarray(start, end);

    const chunkHash = createHash("sha256").update(chunk).digest("hex");
    const chunkFileName = `${i.toString().padStart(4, "0")}.bin`;

    writeFileSync(join(chunkDir, chunkFileName), chunk);

    manifest.chunks.push({
      index: i,
      file: chunkFileName,
      offset: start,
      size: chunk.byteLength,
      sha256: chunkHash,
    });
  }

  writeFileSync(
    join(chunkDir, "manifest.json"),
    JSON.stringify(manifest, null, 2),
  );

  console.log(`Split "${basename(inputPath)}" -> ${totalChunks} chunks`);
  console.log(`  Total size : ${totalSize} bytes`);
  console.log(`  Chunk size : ${CHUNK_SIZE} bytes`);
  console.log(`  SHA-256    : ${fileSha256}`);
  console.log(`  Output     : ${chunkDir}`);

  return manifest;
}

const args = process.argv.slice(2);
if (args.length === 0) {
  const publicDir = resolve(__dirname, "..", "public");
  const defaultInput = join(publicDir, "scaffold.glb");
  const defaultOutput = join(publicDir, "assets");

  if (!existsSync(defaultInput)) {
    console.error(`File not found: ${defaultInput}`);
    console.error("Usage: node scripts/split-glb.mjs <input.glb> [outputDir]");
    process.exit(1);
  }

  splitFile(defaultInput, defaultOutput);
} else {
  const inputPath = resolve(args[0]);
  const outputDir = args[1]
    ? resolve(args[1])
    : resolve(__dirname, "..", "public", "assets");
  splitFile(inputPath, outputDir);
}
