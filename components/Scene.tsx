import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, OrbitControls, ContactShadows } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { Island } from './Island';
import { Runner } from './Runner';
import { Mode, ToolType, SceneObject, CameraView, WeatherType } from '../types';

interface SceneProps {
  mode: Mode;
  cameraView: CameraView;
  activeTool: ToolType;
  objects: SceneObject[];
  onAddObject: (obj: SceneObject) => void;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  weather: WeatherType;
  snapToGrid: boolean;
}

// Rain Particle System
const Rain: React.FC = () => {
    const count = 1000;
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);
    
    // Initial random positions
    const particles = useMemo(() => {
        return new Array(count).fill(0).map(() => ({
            x: (Math.random() - 0.5) * 20,
            y: Math.random() * 20,
            z: (Math.random() - 0.5) * 20,
            speed: 0.5 + Math.random() * 0.5
        }));
    }, []);

    useFrame((state) => {
        if (!meshRef.current) return;
        
        particles.forEach((p, i) => {
            p.y -= p.speed;
            if (p.y < -2) {
                p.y = 15;
                p.x = (Math.random() - 0.5) * 20;
                p.z = (Math.random() - 0.5) * 20;
            }
            
            dummy.position.set(p.x, p.y, p.z);
            dummy.scale.set(0.02, 0.8, 0.02); // Thin, long streak
            dummy.updateMatrix();
            meshRef.current!.setMatrixAt(i, dummy.matrix);
        });
        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
            <cylinderGeometry args={[0.05, 0.05, 1, 3]} />
            <meshBasicMaterial color="#aaccff" transparent opacity={0.4} />
        </instancedMesh>
    );
};

// Controls camera movement based on mode and selected view
const CameraRig: React.FC<{ mode: Mode, cameraView: CameraView }> = ({ mode, cameraView }) => {
  const { camera, controls } = useThree();
  const vec = new THREE.Vector3();
  const targetVec = new THREE.Vector3();

  useFrame((state, delta) => {
    // Determine Target Position based on View
    if (cameraView === 'POV') {
        // Runner Head Position
        vec.set(0, 1.7, 0.2); 
        targetVec.set(0, 1.6, 5); // Look forward
    } else if (cameraView === 'TOP_DOWN') {
        vec.set(0, 12, 0);
        targetVec.set(0, 0, 0);
    } else if (cameraView === 'SIDE') {
        vec.set(8, 2, 0);
        targetVec.set(0, 1, 0);
    } else {
        // DEFAULT Logic
        if (mode === 'SIM') {
            vec.set(-2, 1.5, 4); // Low cinematic
            targetVec.set(0, 1, 0);
        } else {
            vec.set(0, 6, 8); // Design Overview
            targetVec.set(0, 0, 0);
        }
    }
    
    // Smooth transition
    const speed = 2.5 * delta;
    state.camera.position.lerp(vec, speed);
    
    // @ts-ignore
    if (controls?.current) {
        // @ts-ignore
        controls.current.target.lerp(targetVec, speed);
        // @ts-ignore
        controls.current.update();
    }
  });

  return null;
}

export const Scene: React.FC<SceneProps> = ({ mode, cameraView, activeTool, objects, onAddObject, selectedId, onSelect, weather, snapToGrid }) => {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 6, 8], fov: 40 }}
      gl={{ preserveDrawingBuffer: true, antialias: false }} // Antialias false is better for postprocessing
      dpr={[1, 2]} 
    >
      <color attach="background" args={weather === 'RAIN' ? ['#050510'] : ['#1a1a1a']} />
      <fog attach="fog" args={weather === 'RAIN' ? ['#050510', 2, 15] : ['#1a1a1a', 5, 25]} />

      <CameraRig mode={mode} cameraView={cameraView} />

      <ambientLight intensity={weather === 'RAIN' ? 0.1 : 0.2} />
      
      {/* Main Moon/Sun Light */}
      <directionalLight
        castShadow
        position={[5, 8, 5]}
        intensity={weather === 'RAIN' ? 0.8 : 1.5}
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001}
      >
        <orthographicCamera attach="shadow-camera" args={[-10, 10, 10, -10]} />
      </directionalLight>

      {/* Rim Light for drama */}
      <spotLight
        position={[-5, 5, -2]}
        intensity={weather === 'RAIN' ? 1 : 2}
        color="#4f66ff"
        angle={0.5}
        penumbra={1}
      />

      <ContactShadows 
        resolution={1024} 
        scale={30} 
        blur={2} 
        opacity={0.4} 
        far={10} 
        color="#000" 
      />

      <Environment preset="night" blur={0.6} />

      {weather === 'RAIN' && <Rain />}

      <group position={[0, -1, 0]}>
        <Island 
            mode={mode} 
            activeTool={activeTool} 
            objects={objects} 
            onAddObject={onAddObject} 
            selectedId={selectedId}
            onSelect={onSelect}
            snapToGrid={snapToGrid}
        />
        <Runner paused={mode === 'DESIGN'} />
      </group>

      <OrbitControls 
        makeDefault
        // Disable manual control in POV mode to prevent clipping
        enablePan={mode === 'DESIGN' && cameraView !== 'POV'}
        enableZoom={mode === 'DESIGN' && cameraView !== 'POV'}
        enableRotate={cameraView !== 'POV' && cameraView !== 'TOP_DOWN' && cameraView !== 'SIDE'}
        maxPolarAngle={Math.PI / 2 - 0.1}
        minDistance={3}
        maxDistance={15}
        enableDamping={true}
        dampingFactor={0.05}
      />

      {/* Post Processing for the "Invisible/Neon" look */}
      <EffectComposer disableNormalPass>
        <Bloom 
            luminanceThreshold={1} // Only very bright things glow
            mipmapBlur 
            intensity={1.5} 
            radius={0.6}
        />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>
    </Canvas>
  );
};