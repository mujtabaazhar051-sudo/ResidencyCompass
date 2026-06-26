/**
 * Pulls Internal Medicine IV-invite and match posts from residencymatch.net.
 *
 * Uses the site's own API (discovered via Playwright request interception).
 * Output: scripts/rm_data.json — per-program Step 2 statistics
 *
 * Run:  node scripts/scrapeResidencyMatch.js
 * Then: node scripts/mergeResidencyMatch.js
 */

import { chromium } from 'playwright'
import { writeFileSync, readFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const BASE  = 'https://resmatch-v2-bd2b9aea342e.herokuapp.com'
const SITE  = 'https://residencymatch.net'
const LIMIT = 500    // max records per request
const DELAY = 300    // ms between pages

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// ── Phase 1: capture exact request template via Playwright ───────────────────
async function captureTemplate() {
  // Cache the template so we don't need the browser after the first run
  const cache = join(__dirname, 'rm_template.json')
  if (existsSync(cache)) {
    console.log('Using cached request template.')
    return JSON.parse(readFileSync(cache, 'utf-8'))
  }

  console.log('Launching browser to capture API request template…')
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
  })

  let template = null
  context.on('request', (req) => {
    const url = req.url()
    if (!template && (url.includes('/posts/search') || url.includes('/posts/read'))) {
      template = {
        url,
        method:   req.method(),
        headers:  req.headers(),
        postData: req.postData(),
      }
      console.log(`  Captured: ${req.method()} ${url}`)
    }
  })

  const page = await context.newPage()
  await page.goto(`${SITE}/internal-medicine/interview-invites/invites`, {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  })
  await page.waitForTimeout(5000)
  await browser.close()

  if (!template) throw new Error('Failed to capture a posts/search request from the browser.')

  writeFileSync(cache, JSON.stringify(template, null, 2))
  return template
}

// ── Phase 2: fetch all pages for a given postType ────────────────────────────
async function fetchPostType(template, postType) {
  const baseHeaders = { ...template.headers, 'content-type': 'application/json' }
  delete baseHeaders['content-length']

  let bodyTemplate = {}
  if (template.postData) {
    try { bodyTemplate = JSON.parse(template.postData) } catch {}
  }

  const records = []
  let skip = 0
  let totalRows = null

  console.log(`\nFetching ${postType} posts…`)

  while (true) {
    const body = {
      ...bodyTemplate,
      request: {
        ...bodyTemplate.request,
        startRow: skip,
        endRow:   skip + LIMIT,
      },
      skip,
      take:     LIMIT,
      postType,
    }

    process.stdout.write(`  [${postType}] skip=${skip}`)
    if (totalRows !== null) process.stdout.write(`/${totalRows}`)
    process.stdout.write(' … ')

    const res = await fetch(template.url, {
      method:  template.method || 'POST',
      headers: baseHeaders,
      body:    JSON.stringify(body),
    })

    if (!res.ok) { console.log(`HTTP ${res.status} — stopping`); break }

    const data = await res.json()
    const rows = Array.isArray(data) ? data : (data?.rowData ?? data?.data ?? [])
    if (data?.totalRows && totalRows === null) totalRows = data.totalRows

    console.log(`${rows.length} rows${totalRows ? ' (total=' + totalRows + ')' : ''}`)
    if (!rows.length) break
    records.push(...rows)

    // Stop if we've read everything
    if (totalRows && records.length >= totalRows) break
    if (rows.length < LIMIT) break

    skip += LIMIT
    await sleep(DELAY)
  }

  return records
}

// ── Statistics ────────────────────────────────────────────────────────────────
function stats(arr) {
  if (!arr.length) return null
  const sorted = [...arr].sort((a, b) => a - b)
  return {
    count:  arr.length,
    median: sorted[Math.floor(sorted.length / 2)],
    avg:    Math.round(arr.reduce((s, v) => s + v, 0) / arr.length),
    p25:    sorted[Math.floor(sorted.length * 0.25)],
    p75:    sorted[Math.floor(sorted.length * 0.75)],
    min:    sorted[0],
    max:    sorted[sorted.length - 1],
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const template = await captureTemplate()
  console.log(`\nTemplate: ${template.method} ${template.url}`)

  const ivPosts    = await fetchPostType(template, 'interviewInvite')
  const matchPosts = await fetchPostType(template, 'match')
  const allPosts   = [...ivPosts, ...matchPosts]

  console.log(`\nTotal posts: ${allPosts.length} (${ivPosts.length} IV invites + ${matchPosts.length} matches)`)

  // ── Aggregate by program ────────────────────────────────────────────────────
  const map = {}

  for (const rec of allPosts) {
    const prog = rec?.post?.program
    if (!prog) continue

    const name  = (prog.programName || prog.globalProgramName || '').trim()
    const state = prog.city?.state || ''
    if (!name) continue
    const key = name.toLowerCase()

    if (!map[key]) {
      map[key] = {
        program_name: name, state,
        all: [], iv: [], match: [], img: [], nonUsImg: [],
        gold: 0, silver: 0, noSignal: 0,
      }
    }

    const p     = map[key]
    const score = typeof rec.step2Score === 'number' ? rec.step2Score : null
    const type  = rec?.post?.postType
    const isImg = ['IMG', 'USIMG', 'NONUSIMG'].includes(rec.graduateType) ||
                  ['USIMG', 'NONUSIMG'].includes(rec.img)

    if (score && score >= 180 && score <= 290) {
      p.all.push(score)
      if (type === 'interviewInvite') p.iv.push(score)
      if (type === 'match')           p.match.push(score)
      if (isImg)                      p.img.push(score)
      if (rec.img === 'NONUSIMG')     p.nonUsImg.push(score)
    }

    if (rec.signalTier === 'GOLD')              p.gold++
    else if (rec.signalTier === 'SILVER')       p.silver++
    else if (rec.signalTier === 'NO_SIGNAL')    p.noSignal++
  }

  const out = Object.values(map)
    .filter((p) => p.all.length > 0)
    .map((p) => ({
      program_name:   p.program_name,
      state:          p.state,
      overall:        stats(p.all),
      iv_invites:     stats(p.iv),
      matches:        stats(p.match),
      img_overall:    stats(p.img),
      non_us_img:     stats(p.nonUsImg),
      signals:        { gold: p.gold, silver: p.silver, no_signal: p.noSignal },
    }))
    .sort((a, b) => (b.overall?.count || 0) - (a.overall?.count || 0))

  const outPath = join(__dirname, 'rm_data.json')
  writeFileSync(outPath, JSON.stringify(out, null, 2))

  console.log(`\n✓ rm_data.json — ${out.length} programs`)
  console.log('\n  Top 15 IM programs by data volume:')
  out.slice(0, 15).forEach((p) => {
    const iv = p.iv_invites
    const m  = p.matches
    console.log(`    ${p.program_name.padEnd(45)} iv_med=${iv?.median ?? '–'}  match_med=${m?.median ?? '–'}  n=${p.overall.count}`)
  })

  console.log('\nNext step: node scripts/mergeResidencyMatch.js')
}

main().catch((err) => {
  console.error('Fatal:', err.message)
  process.exit(1)
})
