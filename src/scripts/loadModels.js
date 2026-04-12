import { SceneLoader, Vector3 } from '@babylonjs/core';
import '@babylonjs/loaders/glTF';

// Types are expressed via JSDoc in this file to keep it plain JavaScript.

const defaultAssetsBaseUrl = () => `public/assets/`;

let _streamingConfigured = false;

/**
 * One-time setup: enable incremental streaming for the GLTF loader.
 *
 * - `useRangeRequests = true`  — the loader fetches GLB in byte-range chunks
 *   instead of downloading the entire file before parsing. The server must
 *   support HTTP `Range` headers (Vite dev server does; most static hosts do).
 *
 * - `GLTFFileLoader.IncrementalLoading` stays `true` (default) — meshes and
 *   shaders are handed to the scene as soon as they are decoded; the success
 *   callback fires once the *structure* is ready, while textures continue
 *   streaming in the background.
 */
function ensureStreamingConfig() {
  if (_streamingConfigured) return;
  _streamingConfigured = true;

  SceneLoader.OnPluginActivatedObservable.add((loader) => {
    if (loader.name === 'gltf') {
      // Some Babylon loader builds expose `useRangeRequests`; set it if present.
      if ('useRangeRequests' in loader) loader.useRangeRequests = true;
    }
  });
}

/**
 * @typedef {import('@babylonjs/core').Scene} Scene
 * @typedef {import('@babylonjs/core').AbstractMesh} AbstractMesh
 * @typedef {import('./modelDefs').GlbModelDef} GlbModelDef
 *
 * @typedef {Object} LoadModelsOptions
 * @property {Scene} scene
 * @property {GlbModelDef[]=} modelList
 * @property {string=} assetsBaseUrl
 * @property {(index:number, total:number, root:AbstractMesh)=>void=} onModelLoaded
 */

/**
 * @param {LoadModelsOptions} args
 * @returns {Promise<AbstractMesh[]>}
 */
export async function loadModelsToScene({
  scene,
  modelList,
  assetsBaseUrl = defaultAssetsBaseUrl(),
  onModelLoaded,
}) {
  ensureStreamingConfig();

  /** @type {AbstractMesh[]} */
  const models = [];
  const list = modelList ?? [];
  for (let i = 0; i < list.length; i += 1) {
    const { file, name, position } = list[i];
    try {
      const result = await SceneLoader.ImportMeshAsync('', assetsBaseUrl, file, scene);
      // Prevent auto-visible meshes before user explicitly places/selects a model.
      result.meshes.forEach((m) => m.setEnabled(false));
      const root = result.meshes[0];
      if (!root) continue;
      root.name = name;

      const { min } = root.getHierarchyBoundingVectors(true);
      root.position = new Vector3(position.x, position.y - min.y, position.z);
      models.push(root);
      onModelLoaded?.(i, list.length, root);
    } catch {
      // Swallow load errors — scene stays alive.
    }
  }
  return models;
}

// -----------------------------------------------------------------------------
// Single-model loading (STRICTLY one-at-a-time + cache)
// -----------------------------------------------------------------------------

/** @type {Map<string, Promise<AbstractMesh | null>>} */
const _cache = new Map();
/** @type {Promise<void>} */
let _serialQueue = Promise.resolve();

/**
 * Load a single model on demand.
 *
 * Guarantees:
 * - Each `modelDef.file` is fetched at most once (cached Promise).
 * - Only ONE GLB import runs at a time across the entire app (serial queue),
 *   which helps avoid RAM/VRAM spikes with large assets.
 */
export function loadSingleModel({
  scene,
  modelDef,
  assetsBaseUrl = defaultAssetsBaseUrl(),
}) {
  const key = modelDef.file;
  const cached = _cache.get(key);
  if (cached) return cached;

  ensureStreamingConfig();

  /** @type {Promise<AbstractMesh | null>} */
  const promise = (async () => {
    // Chain onto a global serial queue so only one load runs at a time.
    const start = _serialQueue;
    /** @type {() => void} */
    let release;
    _serialQueue = new Promise((resolve) => {
      release = resolve;
    });

    await start;
    try {
      const result = await SceneLoader.ImportMeshAsync('', assetsBaseUrl, modelDef.file, scene);
      const root = result.meshes[0];
      if (!root) return null;

      root.name = modelDef.name;
      const { min } = root.getHierarchyBoundingVectors(true);
      root.position = new Vector3(
        modelDef.position.x,
        modelDef.position.y - min.y,
        modelDef.position.z,
      );

      return root;
    } catch {
      _cache.delete(key);
      return null;
    } finally {
      release();
    }
  })();

  _cache.set(key, promise);
  return promise;
}

/** Evict a cached model (e.g. after disposing its meshes). */
export function evictModelCache(file) {
  _cache.delete(file);
}
