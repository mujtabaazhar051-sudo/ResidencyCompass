/**
 * Rewrites crowdsourced_outcomes in programs.json:
 *   - Removes all personal names (applicants and contacts)
 *   - Removes first-person action items ("Will signal", "Have to follow up", etc.)
 *   - Standardises outcome format: "Pakistani IMG (score, Signal) → II / matched"
 *   - Preserves ResMatch data, program requirements, and factual notes
 */

const fs   = require('fs')
const path = require('path')

const FILE = path.join(__dirname, '../src/data/programs.json')
const programs = JSON.parse(fs.readFileSync(FILE, 'utf8'))

// Map of program_code → clean crowdsourced_outcomes string
const CLEANED = {
  '1402521506': 'Pakistani IMG (236, Silver) → II. ResMatch IV median: 245 (n=7, range 235–260)',
  '1402511200': 'Dow grad (252) → matched.',
  '1404111375': 'Dow grad (239) → matched. Relatively few Pakistani graduates historically. ResMatch IV median: 250 (n=14, range 235–265)',
  '1402531202': 'Signal strongly preferred — program requires signal for interview consideration. ResMatch IV median: 250 (n=6, range 240–275)',
  '1403500931': 'Pakistani IMG (243, Gold) → II. Pakistani IMG (223, Gold) → II with recommendation. Pakistani IMG (245, Silver) → II. Program prefers applicants interested in primary care over fellowship. ResMatch IV median: 255 (n=17, range 220–270)',
  '1401600001': 'Previously accepted pre-match candidates. Signaling status each cycle may vary.',
  '1404121390': 'Pakistani IMG (242, Gold) → II with recommendation. Pakistani IMG (223, Silver) → II and matched. Residents from JSMU, DOW, AIMC. 3000+ applicants. Dow grads (217, 222, 225, 226, 242, 246, 246, 248) → matched.',
  '1403321498': 'ResMatch IV median: 260 (n=5, range 255–265)',
  '1403531255': 'Dow grads (242, 244, 247, 249) → matched. Score cutoff ~230+. Prefers applicants with research and USCE. Gold signal, no IV last cycle.',
  '1402512540': 'Pakistani IMG (244, Silver) → II. Mostly Indian graduates. ResMatch IV median: 260 (n=6, range 250–265)',
  '1402500912': 'Pakistani IMG (243, Silver) → II. Pakistani IMG (244, Silver) → II. Decent number of Pakistani graduates. ResMatch IV median: 250 (n=3, range 245–260)',
  '1401100928': 'Dow grad (248) → matched. ResMatch IV median: 250 (n=4, range 250–250)',
  '1403521251': 'Pakistani IMG (249) → II. Pakistani IMG (240, Silver) → II. Pakistani IMG (245, Gold) → matched. Pakistani IMG (244, Gold) → II. Pakistani IMG (245, Gold) → II. Pakistani IMG (250, Gold) → II. IMG and Pakistani-heavy. IVs heavily reliant on signals. Dow grads (235, 239) → matched.',
  '1403521487': 'Pakistani IMG (242, Silver) → II. Pakistani IMG (243, Gold) → II. Pakistani IMG (244, Silver) → II. Program Step 1 median: 231; Step 2 CK median: 237. Dow grad (236) → matched.',
  '1405511438': 'Pakistani IMG (245, Silver) → II. Many residents from DMC and AKU. All applicants should signal. Step 2 median ~250. Dow grads (239, 248) → matched.',
  '1402500915': 'SOAPed last cycle. Program future uncertain.',
  '1402521195': 'Signals not critical per program feedback.',
  '1401021461': 'Pakistani IMG (240) → II without signal. Pakistani IMG (230) → II with recommendation. No signaling required per program policy. Dow grad (243) → matched. ResMatch IV median: 245 (n=11, range 235–260)',
  '1402521199': 'Website states cutoff 250 but IVing candidates in 240s range. ResMatch IV median: 255 (n=4, range 230–265)',
  '1402500927': 'KEMU graduates present. Mostly US graduates. ResMatch IV median: 260 (n=1, range 260–260)',
  '1401200006': 'Pakistani IMG (242, Gold) → II. Pakistani IMG (250) → II without signal. New program. ResMatch IV median: 265 (n=2, range 260–265)',
  '1404100003': 'New program. Limited data available.',
  '1403521520': 'Dow grads (240, 241, 247) → matched. Many IMGs — visa requirement status unclear. ResMatch IV median: 250 (n=5, range 245–260)',
  '1402321161': 'Pakistani IMG (223, Silver) → II. Pakistani IMG (244, no visa) → II. ResMatch IV median: 245 (n=2, range 225–245)',
  '1402631207': 'Pakistani IMG (230, Gold) → II with recommendation. Pakistani IMG (243, Silver) → II. Program only reviews signaled applicants — signal required.',
  '1403400248': 'Pakistani IMG (240, Silver) → II. Reported as a moderate-applicant-volume program.',
  '1402300001': 'Many Pakistani and Dow graduates. Dow grads (219, 235, 238, 239, 247, 250) → matched.',
  '1400100902': 'Pakistani IMG (242) → II. New program — may extend more IVs. ResMatch IV median: 250 (n=3, range 225–250)',
  '1402511203': 'Pakistani IMG → II. No Pakistani graduates visible on resident roster. ResMatch IV median: 265 (n=4, range 250–265)',
  '1402512186': 'ResMatch IV median: 255 (n=4, range 250–260)',
  '1401100938': 'Pakistani IMG (245, Silver) → II. Dow grad (243) → matched. ResMatch IV median: 250 (n=7, range 240–270)',
  '1400100003': 'Pakistani IMG (243, Silver) → II. Pakistani IMG (254, Gold) → II with recommendation. Pakistani-heavy program. ResMatch IV median: 250 (n=2, range 235–250)',
  '1403021222': 'Pakistani IMG (245, Silver) → II in Rural Track. Pakistani IMG (250) → II in both standard and rural tracks. Dow grads (236, 240) → matched.',
  '1404800012': 'Pakistani IMG (236) → II without signal. New program. ResMatch IV median: 250 (n=4, range 235–250)',
  '1400831077': 'Dow grads (240, 248) → matched. ResMatch IV median: 245 (n=4, range 235–250)',
  '1401100005': 'Pakistani IMG (230, Gold) → II. New program — IMG acceptance may vary by cycle. Signals preferred. ResMatch IV median: 255 (n=8, range 225–270)',
  '1402131543': 'Pakistani IMG (246) → II without signal. Residents mostly Indian graduates.',
  '1404300001': 'Pakistani IMG (245, Silver) → II. Many IMGs, several from KEMU. 1 Dow graduate. ResMatch IV median: 260 (n=22, range 240–270)',
  '1401700002': 'Program preferentially reviews signaled applicants — 100% signaling rate. Dow grads (224, 238, 245) → matched.',
  '1402300491': 'Program preferentially reviews signaled applicants but also considers unsignaled. Dow grad (243) → matched. ResMatch IV median: 250 (n=8, range 220–265)',
  '1405631444': 'Pakistani-heavy program, prefers Gold then Silver signals. Requires minimum 4 months hands-on USCE. ResMatch IV median: 260 (n=5, range 235–265)',
  '1403511273': '1 Dow graduate. Mostly from Allama Iqbal and KEMU. 7000+ applicants. Dow grads (231, 242) → matched. ResMatch IV median: 245 (n=8, range 220–260)',
  '1403521316': 'Pakistani IMG (245, Gold) → matched. Program reviews only signaled applicants. Highly competitive. ResMatch IV median: 255 (n=21, range 240–270)',
  '1403500003': 'Pakistani IMG (242, Gold) → II. 1 Dow graduate. New program. Limited public data. 6 positions. ResMatch IV median: 260 (n=1, range 260–260)',
  '1403511283': 'Pakistani IMG (244, Gold) → II with recommendation. 36 PGY-1 positions. ResMatch IV median: 250 (n=16, range 235–265)',
  '1403800004': 'Pakistani IMG (240, Gold) → II. New program. ResMatch IV median: 250 (n=4, range 240–255)',
  '1403800536': 'Pakistani IMG (245, Silver) → II. 5 PGY-1 positions.',
  '1403121497': 'Pakistani IMG (244) → II with recommendation, no signal. Few yearly applications, 29 PGY-1 positions. ResMatch IV median: 255 (n=6, range 235–270)',
  '1402511191': 'Very high scores on ResidencyMatch. Dow grad (242) → matched. ResMatch IV median: 265 (n=8, range 255–270)',
  '1402121148': 'Average Step 2 range 245–270. Applications reviewed holistically — strong PS, well-rounded CV, publications, 4–6 months USCE, and a program contact recommended. Monthly letters of interest advised. Dow grads (231, 243, 244) → matched.',
  '1403500922': 'Dow grads (222, 238, 238, 240, 240) → matched. Many Pakistani graduates. Two chief residents. ResMatch IV median: 255 (n=5, range 235–260)',
  '1401100008': 'Pakistani IMG (244, Silver) → II with recommendation. ResMatch IV median: 245 (n=2, range 240–245)',
  '1404700004': 'New program. Mostly interviewing candidates scoring 245+. Dow graduate participate in meet-and-greet sessions.',
  '1400100001': 'Pakistani IMG (254, Gold) → II with recommendation. ResMatch IV median: 240 (n=11, range 230–255)',
  '1400100901': 'Many IMGs. Dow grad (227) → matched. ResMatch IV median: 245 (n=4, range 235–250)',
  '1400300004': 'Pakistani IMG (250) → II without signal. Pakistani IMG (249, Silver) → II. New program. 3 Pakistani graduates. ResMatch IV median: 235 (n=6, range 215–270)',
  '1404800007': 'Pakistani IMG (250, Gold) → II. ResMatch IV median: 250 (n=5, range 250–260)',
  '1404800001': 'Many KEMU and Liaquat graduates. Pakistani IMG (249) → II. Dow grads (229, 247) → matched. ResMatch IV median: 260 (n=5, range 255–270)',
  '1400813530': 'ResMatch IV median: 255 (n=4, range 250–255)',
  '1400900091': 'Pakistani IMG (252) → II without signal. Resident roster mostly DOs. ResMatch IV median: 250 (n=2, range 240–250)',
  '1401200004': 'Program values LORs from attendings during sub-internships/externships. 2 non-visa-requiring Dow grads → II. Dow grad (243) → matched. ResMatch IV median: 240 (n=1, range 240–240)',
  '1401100952': 'ResMatch IV median: 245 (n=1, range 245–245)',
  '1402421177': 'Pakistani graduate (CMH) → matched. Step 1 average ~220, Step 2 ~77th percentile. ResMatch IV median: 255 (n=17, range 220–270)',
  '1402312157': 'Dow grad (240) → matched. ResMatch IV median: 250 (n=14, range 220–260)',
  '1404111381': 'Mostly Shifa graduates. Stated cutoff ~230, actual likely higher. Signals preferred.',
  '1404112389': 'Dow grad (229) → matched. ResMatch IV median: 250 (n=4, range 245–265)',
  '1404100912': 'Pakistani IMG (252, Silver) → II and matched. Pakistani IMG (250, Gold) → II. Mostly interviewing high scorers. Dow grad (244) → matched. ResMatch IV median: 265 (n=4, range 240–270)',
  '1404331401': 'One Pakistani graduate annually, primarily from Ziauddin. ResMatch IV median: 240 (n=9, range 235–250)',
}

let updated = 0
if (require.main === module) {
  programs.forEach(p => {
    if (CLEANED[p.program_code] !== undefined) {
      p.crowdsourced_outcomes = CLEANED[p.program_code]
      updated++
    }
  })

  fs.writeFileSync(FILE, JSON.stringify(programs, null, 2))
  console.log(`✓ Updated ${updated} programs. Saved to ${FILE}`)
}

module.exports = { CLEANED }
