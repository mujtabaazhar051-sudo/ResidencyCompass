import { useState } from 'react'
import { TEAM_MEMBERS } from '../constants/team'

function initials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

function TeamMemberCard({ member }) {
  const [imgFailed, setImgFailed] = useState(false)
  const showPhoto = Boolean(member.photo) && !imgFailed

  return (
    <div className="flex items-center gap-5 rounded-xl border border-slate-100 bg-slate-50/80 p-5 dark:border-slate-700 dark:bg-slate-900/40">
      {showPhoto ? (
        <img
          src={member.photo}
          alt=""
          className={`h-32 w-32 shrink-0 rounded-full object-cover sm:h-40 sm:w-40 ${member.photoPosition === 'top' ? 'object-top' : 'object-center'}`}
          onError={() => setImgFailed(true)}
        />
      ) : (
        <div
          className="flex h-32 w-32 shrink-0 items-center justify-center rounded-full bg-[#1e3a5f] text-2xl font-semibold text-white sm:h-40 sm:w-40 sm:text-3xl"
          aria-hidden
        >
          {initials(member.name)}
        </div>
      )}
      <div className="min-w-0">
        <p className="text-xl font-bold leading-snug text-slate-900 sm:text-2xl dark:text-slate-100">{member.name}</p>
        <p className="mt-1 text-base font-semibold text-emerald-700 sm:text-lg dark:text-emerald-400">{member.role}</p>
        <p className="mt-1 text-sm text-slate-500 sm:text-base dark:text-slate-400">{member.school}</p>
      </div>
    </div>
  )
}

export default function TeamGrid({ intro }) {
  return (
    <div>
      {intro}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {TEAM_MEMBERS.map((member) => (
          <TeamMemberCard key={member.id} member={member} />
        ))}
      </div>
    </div>
  )
}
