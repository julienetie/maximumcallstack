const { sqrt, abs, random } = Math
const smokeSpriteSize = 20
const raf = window.requestAnimationFrame
const noop = () => { }
let opacities

try {
  const response = await fetch('opacities.json')
  opacities = await response.json()
} catch (e) {
  console.error(e)
}

const floatInRange = (start, end) => start + random() * (end - start)

const makeSmokeSprite = (color = [255, 0.8, 0.2], size) => {
  const smokeSprite = document.createElement('canvas')
  const ctx = smokeSprite.getContext('2d')
  const imageData = ctx.createImageData(size, size)
  const { data } = imageData

  smokeSprite.width = size
  smokeSprite.height = size

  for (let i = 0; i < data.length; i += 4) {
    data[i] = color[0]
    data[i + 1] = color[1]
    data[i + 2] = color[2]
    data[i + 3] = opacities[i / 4]
  }

  ctx.putImageData(imageData, 0, 0)
  return smokeSprite
}

const createParticle = (x, y, options = {}) => {
  const { minVy, maxVy, minScale, maxScale, minVx, maxVx, minLifetime, maxLifetime } = options
  const startvy = floatInRange(minVy || -4 / 10, maxVy || -1 / 10)
  const scale = floatInRange(minScale || 0, maxScale || 0.5)

  return {
    x,
    y,
    vx: floatInRange(minVx || -4 / 100, maxVx || 4 / 100),
    startvy,
    scale,
    lifetime: floatInRange(minLifetime || 2000, maxLifetime || 8000),
    age: 0,
    vy: startvy,
    finalScale: floatInRange(
      minScale || 25 + scale,
      maxScale || 30 + scale
    )
  }
}

const updateParticle = (particle, deltatime) => {
  const frac = sqrt(particle.age / particle.lifetime)
  particle.x += particle.vx * deltatime
  particle.y += particle.vy * deltatime
  particle.vy = (1 - frac) * particle.startvy
  particle.age += deltatime
  particle.scale = frac * particle.finalScale
}

const drawParticle = (particle, smokeParticleImage, ctx) => {
  const { age, lifetime, scale, x, y } = particle
  const off = scale * smokeSpriteSize / 2
  const xmin = x - off
  const xmax = xmin + off * 2
  const ymin = y - off
  const ymax = ymin + off * 2

  ctx.globalAlpha = (1 - abs(1 - 2 * age / lifetime)) / 8
  ctx.drawImage(smokeParticleImage, xmin, ymin, xmax - xmin, ymax - ymin)
}

const SmokeMachine = (ctx, color) => {
  const smokeParticleImage = makeSmokeSprite(color, smokeSpriteSize)
  const { width, height } = ctx.canvas
  let lastframe = performance.now()
  const particles = []
  let preDraw = noop
  let running = false

  const updateAndDrawParticles = deltatime => {
    ctx.clearRect(0, 0, width, height)
    preDraw(deltatime, particles)

    for (const particle of particles) {
      updateParticle(particle, deltatime)
      if (particle.age < particle.lifetime) {
        drawParticle(particle, smokeParticleImage, ctx)
      }
    }
  }

  const loop = time => {
    if (!running) return
    const dt = time - lastframe
    lastframe = time

    updateAndDrawParticles(dt)
    raf(loop)
  }

  const addSmoke = (x, y, numParticles = 10, options) => {
    if (numParticles < 1) {
      return random() <= numParticles && particles.push(createParticle(x, y, options))
    }
    for (let i = 0; i < numParticles; i++) particles.push(createParticle(x, y, options))
  }

  const start = () => {
    running = true
    lastframe = performance.now()
    raf(loop)
  }

  return {
    step: (dt = 16) => updateAndDrawParticles(dt),
    start,
    setPreDraw: callback => (preDraw = callback),
    stop: () => (running = false),
    addSmoke
  }
}

export default SmokeMachine
