/** Pakistani medical universities / colleges — grouped by province for dropdown optgroups. */

export const PAK_MEDICAL_SCHOOL_GROUPS = [
  {
    province: 'Sindh',
    schools: [
      { value: 'aku', label: 'Aga Khan University (AKU), Karachi' },
      { value: 'dow', label: 'Dow University of Health Sciences (DUHS), Karachi' },
      { value: 'dimc', label: 'Dow International Medical College (DIMC), Karachi' },
      { value: 'jsmu', label: 'Jinnah Sindh Medical University (JSMU), Karachi' },
      { value: 'lumhs', label: 'Liaquat University of Medical & Health Sciences (LUMHS), Jamshoro' },
      { value: 'pumhsw', label: "People's University of Medical & Health Sciences for Women (PUMHSW), Nawabshah" },
      { value: 'kmdc', label: 'Karachi Medical & Dental College (KMDC), Karachi' },
      { value: 'jpmc', label: 'Jinnah Postgraduate Medical Centre (JPMC) / Jinnah Medical College, Karachi' },
    ],
  },
  {
    province: 'Punjab',
    schools: [
      { value: 'kemu', label: 'King Edward Medical University (KEMU), Lahore' },
      { value: 'uhs', label: 'University of Health Sciences (UHS), Lahore' },
      { value: 'fmu', label: 'Faisalabad Medical University (FMU), Faisalabad' },
      { value: 'nmu', label: 'Nishtar Medical University (NMU), Multan' },
      { value: 'rmu', label: 'Rawalpindi Medical University (RMU), Rawalpindi' },
      { value: 'fjmu', label: 'Fatima Jinnah Medical University (FJMU), Lahore' },
      { value: 'nums', label: 'Army Medical College (AMC) / NUMS, Rawalpindi' },
    ],
  },
  {
    province: 'Khyber Pakhtunkhwa',
    schools: [
      { value: 'kmu', label: 'Khyber Medical University (KMU), Peshawar' },
      { value: 'kmc', label: 'Khyber Medical College (KMC), Peshawar' },
      { value: 'ayub', label: 'Ayub Medical College, Abbottabad' },
    ],
  },
  {
    province: 'Balochistan & Islamabad',
    schools: [
      { value: 'bumhs', label: 'Bolan University of Medical and Health Sciences (BUMHS), Quetta' },
      { value: 'szabmu', label: 'Shaheed Zulfiqar Ali Bhutto Medical University (SZABMU), Islamabad' },
      { value: 'shifa', label: 'Shifa Tameer-e-Millat University / Shifa College of Medicine, Islamabad' },
    ],
  },
]

export const MED_SCHOOL_OTHER_PAK = { value: 'other_pak', label: 'Other Pakistani medical school' }
export const MED_SCHOOL_OTHER_IMG = { value: 'other_img', label: 'Other IMG (non-Pakistani)' }

export const PAK_MEDICAL_SCHOOLS = PAK_MEDICAL_SCHOOL_GROUPS.flatMap((g) => g.schools)

const LABEL_BY_VALUE = Object.fromEntries([
  ...PAK_MEDICAL_SCHOOLS.map((s) => [s.value, s.label]),
  [MED_SCHOOL_OTHER_PAK.value, MED_SCHOOL_OTHER_PAK.label],
  [MED_SCHOOL_OTHER_IMG.value, MED_SCHOOL_OTHER_IMG.label],
])

/** Used internally for school-specific pathway weighting in scoring. */
const DOW_MEDICAL_SCHOOL_IDS = new Set(['dow', 'dimc'])

export function isDowMedicalSchool(value) {
  return DOW_MEDICAL_SCHOOL_IDS.has(value)
}

export function getMedicalSchoolLabel(value) {
  if (!value) return ''
  return LABEL_BY_VALUE[value] || value
}

export function getMedicalSchoolShortLabel(value) {
  const full = getMedicalSchoolLabel(value)
  if (!full) return ''
  const paren = full.indexOf(' (')
  return paren > 0 ? full.slice(0, paren) : full
}
