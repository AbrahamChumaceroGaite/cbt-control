'use client'
import React, { useState } from 'react'
import { Zap, Gift, ShoppingBag } from 'lucide-react'
import type { ActionResponse, RewardResponse } from '@control-aula/shared'
import { AccionesSection }    from '@/features/acciones/AccionesSection'
import { RecompensasSection } from '@/features/recompensas/RecompensasSection'
import { SectionHeader }      from '@/components/shared/SectionHeader'

type StoreTab = 'acciones' | 'premios'

const STORE_TABS: { id: StoreTab; label: string; icon: React.ElementType; desc: string }[] = [
  { id: 'acciones', label: 'Acciones', icon: Zap,  desc: 'Comportamientos y puntajes' },
  { id: 'premios',  label: 'Premios',  icon: Gift, desc: 'Recompensas canjeables'      },
]

interface Props {
  actions:   ActionResponse[]
  rewards:   RewardResponse[]
  reload:    () => void
  showToast: (msg: string, ok?: boolean) => void
}

export function StoreSection({ actions, rewards, reload, showToast }: Props) {
  const [activeTab, setActiveTab] = useState<StoreTab>('acciones')

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <SectionHeader
        icon={ShoppingBag}
        iconClass="text-amber-400"
        title="Tienda"
        subtitle="Configura acciones y premios del sistema gamificado"
      />

      {/* Sub-navigation */}
      <div className="flex gap-1 p-1 bg-zinc-900/60 border border-zinc-800 rounded-2xl w-fit">
        {STORE_TABS.map(t => {
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
              <Icon className={`w-4 h-4 ${active ? 'text-amber-400' : 'text-zinc-600 group-hover:text-zinc-400'}`} />
              <div className="text-left hidden sm:block">
                <div className="leading-none">{t.label}</div>
                <div className={`text-[10px] mt-0.5 leading-none font-normal ${active ? 'text-zinc-400' : 'text-zinc-600'}`}>{t.desc}</div>
              </div>
            </button>
          )
        })}
      </div>

      {activeTab === 'acciones' && (
        <AccionesSection actions={actions} reload={reload} showToast={showToast} />
      )}
      {activeTab === 'premios' && (
        <RecompensasSection rewards={rewards} reload={reload} showToast={showToast} />
      )}
    </div>
  )
}
