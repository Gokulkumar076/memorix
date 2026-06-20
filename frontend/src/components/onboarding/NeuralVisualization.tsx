import { useRef, useMemo, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface NodeData {
  position: [number, number, number]
  connections: number[]
}

function generateNetwork(count: number, radius: number): NodeData[] {
  const nodes: NodeData[] = []
  for (let i = 0; i < count; i++) {
    const phi = Math.acos(-1 + (2 * i) / count)
    const theta = Math.sqrt(count * Math.PI) * phi
    const x = radius * Math.cos(theta) * Math.sin(phi)
    const y = radius * Math.sin(theta) * Math.sin(phi)
    const z = radius * Math.cos(phi)
    nodes.push({ position: [x, y, z], connections: [] })
  }
  // Connect each node to its 2-3 nearest neighbors
  nodes.forEach((node, i) => {
    const distances = nodes
      .map((other, j) => ({
        index: j,
        dist:
          j === i
            ? Infinity
            : Math.hypot(
                node.position[0] - other.position[0],
                node.position[1] - other.position[1],
                node.position[2] - other.position[2]
              ),
      }))
      .sort((a, b) => a.dist - b.dist)
    node.connections = distances.slice(0, 2).map((d) => d.index)
  })
  return nodes
}

function NeuralNetwork() {
  const groupRef = useRef<THREE.Group>(null)
  const nodes = useMemo(() => generateNetwork(42, 2.4), [])

  const lines = useMemo(() => {
    const segments: [THREE.Vector3, THREE.Vector3][] = []
    nodes.forEach((node) => {
      node.connections.forEach((j) => {
        segments.push([
          new THREE.Vector3(...node.position),
          new THREE.Vector3(...nodes[j].position),
        ])
      })
    })
    return segments
  }, [nodes])

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.08
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.1
    }
  })

  return (
    <group ref={groupRef}>
      {nodes.map((node, i) => (
        <mesh key={i} position={node.position}>
          <sphereGeometry args={[0.045, 12, 12]} />
          <meshBasicMaterial color={i % 5 === 0 ? '#22d3ee' : '#9461fa'} />
        </mesh>
      ))}
      {lines.map(([a, b], i) => (
        <Line key={i} start={a} end={b} />
      ))}
    </group>
  )
}

function Line({ start, end }: { start: THREE.Vector3; end: THREE.Vector3 }) {
  const ref = useRef<THREE.BufferGeometry>(null)
  const points = useMemo(() => [start, end], [start, end])
  return (
    <line>
      <bufferGeometry ref={ref}>
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={new Float32Array(points.flatMap((p) => [p.x, p.y, p.z]))}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color="#5d5775" transparent opacity={0.35} />
    </line>
  )
}

function Particles() {
  const ref = useRef<THREE.Points>(null)
  const count = 200
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 10
      arr[i * 3 + 1] = (Math.random() - 0.5) * 10
      arr[i * 3 + 2] = (Math.random() - 0.5) * 10
    }
    return arr
  }, [])

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.02
    }
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.015} color="#7c3aed" transparent opacity={0.4} sizeAttenuation />
    </points>
  )
}

export function NeuralVisualization({ className }: { className?: string }) {
  return (
    <div className={className}>
      <Canvas camera={{ position: [0, 0, 6], fov: 50 }} dpr={[1, 1.5]}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <NeuralNetwork />
          <Particles />
        </Suspense>
      </Canvas>
    </div>
  )
}
