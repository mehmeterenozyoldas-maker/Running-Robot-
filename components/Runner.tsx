import React, { useRef } from 'react';
import { Group, Mesh } from 'three';
import { useFrame } from '@react-three/fiber';
import { RunnerProps } from '../types';

// Materials
const BlackMaterial = <meshStandardMaterial color="#050505" roughness={0.2} metalness={0.8} />;
const WhiteMaterial = <meshStandardMaterial color="#eeeeee" roughness={0.4} metalness={0.2} />;
const BlueEmissive = <meshStandardMaterial color="#0088ff" emissive="#0088ff" emissiveIntensity={2} toneMapped={false} />;
const SoleMaterial = <meshStandardMaterial color="#333" roughness={0.9} />;

export const Runner: React.FC<RunnerProps> = ({ paused }) => {
  const groupRef = useRef<Group>(null);
  
  // Body Parts Refs
  const torsoRef = useRef<Mesh>(null);
  const headGroupRef = useRef<Group>(null);
  
  // Limbs
  const rightThighRef = useRef<Group>(null);
  const rightShinRef = useRef<Group>(null);
  const rightArmRef = useRef<Group>(null);
  const rightForearmRef = useRef<Group>(null);
  
  const leftThighRef = useRef<Group>(null);
  const leftShinRef = useRef<Group>(null);
  const leftArmRef = useRef<Group>(null);
  const leftForearmRef = useRef<Group>(null);

  useFrame((state) => {
    if (paused) return;

    const t = state.clock.getElapsedTime();
    const speed = 12; // Increased speed for a more energetic sprint
    
    // Vertical Bobbing with more snap
    const bobOffset = Math.sin(t * speed * 2) * 0.1;
    if (groupRef.current) {
        // Base height 1.35 + bob
        groupRef.current.position.y = bobOffset;
    }

    // Main Animation Cycles
    const runCycle = t * speed;
    const leftPhase = runCycle;
    const rightPhase = runCycle + Math.PI;
    
    // --- LEGS ---
    // Right Leg
    if (rightThighRef.current && rightShinRef.current) {
        // Thigh swing (Hip)
        rightThighRef.current.rotation.x = Math.sin(rightPhase) * 1.3;
        
        // Knee Snap
        // Bends when lifting (phase > 0 roughly), extends when pushing
        const kneeFlex = Math.sin(rightPhase - 0.5); 
        const kneeBend = Math.max(0, kneeFlex);
        rightShinRef.current.rotation.x = -kneeBend * 2.0 - 0.2; 
    }

    // Left Leg
    if (leftThighRef.current && leftShinRef.current) {
        leftThighRef.current.rotation.x = Math.sin(leftPhase) * 1.3;
        const kneeFlex = Math.sin(leftPhase - 0.5);
        const kneeBend = Math.max(0, kneeFlex);
        leftShinRef.current.rotation.x = -kneeBend * 2.0 - 0.2;
    }

    // --- ARMS ---
    // Arms swing opposite to legs and cross the body slightly
    if (rightArmRef.current && rightForearmRef.current) {
         const armCycle = leftPhase; // Sync with left leg
         
         // Upper Arm
         rightArmRef.current.rotation.x = Math.sin(armCycle) * 1.1; 
         rightArmRef.current.rotation.z = 0.15; // Natural flare
         rightArmRef.current.rotation.y = -0.3 + Math.sin(armCycle) * 0.3; // Swing inward
         
         // Forearm Pump
         rightForearmRef.current.rotation.x = 1.6 + Math.cos(armCycle) * 0.4;
    }

    if (leftArmRef.current && leftForearmRef.current) {
         const armCycle = rightPhase; // Sync with right leg
         
         // Upper Arm
         leftArmRef.current.rotation.x = Math.sin(armCycle) * 1.1;
         leftArmRef.current.rotation.z = -0.15;
         leftArmRef.current.rotation.y = 0.3 + Math.sin(armCycle) * 0.3;

         // Forearm Pump
         leftForearmRef.current.rotation.x = 1.6 + Math.cos(armCycle) * 0.4;
    }
    
    // --- TORSO DYNAMICS ---
    if (torsoRef.current) {
        // Forward Lean (Momentum)
        torsoRef.current.rotation.x = 0.35 + Math.cos(t * speed * 2) * 0.05;
        
        // Spinal Twist (Counter-rotation to hips)
        torsoRef.current.rotation.y = Math.sin(runCycle) * 0.3;
        
        // Weight Shift (Sway Z)
        torsoRef.current.rotation.z = Math.cos(runCycle) * 0.15;
    }
    
    // --- HEAD STABILIZATION ---
    if (headGroupRef.current) {
        // Counter-act the forward lean slightly to look straight
        headGroupRef.current.rotation.x = -0.1 + Math.sin(t * speed * 2) * 0.05;
        // Subtle independent look motion
        headGroupRef.current.rotation.y = Math.sin(t * speed * 0.3) * 0.15;
    }
  });

  return (
    <group ref={groupRef} position={[0, 1.35, 0]}>
      
      {/* --- HEAD (Baseball Cap style) --- */}
      <group ref={headGroupRef} position={[0, 1.55, 0]}>
        {/* Cap Dome */}
        <mesh castShadow rotation={[0,0,0]}>
             <sphereGeometry args={[0.22, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
             {WhiteMaterial}
        </mesh>
        {/* Cap Visor */}
        <mesh position={[0, 0, 0.2]} rotation={[0.2, 0, 0]} castShadow>
            <boxGeometry args={[0.3, 0.02, 0.25]} />
            {WhiteMaterial}
        </mesh>
        {/* Cap Button */}
        <mesh position={[0, 0.21, 0]}>
            <sphereGeometry args={[0.03]} />
            {WhiteMaterial}
        </mesh>
      </group>

      {/* --- TORSO --- */}
      <group position={[0, 0.85, 0]}>
          {/* Main Jacket */}
          <mesh ref={torsoRef} castShadow>
            <capsuleGeometry args={[0.28, 0.6, 4, 16]} />
            {BlackMaterial}
            
            {/* Hood bump on back */}
            <mesh position={[0, 0.35, -0.15]} rotation={[-0.5, 0, 0]}>
                <sphereGeometry args={[0.15, 16, 16]} />
                {BlackMaterial}
            </mesh>

            {/* Blue Light / Hydration Pack Detail */}
            <mesh position={[0, 0.2, 0.25]}>
                <boxGeometry args={[0.1, 0.2, 0.05]} />
                {BlueEmissive}
            </mesh>
             <mesh position={[0, 0.2, -0.25]}>
                <boxGeometry args={[0.15, 0.3, 0.05]} />
                {BlackMaterial} {/* Backpack bulk */}
            </mesh>
          </mesh>
      </group>

      {/* --- ARMS --- */}
      {/* Right Arm */}
      <group ref={rightArmRef} position={[0.35, 1.35, 0]}> 
        <mesh position={[0.05, -0.3, 0]} rotation={[0,0,-0.1]} castShadow>
             <capsuleGeometry args={[0.11, 0.45, 4, 8]} />
             {BlackMaterial}
        </mesh>
        <group ref={rightForearmRef} position={[0.05, -0.6, 0]}>
             <mesh position={[0, 0.22, 0]} castShadow>
                <capsuleGeometry args={[0.10, 0.45, 4, 8]} />
                {BlackMaterial}
             </mesh>
        </group>
      </group>

      {/* Left Arm */}
      <group ref={leftArmRef} position={[-0.35, 1.35, 0]}> 
        <mesh position={[-0.05, -0.3, 0]} rotation={[0,0,0.1]} castShadow>
             <capsuleGeometry args={[0.11, 0.45, 4, 8]} />
             {BlackMaterial}
        </mesh>
        <group ref={leftForearmRef} position={[-0.05, -0.6, 0]}>
             <mesh position={[0, 0.22, 0]} castShadow>
                <capsuleGeometry args={[0.10, 0.45, 4, 8]} />
                {BlackMaterial}
             </mesh>
        </group>
      </group>

      {/* --- LEGS --- */}
      {/* Right Leg */}
      <group ref={rightThighRef} position={[0.2, 0.45, 0]}>
        {/* Thigh */}
        <mesh position={[0, -0.3, 0]} castShadow>
             <capsuleGeometry args={[0.15, 0.5, 4, 8]} />
             {BlackMaterial}
        </mesh>
        
        {/* Shin */}
        <group ref={rightShinRef} position={[0, -0.65, 0]}>
             {/* Calf Muscle/Legging */}
             <mesh position={[0, -0.2, 0]} castShadow>
                 <capsuleGeometry args={[0.11, 0.5, 4, 8]} />
                 {BlackMaterial}
             </mesh>
             
             {/* Shoe */}
             <group position={[0, -0.55, 0.05]}>
                <mesh castShadow position={[0, 0.05, 0]}>
                    <boxGeometry args={[0.14, 0.12, 0.35]} />
                    {WhiteMaterial}
                </mesh>
                <mesh position={[0, -0.02, 0]}>
                     <boxGeometry args={[0.15, 0.04, 0.36]} />
                     {SoleMaterial}
                </mesh>
             </group>
        </group>
      </group>

      {/* Left Leg */}
      <group ref={leftThighRef} position={[-0.2, 0.45, 0]}>
        <mesh position={[0, -0.3, 0]} castShadow>
             <capsuleGeometry args={[0.15, 0.5, 4, 8]} />
             {BlackMaterial}
        </mesh>
        <group ref={leftShinRef} position={[0, -0.65, 0]}>
             <mesh position={[0, -0.2, 0]} castShadow>
                 <capsuleGeometry args={[0.11, 0.5, 4, 8]} />
                 {BlackMaterial}
             </mesh>
             <group position={[0, -0.55, 0.05]}>
                <mesh castShadow position={[0, 0.05, 0]}>
                    <boxGeometry args={[0.14, 0.12, 0.35]} />
                    {WhiteMaterial}
                </mesh>
                <mesh position={[0, -0.02, 0]}>
                     <boxGeometry args={[0.15, 0.04, 0.36]} />
                     {SoleMaterial}
                </mesh>
             </group>
        </group>
      </group>

    </group>
  );
};