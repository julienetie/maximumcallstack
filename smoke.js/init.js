import smokemachine from './smoke.js'

const { innerWidth, innerHeight } = window
const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')
canvas.width = innerWidth
canvas.height = innerHeight

const party = smokemachine(ctx, [18, 16, 54])

party.start()

party.setPreDraw(dt => {
  party.addSmoke(innerWidth / 2, innerHeight, 0.5)
  canvas.width = innerWidth
  canvas.height = innerHeight
})

document.addEventListener('mousemove', e => {
  party.addSmoke(
    e.clientX,
    e.clientY,
    0.5
  )
})
