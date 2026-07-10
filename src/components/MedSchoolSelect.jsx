import {
  MED_SCHOOL_OTHER_IMG,
  MED_SCHOOL_OTHER_PAK,
  PAK_MEDICAL_SCHOOL_GROUPS,
} from '../constants/pakMedicalSchools'

const INPUT_CLASS =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100'

export default function MedSchoolSelect({
  value,
  onChange,
  includeOtherImg = false,
  className = INPUT_CLASS,
  id,
  name,
}) {
  return (
    <select
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      className={className}
    >
      <option value="">Select your medical school…</option>
      {PAK_MEDICAL_SCHOOL_GROUPS.map((group) => (
        <optgroup key={group.province} label={group.province}>
          {group.schools.map((school) => (
            <option key={school.value} value={school.value}>
              {school.label}
            </option>
          ))}
        </optgroup>
      ))}
      <option value={MED_SCHOOL_OTHER_PAK.value}>{MED_SCHOOL_OTHER_PAK.label}</option>
      {includeOtherImg && (
        <option value={MED_SCHOOL_OTHER_IMG.value}>{MED_SCHOOL_OTHER_IMG.label}</option>
      )}
    </select>
  )
}
