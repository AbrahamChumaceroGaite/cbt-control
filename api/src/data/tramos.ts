export const TRAMOS = [
  { id: 'T1', label: 'Atención',        color: '#0C447C', fg: '#85B7EB' },
  { id: 'T2', label: 'Indagación',      color: '#3C3489', fg: '#AFA9EC' },
  { id: 'T3', label: 'Metacognición',   color: '#0F6E56', fg: '#5DCAA5' },
  { id: 'T4', label: 'Pens. Analítico', color: '#633806', fg: '#EF9F27' },
  { id: 'T5', label: 'Apz. Autónomo',   color: '#72243E', fg: '#ED93B1' },
  { id: 'T6', label: 'Colaborativo',    color: '#3B6D11', fg: '#97C459' },
  { id: 'T7', label: 'Innovación',      color: '#501313', fg: '#F09595' },
]

export const ACTION_COLORS: Record<string, { bg: string; text: string }> = {
  green:  { bg: '#1E6B2E', text: '#C0DD97' },
  blue:   { bg: '#0C447C', text: '#B5D4F4' },
  red:    { bg: '#501313', text: '#F7C1C1' },
  amber:  { bg: '#633806', text: '#FAC775' },
  purple: { bg: '#3C3489', text: '#CECBF6' },
  mag:    { bg: '#72243E', text: '#F4C0D1' },
}
