import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import Foliage from './Foliage';
import Ornaments from './Ornaments';
import { ORNAMENT_BOX_COUNT, ORNAMENT_SPHERE_COUNT, COLORS } from '../constants';

const Scene: React.FC = () => {
  return (
    <div className="w-full h-screen relative bg-gradient-to-b from-black via-[#000905] to-[#00140e]">
      <Canvas
        dpr={[1, 2]} // Handle high DPI
        gl={{ 
          antialias: false, 
          toneMapping: THREE.ACESFilmicToneMapping, 
          toneMappingExposure: 1.2 
        }}
        shadows
      >
        <PerspectiveCamera makeDefault position={[0, 2, 25]} fov={35} />
        <OrbitControls 
          enablePan={false} 
          minPolarAngle={Math.PI / 4} 
          maxPolarAngle={Math.PI / 1.8}
          minDistance={10}
          maxDistance={40}
          autoRotate
          autoRotateSpeed={0.5}
        />

        {/* Lighting Strategy for "Cinematic Luxury" */}
        <ambientLight intensity={0.2} color="#001a14" />
        
        {/* Main Key Light (Warm Gold) */}
        <spotLight 
          position={[10, 20, 10]} 
          angle={0.3} 
          penumbra={1} 
          intensity={800} 
          color={COLORS.goldWarm} 
          castShadow 
          shadow-bias={-0.0001}
        />

        {/* Rim Light (Cool/White) */}
        <pointLight position={[-10, 5, -10]} intensity={200} color="#cceeff" />

        {/* Fill Light (Emerald) */}
        <pointLight position={[0, -10, 5]} intensity={100} color={COLORS.emeraldLight} />

        {/* Environment Reflections */}
        <Environment preset="city" environmentIntensity={0.5} />
        
        {/* Background Stars */}
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

        {/* 3D Content */}
        <group position={[0, -4, 0]}>
            <Foliage />
            <Ornaments count={ORNAMENT_BOX_COUNT} type="box" />
            <Ornaments count={ORNAMENT_SPHERE_COUNT} type="sphere" />
        </group>

        {/* Post Processing for Glow */}
        <EffectComposer disableNormalPass>
            <Bloom 
                luminanceThreshold={0.6} 
                mipmapBlur 
                intensity={1.5} 
                radius={0.6}
            />
            <Noise opacity={0.05} blendFunction={BlendFunction.OVERLAY} />
            <Vignette eskil={false} offset={0.1} darkness={0.7} />
        </EffectComposer>
      </Canvas>
    </div>
  );
};

export default Scene;