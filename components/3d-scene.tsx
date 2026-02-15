'use client'

import { useRef, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { MeshTransmissionMaterial, Environment } from '@react-three/drei'

// Central Glass Icosahedron with slow rotation
function GlassIcosahedron() {
  const meshRef = useRef<any>(null)

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.1
      meshRef.current.rotation.y += delta * 0.15
      meshRef.current.rotation.z += delta * 0.05
    }
  })

  return (
    <mesh ref={meshRef} scale={2.5}>
      <icosahedronGeometry args={[1, 1]} />
      <MeshTransmissionMaterial
        backside
        samples={16}
        resolution={1024}
        transmission={1}
        roughness={0.0}
        thickness={2}
        ior={1.5}
        chromaticAberration={0.8}
        anisotropy={0.5}
        distortion={0.5}
        distortionScale={0.3}
        temporalDistortion={0.2}
        color="#8B5CF6"
      />
    </mesh>
  )
}

// Main 3D Scene Component
export function Scene3D() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        className="bg-transparent"
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          {/* Realistic city reflections */}
          <Environment preset="city" />
          
          {/* Enhanced lighting */}
          <ambientLight intensity={0.3} />
          <pointLight position={[10, 10, 10]} intensity={1.5} color="#8B5CF6" />
          <pointLight position={[-10, -10, -5]} intensity={1} color="#EC4899" />
          <spotLight position={[0, 5, 0]} intensity={0.5} angle={0.3} penumbra={1} color="#3B82F6" />

          {/* Central Glass Icosahedron */}
          <GlassIcosahedron />
        </Suspense>
      </Canvas>
    </div>
  )
}
