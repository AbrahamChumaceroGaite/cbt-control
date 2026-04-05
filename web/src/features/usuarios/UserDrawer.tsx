'use client'
import { useEffect, useState } from 'react'
import { X, UserCog, Bell, BellDot, GraduationCap, Calendar, Hash, CheckCircle, XCircle, Trash2, ArrowRight, Landmark } from 'lucide-react'
import { Button, Input, Label, Modal } from '@/components/ui'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { inboxService, type NotificationItem } from '@/services/inbox.service'
import { usersService, type UserFull } from '@/services/users.service'
import { apiFetch } from '@/lib/api'
import type { CoinTransactionResponse } from '@control-aula/shared'

interface Props {
  user:      UserFull | null
  onClose:   () => void
  onUpdated: () => void
  showToast: (msg: string, ok?: boolean) => void
}

function timeAgo(iso: string): string {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000)
  if (m < 1)  return 'Ahora'
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  return `${Math.floor(h / 24)}d`
}

type Section = 'perfil' | 'notificaciones' | 'transacciones'

const STATUS_TX: Record<string, { label: string; cls: string }> = {
  pending:  { label: 'Pendiente', cls: 'bg-amber-500/15 text-amber-400 border-amber-500/25' },
  approved: { label: 'Aprobada',  cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' },
  rejected: { label: 'Rechazada', cls: 'bg-red-500/15 text-red-400 border-red-500/25' },
}

export function UserDrawer({ user, onClose, onUpdated, showToast }: Props) {
  const [section,      setSection]      = useState<Section>('perfil')
  const [editModal,    setEditModal]    = useState(false)
  const [form,         setForm]         = useState({ fullName: '', password: '', isActive: true })
  const [notifications,  setNotifs]      = useState<NotificationItem[]>([])
  const [loadingNotifs,  setLoadingN]    = useState(false)
  const [transactions,   setTxs]         = useState<CoinTransactionResponse[]>([])
  const [loadingTxs,     setLoadingTxs]  = useState(false)
  const [saving,         setSaving]       = useState(false)
  const [confirmDelete,  setConfirmDelete] = useState(false)

  useEffect(() => {
    if (!user) return
    setSection('perfil')
    setForm({ fullName: user.fullName, password: '', isActive: user.isActive })
  }, [user])

  useEffect(() => {
    if (!user || section !== 'notificaciones') return
    setLoadingN(true)
    inboxService.adminGetUserInbox(user.id)
      .then(r => setNotifs(r.items))
      .catch(() => setNotifs([]))
      .finally(() => setLoadingN(false))
  }, [user, section])

  useEffect(() => {
    if (!user || section !== 'transacciones' || !user.student) return
    setLoadingTxs(true)
    apiFetch<CoinTransactionResponse[]>(`/api/bank/admin/transactions?studentId=${user.student.id}`)
      .then(data => setTxs(Array.isArray(data) ? data : []))
      .catch(() => setTxs([]))
      .finally(() => setLoadingTxs(false))
  }, [user, section])

  async function save() {
    if (!user) return
    setSaving(true)
    try {
      const body: Parameters<typeof usersService.update>[1] = { fullName: form.fullName, isActive: form.isActive }
      if (form.password) body.password = form.password
      const { message } = await usersService.update(user.id, body)
      showToast(message)
      setEditModal(false)
      onUpdated()
    } catch (err: any) { showToast(err.message ?? 'Error', false) }
    finally { setSaving(false) }
  }

  async function toggleActive() {
    if (!user) return
    try {
      const { message } = await usersService.update(user.id, { isActive: !user.isActive })
      showToast(message, !user.isActive)
      onUpdated()
    } catch (err: any) { showToast(err.message ?? 'Error', false) }
  }

  async function doRemove() {
    if (!user) return
    try {
      const { message } = await usersService.delete(user.id)
      showToast(message)
      setConfirmDelete(false)
      onClose()
      onUpdated()
    } catch (err: any) { showToast(err.message ?? 'Error', false) }
  }

  const isAdmin = user?.role === 'admin'
  const aura    = isAdmin
    ? 'from-purple-500/20 to-transparent border-purple-500/20'
    : 'from-blue-500/20 to-transparent border-blue-500/20'
  const avatarBg   = isAdmin ? 'bg-purple-500/15 border-purple-500/30 text-purple-300' : 'bg-blue-500/15 border-blue-500/30 text-blue-300'
  const roleBadge  = isAdmin ? 'bg-purple-900/50 text-purple-300' : 'bg-blue-900/50 text-blue-300'

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[400] bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${user ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div className={`fixed right-0 top-0 bottom-0 z-[401] w-full max-w-sm bg-zinc-950 border-l border-zinc-800 shadow-2xl flex flex-col transition-transform duration-300 ${user ? 'translate-x-0' : 'translate-x-full'}`}>
        {!user ? null : (
          <>
            {/* Hero */}
            <div className={`relative p-6 bg-gradient-to-b ${aura} border-b border-zinc-800 flex-shrink-0`}>
              <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors">
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center text-xl font-black flex-shrink-0 ${avatarBg}`}>
                  {(user.student?.name || user.fullName || user.code).trim().charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-zinc-100 truncate">{user.student?.name || user.fullName || user.code}</h3>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${roleBadge}`}>
                      {isAdmin ? 'Admin' : 'Estudiante'}
                    </span>
                    <span className={`text-xs font-medium ${user.isActive ? 'text-emerald-400' : 'text-zinc-600'}`}>
                      {user.isActive ? '● Activo' : '● Inactivo'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sub-tabs */}
            <div className="flex border-b border-zinc-800 flex-shrink-0">
              {((['perfil', 'notificaciones', ...(user.student ? ['transacciones'] : [])] as Section[])).map(s => (
                <button
                  key={s}
                  onClick={() => setSection(s)}
                  className={`flex-1 py-3 text-xs font-semibold capitalize transition-colors border-b-2 ${
                    section === s
                      ? 'text-zinc-100 border-amber-500'
                      : 'text-zinc-500 border-transparent hover:text-zinc-300'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {section === 'perfil' && (
                <div className="p-4 space-y-4">
                  {/* Details */}
                  <div className="space-y-3">
                    {[
                      { icon: Hash,          label: 'Código',   value: user.code },
                      { icon: Calendar,      label: 'Registro', value: new Date(user.createdAt).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' }) },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className="flex items-center gap-3 py-2.5 border-b border-zinc-800/50">
                        <Icon className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0" />
                        <span className="text-xs text-zinc-500 w-20 flex-shrink-0">{label}</span>
                        <span className="text-xs text-zinc-300 font-medium">{value}</span>
                      </div>
                    ))}
                    {user.student && (
                      <div className="flex items-center gap-3 py-2.5 border-b border-zinc-800/50">
                        <GraduationCap className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0" />
                        <span className="text-xs text-zinc-500 w-20 flex-shrink-0">Estudiante</span>
                        <div className="text-xs text-zinc-300">
                          <div className="font-medium">{user.student.name}</div>
                          {user.student.course && <div className="text-zinc-500">{user.student.course.name}</div>}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Push & notification stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className={`rounded-xl p-3 border ${user.pushSubscriptionCount > 0 ? 'bg-emerald-950/30 border-emerald-800/40' : 'bg-zinc-900/40 border-zinc-800'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        {user.pushSubscriptionCount > 0 ? <BellDot className="w-3.5 h-3.5 text-emerald-400" /> : <Bell className="w-3.5 h-3.5 text-zinc-600" />}
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Push</span>
                      </div>
                      <p className={`text-lg font-black ${user.pushSubscriptionCount > 0 ? 'text-emerald-400' : 'text-zinc-600'}`}>
                        {user.pushSubscriptionCount > 0 ? 'Activo' : 'Inactivo'}
                      </p>
                      <p className="text-[10px] text-zinc-600">{user.pushSubscriptionCount} dispositivo{user.pushSubscriptionCount !== 1 ? 's' : ''}</p>
                    </div>
                    <div className="rounded-xl p-3 border bg-zinc-900/40 border-zinc-800">
                      <div className="flex items-center gap-2 mb-1">
                        <Bell className="w-3.5 h-3.5 text-zinc-500" />
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Notif.</span>
                      </div>
                      <p className="text-lg font-black text-zinc-300">{user.notificationCount}</p>
                      <p className="text-[10px] text-zinc-600">en historial</p>
                    </div>
                  </div>
                </div>
              )}

              {section === 'transacciones' && (
                <div>
                  {loadingTxs ? (
                    <div className="p-3 space-y-2">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-16 rounded-xl bg-zinc-900/60 animate-pulse" />
                      ))}
                    </div>
                  ) : transactions.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-10 text-zinc-700">
                      <div className="w-10 h-10 rounded-xl bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center">
                        <Landmark className="w-5 h-5 opacity-40" />
                      </div>
                      <span className="text-xs text-zinc-600">Sin transacciones</span>
                    </div>
                  ) : (
                    <ul className="divide-y divide-zinc-800/40">
                      {transactions.map(tx => {
                        const isFrom = tx.fromStudent.id === user.student?.id
                        const other  = isFrom ? tx.toStudent : tx.fromStudent
                        const st     = STATUS_TX[tx.status] ?? STATUS_TX.pending
                        return (
                          <li key={tx.id} className="flex items-center gap-3 px-4 py-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isFrom ? 'bg-red-500/10 border border-red-500/20' : 'bg-emerald-500/10 border border-emerald-500/20'}`}>
                              <ArrowRight className={`w-3.5 h-3.5 ${isFrom ? 'text-red-400 rotate-180' : 'text-emerald-400'}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-zinc-200 truncate">
                                {isFrom ? `→ ${other.name}` : `← ${other.name}`}
                              </p>
                              <p className="text-[10px] text-zinc-600">
                                {new Date(tx.createdAt).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </p>
                            </div>
                            <div className="text-right flex-shrink-0 space-y-1">
                              <p className={`text-sm font-black ${isFrom ? 'text-red-400' : 'text-emerald-400'}`}>
                                {isFrom ? '-' : '+'}{isFrom ? tx.amount + tx.tax : tx.amount}c
                              </p>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${st.cls}`}>
                                {st.label}
                              </span>
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </div>
              )}

              {section === 'notificaciones' && (
                <div>
                  {loadingNotifs ? (
                    <div className="p-3 space-y-2">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="space-y-1.5">
                          <div className="h-3 w-3/4 rounded bg-zinc-800 animate-pulse" />
                          <div className="h-2.5 w-full rounded bg-zinc-800 animate-pulse" />
                        </div>
                      ))}
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-10 text-zinc-700">
                      <div className="w-10 h-10 rounded-xl bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center">
                        <Bell className="w-5 h-5 opacity-40" />
                      </div>
                      <span className="text-xs text-zinc-600">Sin notificaciones</span>
                    </div>
                  ) : (
                    <ul>
                      {notifications.map(n => (
                        <li key={n.id} className={`flex gap-3 px-4 py-3 border-b border-zinc-800/40 last:border-0 ${!n.isRead ? 'bg-zinc-900/25' : ''}`}>
                          <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${!n.isRead ? 'bg-amber-400' : 'bg-zinc-800'}`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between gap-2">
                              <p className={`text-xs font-semibold ${n.isRead ? 'text-zinc-400' : 'text-zinc-100'}`}>{n.title}</p>
                              <span className="text-[10px] text-zinc-600 flex-shrink-0">{timeAgo(n.createdAt)}</span>
                            </div>
                            <p className="text-[11px] text-zinc-500 mt-0.5 line-clamp-2">{n.body}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* Actions footer */}
            <div className="p-4 border-t border-zinc-800 flex-shrink-0 flex flex-col gap-2">
              <div className="flex gap-2">
                <Button size="sm" onClick={() => setEditModal(true)} className="flex-1">
                  <UserCog className="w-3.5 h-3.5 mr-1.5" />Editar
                </Button>
                <Button size="sm" variant="secondary" onClick={toggleActive} className="flex-1">
                  {user.isActive
                    ? <><XCircle className="w-3.5 h-3.5 mr-1.5" />Desactivar</>
                    : <><CheckCircle className="w-3.5 h-3.5 mr-1.5" />Activar</>
                  }
                </Button>
              </div>
              {!isAdmin && (
                <Button size="sm" variant="destructive" onClick={() => setConfirmDelete(true)} className="w-full">
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />Eliminar usuario
                </Button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Edit modal */}
      <Modal open={editModal} onClose={() => setEditModal(false)} title="Editar usuario">
        <div className="space-y-4">
          <div className="space-y-1.5"><Label>Nombre Completo</Label>
            <Input value={form.fullName} onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))} placeholder="Nombre para mostrar" />
          </div>
          <div className="space-y-1.5"><Label>Nueva contraseña <span className="text-zinc-600">(vacío = sin cambio)</span></Label>
            <Input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="••••••••" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))} className="w-4 h-4 rounded border-zinc-700 bg-zinc-900" />
            <span className="text-sm text-zinc-300">Cuenta activa</span>
          </label>
        </div>
        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={() => setEditModal(false)} className="flex-1">Cancelar</Button>
          <Button onClick={save} disabled={saving} className="flex-1">{saving ? 'Guardando…' : 'Guardar cambios'}</Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmDelete}
        onConfirm={doRemove}
        onCancel={() => setConfirmDelete(false)}
        title="Eliminar usuario"
        message={`¿Eliminar el usuario "${user?.code ?? ''}"? Esta operación no se puede deshacer.`}
        confirmText="Eliminar"
        variant="red"
      />
    </>
  )
}
