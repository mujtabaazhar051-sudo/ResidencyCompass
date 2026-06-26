/**
 * Second pass: cleans remaining entries with personal names found in lines 1500+
 */

const fs   = require('fs')
const path = require('path')

const FILE = path.join(__dirname, '../src/data/programs.json')
const programs = JSON.parse(fs.readFileSync(FILE, 'utf8'))

const CLEANED = {
  // Advocate Illinois Masonic - Hassan Ahmed
  '1401611114': 'Pakistani IMG (240, Gold) → II. 7000+ applications.',
  // Rochester Regional/Unity - Sameer Garlapati
  '1403531527': 'Pakistani IMG (242) → II. Many Pakistani and Middle Eastern graduates. IVs heavily reliant on signals. ResMatch IV median: 260 (n=3, range 245–260)',
  // Montefiore Wakefield - Adila Afzal
  '1403521285': 'Pakistani IMG (246) → II with recommendation. Many Pakistani graduates. 7000+ applications. ResMatch IV median: 255 (n=5, range 240–270)',
  // BronxCare - Deedar, Anooja
  '1403511263': 'Pakistani IMG (244) → II without signal. Pakistani IMG (250) → II without signal. 40 PGY-1 positions.',
  // One Brooklyn/Interfaith - Yumna
  '1403521276': 'Pakistani IMG (243, Silver) → II. Prematch program. Multiple contact emails on website — LOIs with cc recommended.',
  // Brooklyn Hospital Center - personal action item
  '1403512265': '32 PGY-1 positions. ResMatch IV median: 255 (n=8, range 235–260)',
  // St Vincent Hospital MA - Sameer Garlapati
  '1402411183': 'Pakistani IMG (242) → II. ResMatch IV median: 260 (n=18, range 230–270)',
  // Mercy ST Vincent Toledo - Ramsha
  '1403812533': 'Pakistani IMG (242, Gold) → II. Many IMGs. Not many Pakistani graduates. H-1B preferred; J-1 offered on very limited case-by-case basis. H-1B premium processing at applicant expense. Dow grad (248) → matched. ResMatch IV median: 250 (n=2, range 240–250)',
  // Canton/NEOMED - Hira Majid
  '1403821330': 'DIMC graduate → matched (US citizen). Many IMGs. 6000+ applicants. ResMatch IV median: 260 (n=1, range 260–260)',
  // Marshall Community Health - personal action item
  '1403800001': 'New rural program. Limited data available.',
  // Corewell Grand Rapids - Javeria Hayat
  '1402531198': 'Pakistani graduate matched. ResMatch IV median: 260 (n=3, range 245–265)',
  // Hurley Medical/MSU - [contact]h Hussain
  '1402531196': 'Step 2 median 255 on ResidencyMatch. ResMatch IV median: 255 (n=9, range 230–275)',
  // Detroit Medical/Wayne State main campus - [contact] placeholders
  '1402521194': 'ResMatch IV median: 255 (n=9, range 230–275)',
  // Broward Health North - Omaise signaled, no IV
  '1401100001': 'Pakistani IMG (240, Gold signal) → no IV. Mostly Caribbean graduates. 2 Pakistani graduates. ResMatch IV median: 230 (n=1, range 230–230)',
  // Cape Fear Valley - Omaise signaled, no IV
  '1403600328': 'Pakistani IMG (Gold signal) → no IV. Resident roster not visible. ResMatch IV median: 250 (n=4, range 230–250)',
  // St. Francis Medical Center LA - Bayan Zafar, Owais, Hira Chohan
  '1402100002': 'Pakistani IMG (246, no visa required) → II. Pakistani IMG (261) → II without signal. Pakistani IMG (250) → II without signal. ResMatch IV median: 260 (n=4, range 255–260)',
  // Cleveland Clinic/Fairview - Syed Saad Ali
  '1403821340': 'Pakistani IMG (249) → II. Very few Pakistani and Indian graduates. ResMatch IV median: 260 (n=5, range 240–260)',
  // St Elizabeth Youngstown - personal comment
  '1403811349': 'Cannot confirm matched applicants from resident page. ResidencyMatch shows median of 249. ResMatch IV median: 245 (n=1, range 245–245)',
  // Louis A Weiss Memorial - Hassan Ahmed
  '1401611115': 'Pakistani IMG (240) → II without signal. Minimum ~240 for IV consideration.',
  // Tulane - Dr. Usama Ghafoor (faculty name)
  '1402121147': 'Program preferentially reviews signaled applicants but also considers unsignaled. Prefers 1 year US clinical experience. Dow grad (252) → matched. ResMatch IV median: 260 (n=4, range 240–270)',
  // Arkansas College/Hunt Regional TX - Rameen Shahid
  '1404800014': 'DIMC graduate → matched. ResMatch IV median: 265 (n=2, range 255–265)',
  // UT Rio Grande Valley - Dr. Asim Elahi (social media post)
  '1404800005': 'New program. ResMatch IV median: 240 (n=2, range 220–240)',
  // Medical University SC Lancaster - "Saw it on linkedin"
  '1404500003': 'ResMatch IV median: 245 (n=12, range 225–260)',
  // Carle Foundation - personal comment "Which is good. Can make up for it on CV"
  '1401600931': 'Not participating in signals. ResidencyMatch median 268. ResMatch IV median: 260 (n=7, range 260–270)',
  // Corewell Dearborn - "One girl form Shifa" + personal comment
  '1402531188': 'Shifa graduate present. Mostly Middle Eastern residents. Strong connection recommended before applying. ResMatch IV median: 255 (n=8, range 250–255)',
}

let updated = 0
programs.forEach(p => {
  if (CLEANED[p.program_code] !== undefined) {
    p.crowdsourced_outcomes = CLEANED[p.program_code]
    updated++
  }
})

fs.writeFileSync(FILE, JSON.stringify(programs, null, 2))
console.log(`✓ Updated ${updated} programs. Saved.`)
