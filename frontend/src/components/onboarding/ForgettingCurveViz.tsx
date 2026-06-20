import { useRef, useMemo, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

function ForgettingCurveLine({ stability, color, yOffset }: { stability: number; color: string; yOffset: number }) {
  const points = useMemo(() => {
    const pts: THREE.Vector3[] = []
    for (let t = 0; t <= 30; t += 0.3) {
      const retention = Math.pow(1 + (t / (9 * stability)), -1)
      pts.push(new THREE.Vector3(t / 5 - 3, retention * 2 + yOffset, 0))
    }
    return pts
  }, [stability, yOffset])

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry().setFromPoints(points)
    return g
  }, [points])

  return (
    <line>
      <primitive object={geometry} attach="geometry" />
      <lineBasicMaterial color={color} linewidth={2} />
    </line>
  )
}

function ReviewPulse({ delay }: { delay: number }) {
  const ref = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (ref.current) {
      const t = (state.clock.elapsedTime + delay) % 3
      const scale = 1 + Math.sin(t * Math.PI) * 0.3
      ref.current.scale.setScalar(scale)
      const mat = ref.current.material as THREE.MeshBasicMaterial
      mat.opacity = 0.8 - t / 3.5
    }
  })

  return (
    <mesh ref={ref} position={[0, 0.3, 0]}>
      <sphereGeometry args={[0.08, 16, 16]} />
      <meshBasicMaterial color="#22d3ee" transparent opacity={0.8} />
    </mesh>
  )
}

function Scene() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.15
    }
  })

  return (
    <group ref={groupRef}>
      <ForgettingCurveLine stability={1} color="#fb923c" yOffset={-0.5} />
      <ForgettingCurveLine stability={5} color="#9461fa" yOffset={0} />
      <ForgettingCurveLine stability={15} color="#22d3ee" yOffset={0.5} />
      <ReviewPulse delay={0} />
      <ReviewPulse delay={1.5} />
      <Text
        position={[0, -1.8, 0]}
        fontSize={0.18}
        color="#8a84a3"
        anchorX="center"
        font={undefined}
      >
        time since last review →
      </Text>
    </group>
  )
}

export function ForgettingCurveViz({ className }: { className?: string }) {
  return (
    <div className={className}>
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 1.5]}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.6} />
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  )
}
