/**
 * Recrop tight headshots (Aimal, Aieman) and export the Instagram team carousel.
 * Slide 1 = Meet the team intro; slides 2–9 = one person each.
 * Run: node scripts/exportInstagramTeam.js
 */
import sharp from 'sharp'
import { mkdirSync, readFileSync, readdirSync, unlinkSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PUBLIC = join(__dirname, '..', 'public')
const TEAM_SRC = join(__dirname, '..', 'team')
const TEAM_OUT = join(PUBLIC, 'team')
const OUT = join(PUBLIC, 'social-hd')
mkdirSync(OUT, { recursive: true })

const svgRaw = readFileSync(join(PUBLIC, 'favicon.svg'), 'utf8')

const MEMBERS = [
  { id: 'mujtaba-azhar', name: 'Mujtaba Azhar', role: 'Founder & Product Lead', school: 'DIMC', photo: 'mujtaba-azhar.jpg', src: 'Mujtaba Azhar Siddiqui.jpg', position: 'centre' },
  { id: 'mohammad-ahmed', name: 'Mohammud Wajeeh Ahmud', role: 'Co-founder & Operations Lead', school: 'DIMC', photo: 'mohammad-ahmed.jpg', src: 'Mohammud Wajeeh.jpeg', position: 'centre' },
  { id: 'waqas-ali', name: 'Muhammad Waqas Ali', role: 'Head of Program Data', school: 'Ameer-ud-Din Medical College', photo: 'waqas-ali.jpg', src: 'Waqas Ali.jpg', position: 'centre' },
  { id: 'aieman-naeem', name: 'Aieman Naeem', role: 'Program Data Specialist', school: 'Rawalpindi Medical University', photo: 'aieman-naeem.jpg', src: 'Aieman Naeem.png', position: 'north', padTop: 0.16 },
  { id: 'naima-agha', name: 'Naima Agha', role: 'Program Research Analyst', school: 'Foundation University Medical College', photo: null, src: null, position: 'centre', hideIdentity: true },
  { id: 'aimal-waqas', name: 'Aimal Waqas', role: 'Match Insights Analyst', school: 'Foundation University Medical College', photo: 'aimal-waqas.jpg', src: 'Aimal Waqas.png', position: 'north' },
  { id: 'zoya-tariq', name: 'Zoya Tariq', role: 'Community Growth Lead', school: 'Shalamar Medical and Dental College', photo: 'zoya-tariq.jpg', src: 'Zoya Imran.jpeg', position: 'centre' },
  { id: 'usama-idrees', name: 'Usama Idrees', role: 'Digital Outreach Lead', school: 'KMSMC Sialkot', photo: null, src: null, position: 'centre' },
]

function escapeXml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function initials(name) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('')
}

async function renderSiteLogo(size) {
  const wrapped = svgRaw.replace(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"',
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64"`,
  )
  return sharp(Buffer.from(wrapped)).png().toBuffer()
}

async function squareFromSource(srcPath, size, position, padTop = 0) {
  const rotated = await sharp(srcPath).rotate().toBuffer()
  let input = rotated
  if (padTop) {
    const { width, height } = await sharp(rotated).metadata()
    const top = Math.round((width || height) * padTop)
    input = await sharp(rotated)
      .extend({
        top,
        bottom: 0,
        left: 0,
        right: 0,
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .toBuffer()
  }
  return sharp(input)
    .resize(size, size, { fit: 'cover', position: position || 'centre' })
    .png()
    .toBuffer()
}

async function cropHeadshot(srcName, destName, position, padTop = 0) {
  const square = await squareFromSource(join(TEAM_SRC, srcName), 640, position, padTop)
  await sharp(square).jpeg({ quality: 84, mozjpeg: true }).toFile(join(TEAM_OUT, destName))
}

async function circleFromFile(srcPath, size, position, padTop = 0) {
  const mask = Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
  <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#fff"/>
</svg>`)
  const img = await squareFromSource(srcPath, size, position, padTop)
  return sharp(img)
    .composite([{ input: await sharp(mask).png().toBuffer(), blend: 'dest-in' }])
    .png()
    .toBuffer()
}

async function initialsAvatar(name, size) {
  const svg = Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
  <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#1e3a5f"/>
  <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 6}" fill="none" stroke="#10b981" stroke-width="4"/>
  <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" fill="#ffffff"
    font-family="Arial, Helvetica, sans-serif" font-size="${Math.round(size * 0.28)}" font-weight="700">${initials(name)}</text>
</svg>`)
  return sharp(svg).png().toBuffer()
}

async function roundedLogo(box) {
  const logo = await renderSiteLogo(Math.round(box * 0.82))
  const onWhite = await sharp({
    create: { width: box, height: box, channels: 3, background: { r: 255, g: 255, b: 255 } },
  })
    .composite([{ input: logo, gravity: 'centre' }])
    .png()
    .toBuffer()
  const rounded = Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${box}" height="${box}">
  <rect width="${box}" height="${box}" rx="20" fill="#fff"/>
</svg>`)
  return sharp(onWhite)
    .composite([{ input: await sharp(rounded).png().toBuffer(), blend: 'dest-in' }])
    .png()
    .toBuffer()
}

const SIZE = 1080
const TOTAL = MEMBERS.length + 1
const logoBox = 96
const logoRounded = await roundedLogo(logoBox)
const avatar = 420
const previewSize = 88
const previewGap = 16
const previewRowW = MEMBERS.length * previewSize + (MEMBERS.length - 1) * previewGap
const previewLeft = Math.round((SIZE - previewRowW) / 2)
const previewTop = 768

for (const file of readdirSync(OUT)) {
  if (file.startsWith('instagram-team-') && file.endsWith('.png')) {
    unlinkSync(join(OUT, file))
  }
}

async function avatarFor(m, size) {
  return m.src
    ? circleFromFile(join(TEAM_SRC, m.src), size, m.position, m.padTop)
    : initialsAvatar(m.name, size)
}

const cover = Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}">
  <defs>
    <radialGradient id="glow" cx="88%" cy="8%" r="52%">
      <stop offset="0%" stop-color="#10b981" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="#0f1e32" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${SIZE}" height="${SIZE}" fill="#0f1e32"/>
  <rect width="${SIZE}" height="${SIZE}" fill="url(#glow)"/>
  <text x="176" y="98" fill="#34d399" font-family="Arial, Helvetica, sans-serif"
    font-size="20" font-weight="700" letter-spacing="3">RESIDENCYCOMPASS</text>
  <text x="72" y="168" fill="#94a3b8" font-family="Arial, Helvetica, sans-serif"
    font-size="22" font-weight="600">Meet the team  ·  1/${TOTAL}</text>
  <text x="72" y="268" fill="#ffffff" font-family="Arial, Helvetica, sans-serif"
    font-size="62" font-weight="700">Meet the team</text>
  <text x="72" y="328" fill="#cbd5e1" font-family="Arial, Helvetica, sans-serif"
    font-size="26" font-weight="500">Pakistani IMGs building a clearer way</text>
  <text x="72" y="364" fill="#cbd5e1" font-family="Arial, Helvetica, sans-serif"
    font-size="26" font-weight="500">to explore U.S. Internal Medicine</text>
  <text x="72" y="400" fill="#cbd5e1" font-family="Arial, Helvetica, sans-serif"
    font-size="26" font-weight="500">programs — with an eye toward mutual fit.</text>

  <rect x="72" y="448" width="936" height="80" rx="18" fill="#15263d"/>
  <text x="104" y="498" fill="#34d399" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="700">8</text>
  <text x="140" y="498" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="600">teammates across leadership, data, and outreach</text>

  <rect x="72" y="544" width="936" height="80" rx="18" fill="#15263d"/>
  <text x="104" y="594" fill="#34d399" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="700">+</text>
  <text x="140" y="594" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="600">Free to explore  ·  built for Pakistani IMGs</text>

  <rect x="72" y="640" width="936" height="80" rx="18" fill="#15263d"/>
  <text x="104" y="690" fill="#34d399" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="700">→</text>
  <text x="140" y="690" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="600">Swipe to meet everyone</text>

  <rect x="400" y="980" width="280" height="5" rx="3" fill="#10b981"/>
  <text x="540" y="1028" text-anchor="middle" fill="#94a3b8"
    font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="500">residency-compass.vercel.app</text>
</svg>`)

const coverComposites = [{ input: logoRounded, left: 64, top: 48 }]
for (let i = 0; i < MEMBERS.length; i++) {
  coverComposites.push({
    input: await avatarFor(MEMBERS[i], previewSize),
    left: previewLeft + i * (previewSize + previewGap),
    top: previewTop,
  })
}

const coverPath = join(OUT, 'instagram-team-01-meet.png')
await sharp(cover).png().composite(coverComposites).toFile(coverPath)
console.log(`✓ ${coverPath}`)

for (let i = 0; i < MEMBERS.length; i++) {
  const m = MEMBERS[i]
  const n = i + 2
  const title = m.hideIdentity ? initials(m.name) : m.name
  const role = m.hideIdentity ? '' : m.role
  const school = m.hideIdentity ? '' : m.school
  const overlay = Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}">
  <defs>
    <radialGradient id="glow" cx="88%" cy="8%" r="52%">
      <stop offset="0%" stop-color="#10b981" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="#0f1e32" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${SIZE}" height="${SIZE}" fill="#0f1e32"/>
  <rect width="${SIZE}" height="${SIZE}" fill="url(#glow)"/>
  <text x="176" y="98" fill="#34d399" font-family="Arial, Helvetica, sans-serif"
    font-size="20" font-weight="700" letter-spacing="3">RESIDENCYCOMPASS</text>
  <text x="72" y="168" fill="#94a3b8" font-family="Arial, Helvetica, sans-serif"
    font-size="22" font-weight="600">Meet the team  ·  ${n}/${TOTAL}</text>
  <text x="540" y="780" text-anchor="middle" fill="#ffffff"
    font-family="Arial, Helvetica, sans-serif" font-size="42" font-weight="700">${escapeXml(title)}</text>
  <text x="540" y="834" text-anchor="middle" fill="#34d399"
    font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="600">${escapeXml(role)}</text>
  <text x="540" y="878" text-anchor="middle" fill="#94a3b8"
    font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="500">${escapeXml(school)}</text>
  <rect x="400" y="980" width="280" height="5" rx="3" fill="#10b981"/>
  <text x="540" y="1028" text-anchor="middle" fill="#94a3b8"
    font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="500">residency-compass.vercel.app</text>
</svg>`)

  const photoBuf = await avatarFor(m, avatar)
  const filename = join(OUT, `instagram-team-${String(n).padStart(2, '0')}-${m.id}.png`)
  await sharp(overlay)
    .png()
    .composite([
      { input: logoRounded, left: 64, top: 48 },
      { input: photoBuf, left: Math.round((SIZE - avatar) / 2), top: 230 },
    ])
    .toFile(filename)
  console.log(`✓ ${filename}`)
}

console.log(`\nCarousel: ${TOTAL} slides in public/social-hd/instagram-team-01-meet.png … 0${TOTAL}`)
