// src/surveys/v2/types.ts

export type SurveyTemplateVersion = 'v2'

export type AnswerType =
  | 'boolean'
  | 'radio'
  | 'select'
  | 'multi_select'
  | 'text'
  | 'number'
  | 'date'
  | 'table'

export interface Option {
  id: string
  label: string
  points?: number
  weight?: number
}

export interface ValidationRule {
  required?: boolean
  min?: number
  max?: number
  minLength?: number
  maxLength?: number
  pattern?: string
}

export type ConditionOperator =
  | 'equals'
  | 'not_equals'
  | 'in'
  | 'not_in'
  | 'exists'
  | 'not_exists'

// 1) простое условие
export interface SimpleCondition {
  questionId: string
  op: ConditionOperator
  value?: string | number | boolean | Array<string | number | boolean>
}

// 2) составные условия
export interface AnyCondition {
  any: Condition[]
}

export interface AllCondition {
  all: Condition[]
}

// 3) итоговый тип (рекурсивный)
export type Condition = SimpleCondition | AnyCondition | AllCondition

export interface QuestionBase {
  id: string
  sectionKey: string
  text: string
  helpText?: string

  answerType: AnswerType
  validation?: ValidationRule

  isRisk?: boolean
  categoryKey?: string

  // условная видимость (UI может скрывать/показывать)
  visibleIf?: Condition
}

export interface ChoiceQuestion extends QuestionBase {
  answerType: 'radio' | 'select'
  options: Option[]
}

export interface MultiSelectQuestion extends QuestionBase {
  answerType: 'multi_select'
  options: Option[]
  scoringMode?: 'sum' | 'max'
}

export interface BooleanQuestion extends QuestionBase {
  answerType: 'boolean'
  labels?: { trueLabel?: string; falseLabel?: string }
}

export interface TextQuestion extends QuestionBase {
  answerType: 'text'
  placeholder?: string
}

export interface NumberQuestion extends QuestionBase {
  answerType: 'number'
  placeholder?: string
  unit?: string
}

export interface DateQuestion extends QuestionBase {
  answerType: 'date'
}

export type TableFieldType = Exclude<AnswerType, 'table'>

export interface TableFieldBase {
  id: string
  label: string
  type: TableFieldType
  validation?: ValidationRule
  placeholder?: string
  unit?: string
}

export interface TableChoiceField extends TableFieldBase {
  type: 'radio' | 'select'
  options: Option[]
}

export interface TableMultiSelectField extends TableFieldBase {
  type: 'multi_select'
  options: Option[]
  scoringMode?: 'sum' | 'max'
}

export interface TableBooleanField extends TableFieldBase {
  type: 'boolean'
  labels?: { trueLabel?: string; falseLabel?: string }
}

export interface TableTextField extends TableFieldBase {
  type: 'text'
}

export interface TableNumberField extends TableFieldBase {
  type: 'number'
}

export interface TableDateField extends TableFieldBase {
  type: 'date'
}

export type TableField =
  | TableChoiceField
  | TableMultiSelectField
  | TableBooleanField
  | TableTextField
  | TableNumberField
  | TableDateField

export interface TableQuestion extends QuestionBase {
  answerType: 'table'
  fields: TableField[]
  ui?: {
    minRows?: number
    maxRows?: number
    addRowLabel?: string
  }
}

export type Question =
  | ChoiceQuestion
  | MultiSelectQuestion
  | BooleanQuestion
  | TextQuestion
  | NumberQuestion
  | DateQuestion
  | TableQuestion // NEW

export interface Section {
  key: string
  title: string
  description?: string
  order: number
  questions: Question[]
}

export interface SurveyTemplate {
  version: SurveyTemplateVersion
  title: string
  sections: Section[]
}
