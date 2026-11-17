import './Renderer.css'
import { useEffect, useRef } from 'react'

type point = { x: number; y: number }
type Zpoint = { x: number; y: number; z: number }

function Renderer() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const background = 'grey'
  const forGround = '#00ff00'
  const slow = 0.2

  useEffect(() => {
    const element = canvasRef.current
    if (!element) return
    const context = element.getContext('2d')
    if (!context) return
    const canvas = element
    const ctx = context
    let speed = 1
    let targetspeed = 1
    let frameId = 0
    let previousTime: number | undefined
    console.log(canvas)
    console.log(canvasRef)

    function onEnter() {
      targetspeed = slow
    }
    function onLeave() {
      targetspeed = 1
    }

    canvas.addEventListener('pointerenter', onEnter)
    canvas.addEventListener('pointerleave', onLeave)

    function clear() {
      ctx.fillStyle = background
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
    function screen(p: point): point {
      return {
        x: ((p.x + 1) / 2) * canvas.width,
        y: (1 - (p.y + 1) / 2) * canvas.height,
      }
    }

    function project({ x, y, z }: Zpoint): point {
      return {
        x: x / z,
        y: y / z,
      }
    }

    function translate_z({ x, y, z }: Zpoint, dz: number): Zpoint {
      return { x, y, z: z + dz }
    }

    function rotate_xz({ x, y, z }: Zpoint, angle: number): Zpoint {
      const c = Math.cos(angle)
      const s = Math.sin(angle)
      return { x: x * c - z * s, y, z: z * c + x * s }
    }
    function rotate_yz({ x, y, z }: Zpoint, angle: number): Zpoint {
      const c = Math.cos(angle)
      const s = Math.sin(angle)
      return { x, y: y * c - z * s, z: z * c + y * s }
    }

    function line(p1: point, p2: point) {
      ctx.lineWidth = 10
      ctx.strokeStyle = forGround
      ctx.beginPath()
      ctx.moveTo(p1.x, p1.y)
      ctx.lineTo(p2.x, p2.y)
      ctx.stroke()
    }

    const fs: Array<Array<number>> = [
      //kubi

      [0, 1, 2, 3],
      [4, 5, 6, 7],
      [0, 4],
      [1, 5],
      [2, 6],
      [3, 7],

      //piramida

      // [0, 1, 2, 3],
      // [0, 1, 4],
      // [1, 2, 4],
      // [2, 3, 4],
      // [3, 0, 4],
    ]

    const vs: Zpoint[] = [
      //kubi

      { x: 0.5, y: 0.5, z: 0.5 },
      { x: -0.5, y: 0.5, z: 0.5 },
      { x: -0.5, y: -0.5, z: 0.5 },
      { x: 0.5, y: -0.5, z: 0.5 },

      { x: 0.5, y: 0.5, z: -0.5 },
      { x: -0.5, y: 0.5, z: -0.5 },
      { x: -0.5, y: -0.5, z: -0.5 },
      { x: 0.5, y: -0.5, z: -0.5 },

      //piramida

      // { x: 0.5, y: -0.4, z: 0.5 },
      // { x: -0.5, y: -0.4, z: 0.5 },
      // { x: -0.5, y: -0.4, z: -0.5 },
      // { x: 0.5, y: -0.4, z: -0.5 },
      // { x: 0, y: 0.6, z: 0 },
    ]

    let dz = 2
    let angle = 0

    function frame(time: number) {
      speed += (targetspeed - speed) * 0.1
      const dt = previousTime === undefined ? 0 : Math.min((time - previousTime) / 1000, 0.05)
      previousTime = time
      dz += 0
      angle += Math.PI * dt * speed
      clear()
      for (const f of fs) {
        for (let i = 0; i < f.length; i++) {
          const a = vs[f[i]]
          const b = vs[f[(i + 1) % f.length]]
          line(
            screen(project(translate_z(rotate_xz(rotate_yz(a, angle), angle), dz))),
            screen(project(translate_z(rotate_xz(rotate_yz(b, angle), angle), dz))),
          )
        }
      }
      frameId = requestAnimationFrame(frame)
    }
    frameId = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(frameId)
      canvas.removeEventListener('pointerenter', onEnter)
      canvas.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return (
    <div>
      <canvas ref={canvasRef} className="renderer-canvas"></canvas>
    </div>
  )
}

export default Renderer
