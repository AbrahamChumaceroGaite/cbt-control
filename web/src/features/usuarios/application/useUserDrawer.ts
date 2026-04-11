'use client'
import { useCallback, useEffect, useState } from 'react'
import { usuariosService }     from '../infrastructure/usuarios.service'
import { UserMapper }          from './mapper'
import { useToast }            from '@/hooks/useToast'
import type { UserViewModel, UserUpdateForm, NotificationItem } from '../domain/types'
import type { CoinTransactionResponse }   from '@control-aula/shared'
import { EMPTY_UPDATE_FORM }              from '../domain/types'

export type DrawerSection = 'profile' | 'notifications' | 'transactions'

export function useUserDrawer(user: UserViewModel | null, onUpdated: () => void, onClose: () => void) {
  const { showToast } = useToast()

  const [section,        setSection]       = useState<DrawerSection>('profile')
  const [editModal,      setEditModal]     = useState(false)
  const [form,           setForm]          = useState<UserUpdateForm>(EMPTY_UPDATE_FORM)
  const [notifications,  setNotifications] = useState<NotificationItem[]>([])
  const [loadingNotifs,  setLoadingNotifs] = useState(false)
  const [transactions,   setTransactions]  = useState<CoinTransactionResponse[]>([])
  const [loadingTxs,     setLoadingTxs]    = useState(false)
  const [saving,         setSaving]        = useState(false)
  const [confirmDelete,  setConfirmDelete] = useState(false)

  // Reset when user changes
  useEffect(() => {
    if (!user) return
    setSection('profile')
    setForm(UserMapper.toUpdateForm(user))
    setNotifications([])
    setTransactions([])
  }, [user])

  // Load notifications when section is active
  useEffect(() => {
    if (!user || section !== 'notifications') return
    setLoadingNotifs(true)
    usuariosService.getUserInbox(user.id)
      .then(r => setNotifications(r.items))
      .catch(() => setNotifications([]))
      .finally(() => setLoadingNotifs(false))
  }, [user, section])

  // Load transactions when section is active
  useEffect(() => {
    if (!user || section !== 'transactions' || !user.student) return
    setLoadingTxs(true)
    usuariosService.getStudentTransactions(user.student.id)
      .then(data => setTransactions(Array.isArray(data) ? data : []))
      .catch(() => setTransactions([]))
      .finally(() => setLoadingTxs(false))
  }, [user, section])

  const save = useCallback(async () => {
    if (!user) return
    setSaving(true)
    try {
      const { message } = await usuariosService.update(user.id, UserMapper.toUpdateBody(form))
      showToast(message)
      setEditModal(false)
      onUpdated()
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error saving changes', false)
    } finally {
      setSaving(false)
    }
  }, [user, form, onUpdated, showToast])

  const toggleActive = useCallback(async () => {
    if (!user) return
    try {
      const { message } = await usuariosService.update(user.id, { isActive: !user.isActive })
      showToast(message, !user.isActive)
      onUpdated()
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error updating status', false)
    }
  }, [user, onUpdated, showToast])

  const doDelete = useCallback(async () => {
    if (!user) return
    try {
      const { message } = await usuariosService.delete(user.id)
      showToast(message)
      setConfirmDelete(false)
      onClose()
      onUpdated()
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error deleting user', false)
    }
  }, [user, onClose, onUpdated, showToast])

  return {
    section, editModal, form, notifications, loadingNotifs,
    transactions, loadingTxs, saving, confirmDelete,
    handlers: {
      setSection,
      openEdit:        () => setEditModal(true),
      closeEdit:       () => setEditModal(false),
      setForm,
      save,
      toggleActive,
      requestDelete:   () => setConfirmDelete(true),
      cancelDelete:    () => setConfirmDelete(false),
      doDelete,
    },
  }
}
