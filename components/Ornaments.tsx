import React, { useMemo, useRef, useState, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getTreePosition, getScatterPosition } from '../utils/geometry';
import { useStore } from '../store';
import { TreeState, OrnamentProps } from '../types';
import { COLORS, ANIMATION_SPEED, TREE_RADIUS, TREE_HEIGHT } from '../constants';

const tempObject = new THREE.Object3D();
const tempVec3 = new THREE.Vector3();
const tempVec3Target = new THREE.Vector3();
const tempVec3Current = new THREE.Vector3();

const Ornaments: React.FC<OrnamentProps> = ({ count, type }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const mode = useStore((state) => state.mode);
  
  // Create static data for two states
  const data = useMemo(() => {
    const treePositions: THREE.Vector3[] = [];
    const scatterPositions: THREE.Vector3[] = [];
    const rotationSpeeds: THREE.Vector3[] = [];
    
    for (let i = 0; i < count; i++) {
      // Tree Position: Place ornaments slightly outside the foliage
      const tPosRaw = getTreePosition(i, count); 
      // Adjust distribution for ornaments to be more sparse and on surface
      // Use a randomized index to scramble the phyllotaxis for variety
      const scrambledIndex = (i * 13) % count;
      const tPosGeo = getTreePosition(scrambledIndex, count);
      
      // Push slightly outward based on radius at that height
      const yNorm = (tPosGeo[1] + TREE_HEIGHT/2) / TREE_HEIGHT;
      const r = TREE_RADIUS * (1 - yNorm) + 0.5; // +0.5 offset to sit on tips
      const angle = Math.atan2(tPosGeo[2], tPosGeo[0]);
      
      const tVec = new THREE.Vector3(
        Math.cos(angle) * r,
        tPosGeo[1],
        Math.sin(angle) * r
      );
      
      treePositions.push(tVec);
      scatterPositions.push(new THREE.Vector3(...getScatterPosition()));
      
      rotationSpeeds.push(new THREE.Vector3(
        Math.random() * 0.02, 
        Math.random() * 0.02, 
        Math.random() * 0.02
      ));
    }
    return { treePositions, scatterPositions, rotationSpeeds };
  }, [count]);

  // Track current animation state per instance is too heavy for React state
  // We use a ref to track interpolation factor 0..1
  const progress = useRef(1); // Start at Tree

  useLayoutEffect(() => {
    // Initial placement
    if (meshRef.current) {
      for (let i = 0; i < count; i++) {
        tempObject.position.copy(data.treePositions[i]);
        tempObject.updateMatrix();
        meshRef.current.setMatrixAt(i, tempObject.matrix);
      }
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [count, data]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const target = mode === TreeState.TREE_SHAPE ? 1 : 0;
    // Damp global progress
    progress.current = THREE.MathUtils.damp(progress.current, target, ANIMATION_SPEED, delta);

    for (let i = 0; i < count; i++) {
      // Get positions
      const start = data.scatterPositions[i];
      const end = data.treePositions[i];

      // Current Lerp
      tempVec3Current.lerpVectors(start, end, progress.current);

      // Add rotation (spin)
      tempObject.rotation.x += data.rotationSpeeds[i].x;
      tempObject.rotation.y += data.rotationSpeeds[i].y;
      tempObject.rotation.z += data.rotationSpeeds[i].z;

      // Add "Float" noise when scattered
      if (progress.current < 0.9) {
        const time = state.clock.elapsedTime;
        const noise = Math.sin(time + i) * (1 - progress.current) * 0.5;
        tempVec3Current.y += noise;
      }

      tempObject.position.copy(tempVec3Current);
      
      // Scale logic: Make them pop in/out slightly or pulse
      const scaleBase = type === 'box' ? 0.4 : 0.25;
      const scalePulse = 1.0 + Math.sin(state.clock.elapsedTime * 2 + i) * 0.1;
      tempObject.scale.setScalar(scaleBase * scalePulse);

      tempObject.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObject.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  // Material setup based on type
  const materialProps = type === 'box' 
    ? { 
        color: COLORS.emeraldLight, 
        roughness: 0.2, 
        metalness: 0.1,
        emissive: COLORS.emeraldDeep,
        emissiveIntensity: 0.2
      } 
    : { 
        color: COLORS.goldMetallic, 
        roughness: 0.05, 
        metalness: 0.9,
        emissive: COLORS.goldWarm,
        emissiveIntensity: 0.1
      };

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} castShadow receiveShadow>
      {type === 'box' ? <boxGeometry /> : <sphereGeometry args={[1, 16, 16]} />}
      <meshStandardMaterial {...materialProps} />
    </instancedMesh>
  );
};

export default Ornaments;