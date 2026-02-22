//
//  frontend/src/context/SurveyHeaderContext.tsx
import React from 'react'

export type SurveyHeaderState = {
  title?: string
  templateVersion?: string
  generatedAt?: string | null
  progressPercent?: number | null
}

type Ctx = {
  state: SurveyHeaderState
  setState: React.Dispatch<React.SetStateAction<SurveyHeaderState>>
  reset: () => void
}

const defaultState: SurveyHeaderState = {
  title: 'Опрос',
  templateVersion: undefined,
  generatedAt: null,
  progressPercent: null,
}

const SurveyHeaderContext = React.createContext<Ctx | null>(null)

export function SurveyHeaderProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<SurveyHeaderState>(defaultState)

  const reset = React.useCallback(() => setState(defaultState), [])

  return (
    <SurveyHeaderContext.Provider value={{ state, setState, reset }}>
      {children}
    </SurveyHeaderContext.Provider>
  )
}

export function useSurveyHeader() {
  const ctx = React.useContext(SurveyHeaderContext)
  if (!ctx) throw new Error('useSurveyHeader must be used within SurveyHeaderProvider')
  return ctx
}
