export type StoreTab = 'acciones' | 'premios' | 'transacciones'

export type TxFilter = 'all' | 'pending' | 'approved' | 'rejected'

export interface ProcessPayload {
  status:      'approved' | 'rejected'
  adminNotes?: string
}

export interface NoteModalState {
  id:     string
  status: 'approved' | 'rejected'
}
