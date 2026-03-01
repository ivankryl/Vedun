import type { AnswerType, TableField as TableFieldFull } from './v2/types'

type Option = { id: string; label: string }

type RenderableQuestion = {
  id: string
  text: string
  answerType: AnswerType | (string & {})
  options?: Option[]
  placeholder?: string
  fields?: TableFieldFull[]
  ui?: { addRowLabel?: string }
  helpText?: string
}

type Props = {
  question: RenderableQuestion
  value: any
  onChange: (next: any) => void
}

const isType = <T extends AnswerType>(q: RenderableQuestion, t: T): q is RenderableQuestion & { answerType: T } =>
  String(q.answerType).trim().toLowerCase() === t

// Нормализация значений
const normRadioLike = (v: any): string => {
  if (Array.isArray(v)) return v.length ? String(v[0]) : ''
  if (v === null || typeof v === 'undefined') return ''
  return String(v)
}
const normSelect = normRadioLike
const normBoolean = (v: any): boolean | null => (v === true ? true : v === false ? false : null)

export default function QuestionRenderer({ question, value, onChange }: Props) {
  // Boolean — двухкнопочный radio (Да/Нет). Имя группы фиксируем по question.id
  if (isType(question, 'boolean')) {
    const name = `q-${question.id}` // стабильно
    const val = normBoolean(value)
    return (
      <div className="q-boolean">
        <div className="q-label">{question.text}</div>
        <label className="q-option">
          <input
            type="radio"
            name={name}
            value="true"
            checked={val === true}
            onChange={() => onChange(true)}
          />
          <span className="option-text">Да</span>
        </label>
        <label className="q-option">
          <input
            type="radio"
            name={name}
            value="false"
            checked={val === false}
            onChange={() => onChange(false)}
          />
          <span className="option-text">Нет</span>
        </label>
      </div>
    )
  }

  // Радио-выбор из options. Имя группы фиксируем по question.id
  if (isType(question, 'radio')) {
    const options: Option[] = question.options ?? []
    const name = `q-${question.id}` // стабильно
    const val = normRadioLike(value)
    return (
      <div className="q-radio">
        {options.map((opt: Option) => {
          const optId = String(opt.id)
          return (
            <label key={optId} className="q-option">
              <input
                type="radio"
                name={name}
                value={optId}
                checked={val === optId}
                onChange={() => onChange(optId)}
              />
              <span className="option-text">{opt.label}</span>
            </label>
          )
        })}
      </div>
    )
  }

  // Select — контролируемый, пустое значение = ''
  if (isType(question, 'select')) {
    const options: Option[] = question.options ?? []
    const val = normSelect(value)
    return (
      <div className="q-select">
        <select
          value={val}
          onChange={(e) => onChange(e.target.value === '' ? '' : e.target.value)}
        >
          <option value="">—</option>
          {options.map((opt: Option) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    )
  }

  // Multi-select — массив строк
  if (isType(question, 'multi_select')) {
    const options: Option[] = question.options ?? []
    const selected: string[] = Array.isArray(value) ? value.map(String) : []
    const toggle = (id: string) => {
      const next = selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]
      onChange(next)
    }
    return (
      <div className="q-multiselect">
        {options.map((opt: Option) => (
          <label key={opt.id} className="q-option">
            <input type="checkbox" checked={selected.includes(String(opt.id))} onChange={() => toggle(String(opt.id))} />
            <span className="option-text">{opt.label}</span>
          </label>
        ))}
      </div>
    )
  }

  // Number — контролируемый
  if (isType(question, 'number')) {
    const numStr =
      typeof value === 'number'
        ? String(value)
        : value === null || typeof value === 'undefined'
        ? ''
        : String(value ?? '')
    return (
      <div className="q-number">
        <input
          type="number"
          value={numStr}
          onChange={(e) => {
            const v = e.target.value
            onChange(v === '' ? null : Number(v))
          }}
          placeholder={question.placeholder || ''}
        />
      </div>
    )
  }

  // Date — ISO-строка yyyy-mm-dd или ''
  if (isType(question, 'date')) {
    const dateStr = typeof value === 'string' ? value : value ?? ''
    return (
      <div className="q-date">
        <input
          type="date"
          value={dateStr}
          onChange={(e) => onChange(e.target.value === '' ? '' : e.target.value)}
        />
      </div>
    )
  }

  // Text — контролируемый
  if (isType(question, 'text')) {
    return (
      <div className="q-text">
        <input
          type="text"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder || ''}
        />
      </div>
    )
  }

  // Table — нормализуем значения для ячеек
  if (isType(question, 'table')) {
    const rows: any[] = Array.isArray(value) ? value : []
    const fields: TableFieldFull[] = question.fields ?? []

    if (!fields.length) {
      return (
        <div className="q-table">
          <div className="v2-help">Нет колонок для таблицы</div>
        </div>
      )
    }

    const cast = (type: TableFieldFull['type'], raw: any) => {
      if (type === 'number') return raw === '' ? null : Number(raw)
      if (type === 'boolean') return !!raw
      if (type === 'multi_select') return Array.isArray(raw) ? raw : raw ? [raw] : []
      if (type === 'radio' || type === 'select') return raw ?? ''
      if (type === 'date') return raw || null
      return raw ?? ''
    }

    const setCell = (rowIdx: number, fieldId: string, type: TableFieldFull['type'], raw: any) => {
      const next = rows.map((r, i) => (i === rowIdx ? { ...r, [fieldId]: cast(type, raw) } : r))
      onChange(next)
    }

    const addRow = () => {
      const empty: any = {}
      fields.forEach((f) => {
        empty[f.id] =
          f.type === 'multi_select'
            ? []
            : f.type === 'number'
            ? null
            : f.type === 'date'
            ? null
            : ''
      })
      onChange([...rows, empty])
    }

    const removeRow = (idx: number) => {
      const next = rows.filter((_, i) => i !== idx)
      onChange(next)
    }

    return (
      <div className="q-table">
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
                    const valStr =
                      f.type === 'number'
                        ? cell === null || typeof cell === 'undefined'
                          ? ''
                          : String(cell)
                        : cell ?? ''
                    return (
                      <td key={f.id}>
                        <input
                          type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'}
                          value={valStr}
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
                            value={typeof cell === 'string' ? cell : cell ?? ''}
                            onChange={(e) => setCell(ri, f.id, f.type, e.target.value === '' ? '' : e.target.value)}
                          >
                            <option value="">—</option>
                            {(f.options ?? []).map((opt: { id: string; label: string }) => (
                              <option key={opt.id} value={opt.id}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div className="cell-radio">
                            {(f.options ?? []).map((opt: { id: string; label: string }) => (
                              <label key={opt.id}>
                                <input
                                  type="radio"
                                  name={`${question.id}:${f.id}:${ri}`}
                                  value={opt.id}
                                  checked={cell === opt.id}
                                  onChange={() => setCell(ri, f.id, f.type, opt.id)}
                                />
                                <span className="option-text">{opt.label}</span>
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
                      const next = selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]
                      setCell(ri, f.id, f.type, next)
                    }
                    return (
                      <td key={f.id}>
                        {(f.options ?? []).map((opt: { id: string; label: string }) => (
                          <label key={opt.id} className="cell-option">
                            <input
                              type="checkbox"
                              checked={selected.includes(opt.id)}
                              onChange={() => toggle(opt.id)}
                            />
                            <span className="option-text">{opt.label}</span>
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
          <button type="button" onClick={addRow}>{question.ui?.addRowLabel ?? 'Добавить строку'}</button>
        </div>
      </div>
    )
  }

  return null
}
