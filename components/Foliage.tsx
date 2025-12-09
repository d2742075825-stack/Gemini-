import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { FOLIAGE_COUNT, COLORS, ANIMATION_SPEED } from '../constants';
import { getTreePosition, getScatterPosition } from '../utils/geometry';
import { useStore } from '../store';
import { TreeState } from '../types';

// Custom Shader for Emerald & Gold Glow Particles
const FoliageMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uProgress: { value: 1 }, // 0 = Scattered, 1 = Tree
    uColorBase: { value: COLORS.emeraldDeep },
    uColorHighlight: { value: COLORS.goldMetallic },
  },
  vertexShader: `
    uniform float uTime;
    uniform float uProgress;
    attribute vec3 aPositionScatter;
    attribute vec3 aPositionTree;
    attribute float aRandom;
    
    varying float vAlpha;
    varying vec2 vUv;

    // Cubic easing for smoother transition
    float easeInOutCubic(float x) {
      return x < 0.5 ? 4.0 * x * x * x : 1.0 - pow(-2.0 * x + 2.0, 3.0) / 2.0;
    }

    void main() {
      vUv = uv;
      
      float t = easeInOutCubic(uProgress);
      
      // Interpolate position
      vec3 pos = mix(aPositionScatter, aPositionTree, t);
      
      // Add subtle "breathing" / floating noise based on randomness
      float breathe = sin(uTime * 2.0 + aRandom * 10.0) * 0.1;
      pos += normalize(pos) * breathe * (1.0 - t * 0.5); // Breathe less when formed

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      
      // Size attenuation
      gl_PointSize = (8.0 * (1.0 + aRandom * 0.5)) * (20.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
      
      // Fade out slightly when scattered to reduce visual noise
      vAlpha = 0.6 + 0.4 * t; 
    }
  `,
  fragmentShader: `
    uniform vec3 uColorBase;
    uniform vec3 uColorHighlight;
    varying float vAlpha;

    void main() {
      // Circular particle
      vec2 coord = gl_PointCoord - vec2(0.5);
      float dist = length(coord);
      if (dist > 0.5) discard;

      // Glow calculation (center is bright)
      float strength = 1.0 - (dist * 2.0);
      strength = pow(strength, 2.0);

      // Mix Emerald center with Gold edge
      vec3 color = mix(uColorBase, uColorHighlight, strength * 0.3);
      
      // Super bright core
      if (strength > 0.8) {
        color = mix(color, vec3(1.0, 1.0, 0.8), (strength - 0.8) * 5.0);
      }

      gl_FragColor = vec4(color, vAlpha * strength);
    }
  `,
};

const Foliage: React.FC = () => {
  const meshRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const mode = useStore((state) => state.mode);

  // Generate Geometry Data once
  const { positionsTree, positionsScatter, randoms } = useMemo(() => {
    const pTree = new Float32Array(FOLIAGE_COUNT * 3);
    const pScatter = new Float32Array(FOLIAGE_COUNT * 3);
    const rnd = new Float32Array(FOLIAGE_COUNT);

    for (let i = 0; i < FOLIAGE_COUNT; i++) {
      const treePos = getTreePosition(i, FOLIAGE_COUNT);
      // Add some jitter to tree position so it's not a perfect line
      treePos[0] += (Math.random() - 0.5) * 0.5;
      treePos[1] += (Math.random() - 0.5) * 0.5;
      treePos[2] += (Math.random() - 0.5) * 0.5;

      const scatterPos = getScatterPosition();

      pTree.set(treePos, i * 3);
      pScatter.set(scatterPos, i * 3);
      rnd[i] = Math.random();
    }

    return { positionsTree: pTree, positionsScatter: pScatter, randoms: rnd };
  }, []);

  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      
      // Smooth Transition Logic
      const targetProgress = mode === TreeState.TREE_SHAPE ? 1 : 0;
      // Damping for smooth floaty transition
      materialRef.current.uniforms.uProgress.value = THREE.MathUtils.damp(
        materialRef.current.uniforms.uProgress.value,
        targetProgress,
        ANIMATION_SPEED,
        delta
      );
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position" // Placeholder, actual pos calculated in shader
          count={FOLIAGE_COUNT}
          array={positionsTree} // Initial state
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aPositionTree"
          count={FOLIAGE_COUNT}
          array={positionsTree}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aPositionScatter"
          count={FOLIAGE_COUNT}
          array={positionsScatter}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aRandom"
          count={FOLIAGE_COUNT}
          array={randoms}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        attach="material"
        args={[FoliageMaterial]}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default Foliage;