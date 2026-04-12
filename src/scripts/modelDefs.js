import { Vector3 } from '@babylonjs/core';

/**
 * @typedef {'parent' | 'child' | ''} ModelRole
 *
 * @typedef {Object} GlbModelDef
 * @property {string} file
 * @property {string} name
 * @property {Vector3} position
 * @property {ModelRole} role
 * @property {number=} placementScale
 * @property {number=} placementYawOffsetSteps
 * @property {number=} placementYOffset
 */

/** @type {GlbModelDef[]} */
export const MODEL_LIST = [
  {
    file: "scaffold.glb",
    name: "scaffold",
    position: new Vector3(0, 0, 0),
    role: "parent",
  },

  
];
