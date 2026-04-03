'use client'
import React, { useState } from 'react'
import { UserCog, Database, Shield } from 'lucide-react'
import type { CourseResponse } from '@control-aula/shared'
import { SectionHeader }   from '@/components/shared/SectionHeader'
import { UsuariosSection } from '@/features/usuarios/UsuariosSection'
import { BackupSection }   from '@/features/backup/BackupSection'

type AdminTab = 'usuarios' | 'backup'

const ADMIN_TABS: { id: AdminTab; label: string; icon: React.ElementType; desc: string }[] = [
  { id: 'usuarios', label: 'Usuarios', icon: UserCog,  desc: 'Cuentas de acceso al sistema' },
  { id: 'backup',   label: 'Backup',   icon: Database, desc: 'Exportar e importar datos'    },
]

interface Props {
  courses:   CourseResponse[]
  showToast: (msg: string, ok?: boolean) => void
  reloadAll: () => void
}

export function AdminSection({ courses, showToast, reloadAll }: Props) {
  const [activeTab, setActiveTab] = useState<AdminTab>('usuarios')

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <SectionHeader
        icon={Shield}
        iconClass="text-purple-400"
        title="Administración"
        subtitle="Gestión de usuarios y datos del sistema"
      />

      {/* Sub-navigation */}
      <div className="flex gap-1 p-1 bg-zinc-900/60 border border-zinc-800 rounded-2xl w-fit">
        {ADMIN_TABS.map(t => {
          const Icon   = t.icon
          const active = activeTab === t.id
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`group flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                active
                  ? 'bg-zinc-700 text-zinc-100 shadow-lg shadow-black/30'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${active ? 'text-purple-400' : 'text-zinc-600 group-hover:text-zinc-400'}`} />
              <div className="text-left hidden sm:block">
                <div className="leading-none">{t.label}</div>
                <div className={`text-[10px] mt-0.5 leading-none font-normal ${active ? 'text-zinc-400' : 'text-zinc-600'}`}>{t.desc}</div>
              </div>
            </button>
          )
        })}
      </div>

      {activeTab === 'usuarios' && (
        <UsuariosSection courses={courses} showToast={showToast} reloadAll={reloadAll} />
      )}
      {activeTab === 'backup' && (
        <BackupSection showToast={showToast} reloadAll={reloadAll} />
      )}
    </div>
  )
}
