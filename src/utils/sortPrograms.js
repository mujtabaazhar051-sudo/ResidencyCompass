/** Sort programs A→Z by official program name. */
export function sortProgramsByName(programs) {
  return [...programs].sort((a, b) =>
    (a.program_name || '').localeCompare(b.program_name || '', undefined, { sensitivity: 'base' }),
  )
}
