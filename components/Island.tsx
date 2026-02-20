import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Group, InstancedMesh, Object3D, CatmullRomCurve3, Vector3, Mesh } from 'three';
import { useFrame, ThreeEvent, useThree } from '@react-three/fiber';
import { Float, Tube } from '@react-three/drei';
import { IslandProps, SceneObject, ToolType } from '../types';

interface ObjectProps {
    position: [number, number, number];
    scale?: number;
    rotation?: [number, number, number];
}

interface IslandComponentProps extends IslandProps {
    selectedId: string | null;
    onSelect: (id: string | null) => void;
}

// --- Reusable Object Definitions ---

const Tree: React.FC<ObjectProps> = ({ position, scale = 1, rotation = [0,0,0] }) => (
    <group position={position} scale={scale} rotation={rotation as any}>
        <mesh position={[0, 1.5, 0]} castShadow>
            <cylinderGeometry args={[0.15, 0.3, 3, 6]} />
            <meshStandardMaterial color="#3e3228" roughness={0.9} />
        </mesh>
        <mesh position={[0.5, 2.5, 0.2]} rotation={[0, 0, -0.5]} castShadow>
            <cylinderGeometry args={[0.1, 0.15, 1.5, 6]} />
            <meshStandardMaterial color="#3e3228" roughness={0.9} />
        </mesh>
        <mesh position={[-0.4, 2, -0.2]} rotation={[0.2, 0, 0.6]} castShadow>
            <cylinderGeometry args={[0.08, 0.12, 1.2, 6]} />
            <meshStandardMaterial color="#3e3228" roughness={0.9} />
        </mesh>
        <mesh position={[0.2, 3.2, 0]} castShadow>
            <dodecahedronGeometry args={[0.8, 0]} />
            <meshStandardMaterial color="#4a6e3a" roughness={0.8} />
        </mesh>
        <mesh position={[1, 3.0, 0.3]} scale={0.7} castShadow>
            <dodecahedronGeometry args={[0.8, 0]} />
            <meshStandardMaterial color="#3a5e2a" roughness={0.8} />
        </mesh>
            <mesh position={[-0.8, 2.5, -0.3]} scale={0.6} castShadow>
            <dodecahedronGeometry args={[0.8, 0]} />
            <meshStandardMaterial color="#5a7e4a" roughness={0.8} />
        </mesh>
    </group>
);

const Rock: React.FC<ObjectProps> = ({ position, scale = 1, rotation = [0,0,0] }) => (
    <mesh position={position} scale={scale} rotation={rotation as any} castShadow receiveShadow>
        <dodecahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial color="#555" roughness={0.6} flatShading />
    </mesh>
);

const Crystal: React.FC<ObjectProps> = ({ position, scale = 1, rotation = [0,0,0] }) => (
    <group position={position} scale={scale} rotation={rotation as any}>
        <mesh castShadow>
            <octahedronGeometry args={[0.4, 0]} />
            <meshStandardMaterial color="#00eaff" emissive="#0088ff" emissiveIntensity={3} roughness={0.2} metalness={0.9} toneMapped={false} />
        </mesh>
        <pointLight distance={3} intensity={2} color="#00eaff" />
    </group>
);

const Mushroom: React.FC<ObjectProps> = ({ position, scale = 1, rotation = [0,0,0] }) => (
    <group position={position} scale={scale} rotation={rotation as any}>
        <mesh position={[0, 0.4, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.1, 0.8, 8]} />
            <meshStandardMaterial color="#eee8d5" />
        </mesh>
        <mesh position={[0, 0.8, 0]} castShadow>
            <coneGeometry args={[0.4, 0.3, 16]} />
            <meshStandardMaterial color="#ff4444" emissive="#440000" roughness={0.4} />
        </mesh>
        <mesh position={[0.15, 0.75, 0.1]} scale={0.08}>
            <sphereGeometry />
            <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[-0.1, 0.85, -0.1]} scale={0.06}>
            <sphereGeometry />
            <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={0.5} />
        </mesh>
        <pointLight position={[0, 0.5, 0]} distance={1.5} intensity={0.5} color="#ff8888" />
    </group>
);

const Lamp: React.FC<ObjectProps> = ({ position, scale = 1, rotation = [0,0,0] }) => (
    <group position={position} scale={scale} rotation={rotation as any}>
        <mesh position={[0, 1, 0]} castShadow>
            <cylinderGeometry args={[0.03, 0.03, 2]} />
            <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
        </mesh>
            <mesh position={[0.2, 1.8, 0]} rotation={[0,0,-0.2]} castShadow>
            <boxGeometry args={[0.4, 0.03, 0.03]} />
            <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0.35, 1.65, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.12, 0.3, 5]} />
            <meshStandardMaterial color="#ffaa00" emissive="#ffaa00" emissiveIntensity={4} toneMapped={false} />
        </mesh>
        {/* Actual light source */}
        <pointLight position={[0.35, 1.5, 0]} distance={4} intensity={2} color="#ffaa00" />
    </group>
);

const Bush: React.FC<ObjectProps> = ({ position, scale = 1, rotation = [0,0,0] }) => (
    <group position={position} scale={scale} rotation={rotation as any}>
        <mesh position={[0, 0.3, 0]} castShadow>
            <dodecahedronGeometry args={[0.35, 0]} />
            <meshStandardMaterial color="#2d4c1e" roughness={1} />
        </mesh>
            <mesh position={[0.3, 0.2, 0.2]} castShadow>
            <dodecahedronGeometry args={[0.25, 0]} />
            <meshStandardMaterial color="#3a5e2a" roughness={1} />
        </mesh>
            <mesh position={[-0.3, 0.25, -0.1]} castShadow>
            <dodecahedronGeometry args={[0.3, 0]} />
            <meshStandardMaterial color="#223b16" roughness={1} />
        </mesh>
    </group>
);

const Fence: React.FC<ObjectProps> = ({ position, scale = 1, rotation = [0,0,0] }) => (
    <group position={position} scale={scale} rotation={rotation as any}>
        <mesh position={[-0.4, 0.5, 0]} castShadow>
            <boxGeometry args={[0.1, 1.0, 0.1]} />
            <meshStandardMaterial color="#5c4033" roughness={0.9} />
        </mesh>
        <mesh position={[0.4, 0.5, 0]} castShadow>
            <boxGeometry args={[0.1, 1.0, 0.1]} />
            <meshStandardMaterial color="#5c4033" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.7, 0]} castShadow>
            <boxGeometry args={[0.9, 0.08, 0.03]} />
            <meshStandardMaterial color="#6c5043" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.3, 0]} castShadow>
            <boxGeometry args={[0.9, 0.08, 0.03]} />
            <meshStandardMaterial color="#6c5043" roughness={0.9} />
        </mesh>
    </group>
);

// Helper to render object by type
const renderObject = (type: ToolType, props: ObjectProps) => {
    switch(type) {
        case 'TREE': return <Tree {...props} />;
        case 'ROCK': return <Rock {...props} />;
        case 'CRYSTAL': return <Crystal {...props} />;
        case 'MUSHROOM': return <Mushroom {...props} />;
        case 'LAMP': return <Lamp {...props} />;
        case 'BUSH': return <Bush {...props} />;
        case 'FENCE': return <Fence {...props} />;
        default: return null;
    }
}


const Roots = () => {
    const curves = useMemo(() => {
        return new Array(4).fill(0).map((_, i) => {
             const startX = (Math.random() - 0.5) * 2;
             const startZ = (Math.random() - 0.5) * 2;
             const length = 1.5 + Math.random();
             const points = [
                 new Vector3(startX, -1.5, startZ),
                 new Vector3(startX * 0.8, -1.5 - length * 0.3, startZ * 0.8),
                 new Vector3(startX * 0.5 + Math.random()*0.5, -1.5 - length * 0.7, startZ * 0.5),
                 new Vector3(0, -1.5 - length, 0)
             ];
             return new CatmullRomCurve3(points);
        })
    }, []);

    return (
        <group>
            {curves.map((curve, i) => (
                <Tube key={i} args={[curve, 32, 0.04 - (i*0.005), 8, false]}>
                     <meshStandardMaterial color="#5c4839" />
                </Tube>
            ))}
        </group>
    )
}

const Signpost = ({position}: {position: [number, number, number]}) => {
    return (
        <group position={position} rotation={[0, -0.4, 0]}>
            <mesh position={[0, 1, 0]} castShadow>
                <cylinderGeometry args={[0.05, 0.05, 2, 8]} />
                 <meshStandardMaterial color="#8b5a2b" />
            </mesh>
            <mesh position={[0, 1.7, 0]} rotation={[0, 0.2, 0]} castShadow>
                <boxGeometry args={[0.8, 0.25, 0.05]} />
                <meshStandardMaterial color="#ddd" />
            </mesh>
        </group>
    )
}

const Particle: React.FC<{ data: { position: [number, number, number], scale: number, speed: number, rotation: [number, number, number] } }> = ({ data }) => {
    const meshRef = useRef<Mesh>(null);
    const { position, scale, speed, rotation } = data;
    const seed = useMemo(() => Math.random() * 1000, []);

    useFrame((state) => {
        if (!meshRef.current) return;
        const t = state.clock.getElapsedTime();
        
        // Drift logic
        const driftX = Math.sin(t * 0.2 * speed + seed) * 0.5 + Math.cos(t * 0.8 * speed + seed) * 0.1;
        const driftY = Math.cos(t * 0.15 * speed + seed * 0.5) * 0.5 + Math.sin(t * 0.5 * speed + seed) * 0.1;
        const driftZ = Math.sin(t * 0.25 * speed + seed * 0.2) * 0.5 + Math.cos(t * 0.7 * speed + seed) * 0.1;

        meshRef.current.position.set(
            position[0] + driftX,
            position[1] + driftY,
            position[2] + driftZ
        );

        // Rotation
        meshRef.current.rotation.x = rotation[0] + t * 0.2 * speed;
        meshRef.current.rotation.y = rotation[1] + t * 0.1 * speed;
        
        // Pulse
        const pulse = 1 + Math.sin(t * 1.5 + seed) * 0.15; 
        const flutter = Math.max(0, Math.sin(t * 4 + seed * 2)) * 0.05;
        
        const currentScale = scale * (pulse + flutter);
        meshRef.current.scale.setScalar(currentScale);
    });

    return (
        <mesh ref={meshRef} castShadow receiveShadow>
            <dodecahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color="#888" roughness={0.6} transparent opacity={0.8} />
        </mesh>
    );
};

// --- Main Component ---

export const Island: React.FC<IslandComponentProps> = ({ mode, activeTool, objects, onAddObject, selectedId, onSelect, snapToGrid }) => {
  const { gl } = useThree();
  const meshRef = useRef<InstancedMesh>(null);
  const groupRef = useRef<Group>(null);

  // Ghost State
  const [ghostPosition, setGhostPosition] = useState<[number, number, number] | null>(null);
  const [ghostRotation, setGhostRotation] = useState<number>(0);
  const [ghostScale, setGhostScale] = useState<number>(1);

  // Grass Generation
  const grassCount = 2000;
  const tempObject = useMemo(() => new Object3D(), []);
  
  // Floating Particles
  const particles = useMemo(() => {
    return new Array(25).fill(0).map(() => ({
      position: [
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 4 - 2.5, 
        (Math.random() - 0.5) * 6
      ] as [number, number, number],
      scale: Math.random() * 0.2 + 0.05,
      speed: Math.random() * 0.3 + 0.1,
      rotation: [Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI] as [number, number, number]
    }));
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (groupRef.current && mode === 'SIM') {
        groupRef.current.rotation.y = time * 0.08;
    }
  });

  // Handle Wheel Events for Rotation/Scale
  useEffect(() => {
    const canvas = gl.domElement;
    
    const handleWheel = (e: WheelEvent) => {
        if (mode !== 'DESIGN') return;
        e.preventDefault(); 
        
        const delta = Math.sign(e.deltaY);
        
        if (e.shiftKey) {
            setGhostScale(prev => Math.max(0.2, Math.min(3.0, prev - delta * 0.1)));
        } else {
            setGhostRotation(prev => prev + delta * 0.2);
        }
    };

    if (mode === 'DESIGN') {
        canvas.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
        canvas.removeEventListener('wheel', handleWheel);
    };
  }, [mode, gl.domElement]);

  React.useLayoutEffect(() => {
    if (meshRef.current) {
      let index = 0;
      for (let i = 0; i < grassCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.pow(Math.random(), 0.5) * 3.4; 
        const x = Math.cos(angle) * r;
        const z = Math.sin(angle) * r;
        
        tempObject.rotation.set((Math.random() - 0.5) * 0.2, Math.random() * Math.PI, (Math.random() - 0.5) * 0.2);
        tempObject.position.set(x, 0, z);
        const s = Math.random() * 0.6 + 0.4;
        tempObject.scale.set(s, s * (Math.random() * 0.8 + 0.6), s);
        
        tempObject.updateMatrix();
        meshRef.current.setMatrixAt(index++, tempObject.matrix);
      }
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [tempObject]);

  const snap = (val: number) => snapToGrid ? Math.round(val * 2) / 2 : val;

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (mode !== 'DESIGN') return;
    
    if (groupRef.current) {
        const worldPoint = e.point.clone();
        const localPoint = groupRef.current.worldToLocal(worldPoint);
        
        const x = snap(localPoint.x);
        const z = snap(localPoint.z);

        onAddObject({
            id: Math.random().toString(36).substr(2, 9),
            type: activeTool,
            position: [x, localPoint.y, z],
            rotation: [0, ghostRotation, 0],
            scale: ghostScale
        });
    }
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (mode !== 'DESIGN') {
        if (ghostPosition) setGhostPosition(null);
        return;
    }
    
    if (groupRef.current) {
        const worldPoint = e.point.clone();
        const localPoint = groupRef.current.worldToLocal(worldPoint);
        
        const x = snap(localPoint.x);
        const z = snap(localPoint.z);
        
        setGhostPosition([x, localPoint.y, z]);
    }
  };

  const handlePointerOut = () => {
    setGhostPosition(null);
  }

  return (
    <group ref={groupRef} position={[0, -2, 0]}>
      {/* --- TERRAIN --- */}
      {/* Main Top Disc */}
      <mesh 
        receiveShadow 
        position={[0, -0.4, 0]} 
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerOut={handlePointerOut}
        onPointerOver={() => mode === 'DESIGN' && (document.body.style.cursor = 'crosshair')}
      >
        <cylinderGeometry args={[3.5, 2.0, 1.2, 7]} />
        <meshStandardMaterial color="#3a2e25" roughness={1} />
      </mesh>
      
      {/* Underside */}
      <group position={[0, -1.0, 0]}>
         <mesh receiveShadow position={[0.2, -0.5, 0.2]} rotation={[0.5, 0.2, 0]}>
             <dodecahedronGeometry args={[2.0, 0]} />
             <meshStandardMaterial color="#2a221b" roughness={1} flatShading />
         </mesh>
          <mesh receiveShadow position={[-1.2, -0.2, -0.5]} rotation={[0, 1, 0.5]}>
             <dodecahedronGeometry args={[1.5, 0]} />
             <meshStandardMaterial color="#2a221b" roughness={1} flatShading />
         </mesh>
          <mesh receiveShadow position={[1.5, 0, -1.0]} rotation={[1, 0, 0]}>
             <dodecahedronGeometry args={[1.2, 0]} />
             <meshStandardMaterial color="#2a221b" roughness={1} flatShading />
         </mesh>
         <mesh receiveShadow position={[-0.5, -1.2, 0.5]} scale={[0.6, 1, 0.6]}>
             <dodecahedronGeometry args={[1.3, 0]} />
             <meshStandardMaterial color="#2a221b" roughness={1} flatShading />
         </mesh>
      </group>

      {/* Vegetation Base */}
      <mesh 
        receiveShadow 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0.01, 0]} 
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
      >
         <circleGeometry args={[3.4, 32]} />
         <meshStandardMaterial color="#1a3b1a" roughness={1} />
      </mesh>

      <instancedMesh ref={meshRef} args={[undefined, undefined, grassCount]} castShadow receiveShadow>
        <coneGeometry args={[0.03, 0.6, 2]} />
        <meshStandardMaterial color="#4f8f4f" roughness={0.6} />
      </instancedMesh>

      {/* Static Objects */}
      <Tree position={[-1.5, 0, 1]} />
      <Signpost position={[1.5, 0, -1]} />
      <Roots />
      
      {/* Dynamic User Objects */}
      {objects.map((obj) => (
         <group 
            key={obj.id} 
            onClick={(e) => {
                if (mode === 'DESIGN') {
                    e.stopPropagation();
                    onSelect(obj.id === selectedId ? null : obj.id);
                }
            }}
            onPointerOver={() => mode === 'DESIGN' && (document.body.style.cursor = 'pointer')}
            onPointerOut={() => mode === 'DESIGN' && (document.body.style.cursor = 'crosshair')}
         >
             {renderObject(obj.type, { 
                 position: obj.position, 
                 rotation: obj.rotation, 
                 scale: obj.scale 
             })}
             
             {/* Selection Indicator */}
             {selectedId === obj.id && (
                 <mesh position={[obj.position[0], obj.position[1] + 0.05, obj.position[2]]} rotation={[-Math.PI/2, 0, 0]}>
                     <ringGeometry args={[0.4 * obj.scale, 0.5 * obj.scale, 32]} />
                     <meshBasicMaterial color="yellow" toneMapped={false} />
                 </mesh>
             )}
         </group>
      ))}

      {/* Ghost Object (Preview) */}
      {mode === 'DESIGN' && ghostPosition && (
          <group>
             {/* Render Ghost with Transparency */}
             <group style={{ opacity: 0.5, pointerEvents: 'none' }}>
                {renderObject(activeTool, {
                    position: ghostPosition,
                    rotation: [0, ghostRotation, 0],
                    scale: ghostScale
                })}
             </group>
             {/* Ghost Indicator Ring */}
             <mesh position={[ghostPosition[0], ghostPosition[1] + 0.02, ghostPosition[2]]} rotation={[-Math.PI/2, 0, 0]}>
                 <ringGeometry args={[0.4 * ghostScale, 0.45 * ghostScale, 32]} />
                 <meshBasicMaterial color={snapToGrid ? "#4ade80" : "white"} opacity={0.3} transparent />
             </mesh>
             {/* Grid Helper Point if Snapping */}
             {snapToGrid && (
                <mesh position={[ghostPosition[0], ghostPosition[1], ghostPosition[2]]}>
                    <sphereGeometry args={[0.05]} />
                    <meshBasicMaterial color="#4ade80" />
                </mesh>
             )}
             {/* Helper Light for Ghost */}
             {(activeTool === 'LAMP' || activeTool === 'CRYSTAL') && (
                 <pointLight position={[ghostPosition[0], ghostPosition[1] + 0.5, ghostPosition[2]]} distance={3} intensity={1} color="white" />
             )}
          </group>
      )}

      {/* Particles */}
      {particles.map((p, i) => (
         <Particle key={i} data={p} />
      ))}
    </group>
  );
};