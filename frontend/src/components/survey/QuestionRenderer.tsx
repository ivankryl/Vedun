// frontend/src/components/survey/QuestionRenderer.tsx
//import React from 'react'
import { Question, TableField } from '../../../../surveys/v2/types'
type Props = {
  question: Question
  value: any
  onChange: (next: any) => void
}

export default function QuestionRenderer({ question, value, onChange }: Props) {
  const { answerType } = question

  if (answerType === 'boolean') {
    const checked = Boolean(value)
    return (
      <label className="q-boolean">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span>{question.text}</span>
      </label>
    )
  }

  if (answerType === 'radio') {
    return (
      <div className="q-radio">
        <div className="q-label">{question.text}</div>
        {(question as any).options?.map((opt: any) => (
          <label key={opt.id} className="q-option">
            <input
              type="radio"
              name={question.id}
              checked={value === opt.id}
              onChange={() => onChange(opt.id)}
            />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>
    )
  }

  if (answerType === 'select') {
    return (
      <div className="q-select">
        <div className="q-label">{question.text}</div>
        <select
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value || null)}
        >
          <option value="">—</option>
          {(question as any).options?.map((opt: any) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    )
  }

  if (answerType === 'multi_select') {
    const selected: string[] = Array.isArray(value) ? value : []
    const toggle = (id: string) => {
      const next = selected.includes(id)
        ? selected.filter((x) => x !== id)
        : [...selected, id]
      onChange(next)
    }
    return (
      <div className="q-multiselect">
        <div className="q-label">{question.text}</div>
        {(question as any).options?.map((opt: any) => (
          <label key={opt.id} className="q-option">
            <input
              type="checkbox"
              checked={selected.includes(opt.id)}
              onChange={() => toggle(opt.id)}
            />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>
    )
  }

  if (answerType === 'number') {
    const num = typeof value === 'number' ? value : value === '' ? '' : ''
    return (
      <div className="q-number">
        <div className="q-label">{question.text}</div>
        <input
          type="number"
          value={num as any}
          onChange={(e) =>
            onChange(e.target.value === '' ? null : Number(e.target.value))
          }
          placeholder={(question as any).placeholder || ''}
        />
      </div>
    )
  }

  if (answerType === 'date') {
    const dateStr = typeof value === 'string' ? value : ''
    return (
      <div className="q-date">
        <div className="q-label">{question.text}</div>
        <input
          type="date"
          value={dateStr}
          onChange={(e) => onChange(e.target.value || null)}
        />
      </div>
    )
  }

  if (answerType === 'text') {
    return (
      <div className="q-text">
        <div className="q-label">{question.text}</div>
        <input
          type="text"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={(question as any).placeholder || ''}
        />
      </div>
    )
  }

  if (answerType === 'table') {
    const rows: any[] = Array.isArray(value) ? value : []
    const fields = (question as any).fields as TableField[]

    const cast = (type: TableField['type'], raw: any) => {
      if (type === 'number') return raw === '' ? null : Number(raw)
      if (type === 'boolean') return !!raw
      if (type === 'multi_select')
        return Array.isArray(raw) ? raw : raw ? [raw] : []
      if (type === 'date') return raw || null
      return raw ?? ''
    }

    const setCell = (rowIdx: number, fieldId: string, type: TableField['type'], raw: any) => {
      const next = rows.map((r, i) =>
        i === rowIdx ? { ...r, [fieldId]: cast(type, raw) } : r
      )
      onChange(next)
    }

    const addRow = () => {
      const empty: any = {}
      fields.forEach((f) => {
        empty[f.id] = f.type === 'multi_select' ? [] : f.type === 'number' ? null : ''
      })
      onChange([...rows, empty])
    }

    const removeRow = (idx: number) => {
      const next = rows.filter((_, i) => i !== idx)
      onChange(next)
    }

    return (
      <div className="q-table">
        <div className="q-label">{question.text}</div>
        <table className="q-table-grid">
          <thead>
            <tr>
              {fields.map((f) => (
                <th key={f.id}>{f.label}</th>
              ))}
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri}>
                {fields.map((f) => {
                  const cell = row[f.id]
                  if (f.type === 'text' || f.type === 'number' || f.type === 'date') {
                    return (
                      <td key={f.id}>
                        <input
                          type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'}
                          value={cell ?? (f.type === 'number' ? '' : '')}
                          onChange={(e) => setCell(ri, f.id, f.type, e.target.value)}
                        />
                      </td>
                    )
                  }
                  if (f.type === 'boolean') {
                    return (
                      <td key={f.id}>
                        <input
                          type="checkbox"
                          checked={!!cell}
                          onChange={(e) => setCell(ri, f.id, f.type, e.target.checked)}
                        />
                      </td>
                    )
                  }
                  if (f.type === 'radio' || f.type === 'select') {
                    return (
                      <td key={f.id}>
                        {f.type === 'select' ? (
                          <select
                            value={cell ?? ''}
                            onChange={(e) => setCell(ri, f.id, f.type, e.target.value)}
                          >
                            <option value="">—</option>
                            {(f as any).options?.map((opt: any) => (
                              <option key={opt.id} value={opt.id}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div className="cell-radio">
                            {(f as any).options?.map((opt: any) => (
                              <label key={opt.id}>
                                <input
                                  type="radio"
                                  name={`${question.id}:${f.id}:${ri}`}
                                  checked={cell === opt.id}
                                  onChange={() => setCell(ri, f.id, f.type, opt.id)}
                                />
                                {opt.label}
                              </label>
                            ))}
                          </div>
                        )}
                      </td>
                    )
                  }
                  if (f.type === 'multi_select') {
                    const selected: string[] = Array.isArray(cell) ? cell : []
                    const toggle = (id: string) => {
                      const next = selected.includes(id)
                        ? selected.filter((x) => x !== id)
                        : [...selected, id]
                      setCell(ri, f.id, f.type, next)
                    }
                    return (
                      <td key={f.id}>
                        {(f as any).options?.map((opt: any) => (
                          <label key={opt.id} className="cell-option">
                            <input
                              type="checkbox"
                              checked={selected.includes(opt.id)}
                              onChange={() => toggle(opt.id)}
                            />
                            {opt.label}
                          </label>
                        ))}
                      </td>
                    )
                  }
                  return <td key={f.id} />
                })}
                <td>
                  <button type="button" onClick={() => removeRow(ri)}>−</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="q-table-actions">
          <button type="button" onClick={addRow}>
            {(question as any).ui?.addRowLabel ?? 'Добавить строку'}
          </button>
        </div>
      </div>
    )
  }

  return null
}
