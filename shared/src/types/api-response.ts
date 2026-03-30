export interface IApiResponse<T = unknown> {
  code:    number
  status:  'success' | 'error'
  data:    T | null
  message: string
}
