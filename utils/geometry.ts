import * as THREE from 'three';
import { TREE_HEIGHT, TREE_RADIUS, SCATTER_RADIUS } from '../constants';

// Phyllotaxis Spiral for Tree Shape
export const getTreePosition = (index: number, total: number): [number, number, number] => {
  const y = (index / total) * TREE_HEIGHT - TREE_HEIGHT / 2; // -Height/2 to Height/2
  const normalizedY = (y + TREE_HEIGHT / 2) / TREE_HEIGHT; // 0 to 1
  
  // Radius decreases as we go up (Cone)
  const radius = TREE_RADIUS * (1 - normalizedY);
  
  // Golden Angle spiral
  const phi = index * 2.39996; // Golden angle in radians
  const theta = phi;

  const x = radius * Math.cos(theta);
  const z = radius * Math.sin(theta);

  return [x, y, z];
};

// Random Point in Sphere for Scattered Shape
export const getScatterPosition = (): [number, number, number] => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = Math.cbrt(Math.random()) * SCATTER_RADIUS; // Cube root for uniform distribution

  const x = r * Math.sin(phi) * Math.cos(theta);
  const y = r * Math.sin(phi) * Math.sin(theta);
  const z = r * Math.cos(phi);

  return [x, y, z];
};