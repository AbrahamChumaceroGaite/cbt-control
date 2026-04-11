'use client'
import { X, UserCog, CheckCircle, XCircle, Trash2 } from 'lucide-react'
import { Button, Input, Modal, Checkbox } from '@/components/ui'
import { FormField }     from '@/components/shared/FormField'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { useUserDrawer } from '../application/useUserDrawer'
import { DrawerProfileTab }      from './components/DrawerProfileTab'
import { DrawerTransactionsTab } from './components/DrawerTransactionsTab'
import { DrawerNotificationsTab } from './components/DrawerNotificationsTab'
import type { UserViewModel } from '../domain/types'
import type { DrawerSection } from '../application/useUserDrawer'

interface Props {
  user:      UserViewModel | null
  onClose:   () => void
  onUpdated: () => void
}

export function UserDrawer({ user, onClose, onUpdated }: Props) {
  const d = useUserDrawer(user, onUpdated, onClose)
  const h = d.handlers

  const isAdmin   = user?.role === 'admin'
  const aura      = isAdmin ? 'from-purple-500/20 to-transparent border-purple-500/20'  : 'from-blue-500/20 to-transparent border-blue-500/20'
  const avatarCls = isAdmin ? 'bg-purple-500/15 border-purple-500/30 text-purple-300'   : 'bg-blue-500/15 border-blue-500/30 text-blue-300'
  const roleCls   = isAdmin ? 'bg-purple-900/50 text-purple-300' : 'bg-blue-900/50 text-blue-300'
  const sections  = (user?.student ? ['profile', 'notifications', 'transactions'] : ['profile', 'notifications']) as DrawerSection[]

  return (
    <>
      <div
        className={`fixed inset-0 z-[400] bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${user ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <div className={`fixed right-0 top-0 bottom-0 z-[401] w-full max-w-sm bg-zinc-950 border-l border-zinc-800 shadow-2xl flex flex-col transition-transform duration-300 ${user ? 'translate-x-0' : 'translate-x-full'}`}>
        {!user ? null : (
          <>
            <div className={`relative p-6 bg-gradient-to-b ${aura} border-b border-zinc-800 flex-shrink-0`}>
              <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors">
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center text-xl font-black flex-shrink-0 ${avatarCls}`}>
                  {user.initial}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-zinc-100 truncate">{user.displayName}</h3>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${roleCls}`}>{isAdmin ? 'Admin' : 'Student'}</span>
                    <span className={`text-xs font-medium ${user.isActive ? 'text-emerald-400' : 'text-zinc-600'}`}>
                      {user.isActive ? '● Active' : '● Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex border-b border-zinc-800 flex-shrink-0">
              {sections.map(s => (
                <button key={s} onClick={() => h.setSection(s)}
                  className={`flex-1 py-3 text-xs font-semibold capitalize transition-colors border-b-2 ${d.section === s ? 'text-zinc-100 border-amber-500' : 'text-zinc-500 border-transparent hover:text-zinc-300'}`}>
                  {s}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto">
              {d.section === 'profile'       && <DrawerProfileTab user={user} />}
              {d.section === 'transactions'  && <DrawerTransactionsTab user={user} transactions={d.transactions} loading={d.loadingTxs} />}
              {d.section === 'notifications' && <DrawerNotificationsTab notifications={d.notifications} loading={d.loadingNotifs} />}
            </div>
            <div className="p-4 border-t border-zinc-800 flex-shrink-0 flex flex-col gap-2">
              <div className="flex gap-2">
                <Button size="sm" onClick={h.openEdit} className="flex-1"><UserCog className="w-3.5 h-3.5 mr-1.5" />Edit</Button>
                <Button size="sm" variant="secondary" onClick={h.toggleActive} className="flex-1">
                  {user.isActive ? <><XCircle className="w-3.5 h-3.5 mr-1.5" />Deactivate</> : <><CheckCircle className="w-3.5 h-3.5 mr-1.5" />Activate</>}
                </Button>
              </div>
              {!isAdmin && (
                <Button size="sm" variant="destructive" onClick={h.requestDelete} className="w-full">
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />Delete user
                </Button>
              )}
            </div>
          </>
        )}
      </div>

      <Modal open={d.editModal} onClose={h.closeEdit} title="Edit user">
        <div className="space-y-4">
          <FormField label="Full Name">
            <Input value={d.form.fullName} onChange={e => h.setForm(p => ({ ...p, fullName: e.target.value }))} placeholder="Display name" />
          </FormField>
          <FormField label="New password (leave empty to keep current)">
            <Input type="password" value={d.form.password} onChange={e => h.setForm(p => ({ ...p, password: e.target.value }))} placeholder="••••••••" />
          </FormField>
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox checked={d.form.isActive} onCheckedChange={v => h.setForm(p => ({ ...p, isActive: v }))} />
            <span className="text-sm text-zinc-300">Account active</span>
          </label>
        </div>
        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={h.closeEdit} className="flex-1">Cancel</Button>
          <Button onClick={h.save} disabled={d.saving} className="flex-1">{d.saving ? 'Saving…' : 'Save changes'}</Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={d.confirmDelete} onConfirm={h.doDelete} onCancel={h.cancelDelete}
        title="Delete user" message={`Delete user "${user?.code ?? ''}"? This action cannot be undone.`}
        confirmText="Delete" variant="red"
      />
    </>
  )
}
