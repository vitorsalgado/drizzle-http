import { notNull } from '../internal/index.ts'
import { oneOf } from '../internal/index.ts'
import { createModelDecorator } from '../builtin/index.ts'

export type ToDest = 'header' | 'query' | 'queryname' | 'param' | 'field' | 'body' | 'bodypart'

export function To(to: ToDest, key?: string, field?: string) {
  notNull(to)
  oneOf(to, ['header', 'query', 'queryname', 'param', 'field', 'body', 'bodypart'])
  return createModelDecorator(to, key, field)
}

To.HEADER = 'header' as ToDest
To.QUERY = 'query' as ToDest
To.QUERY_NAME = 'queryname' as ToDest
To.PARAM = 'param' as ToDest
To.FIELD = 'field' as ToDest
To.BODY = 'body' as ToDest
To.BODY_PARTY = 'bodypart' as ToDest

export const ToHeader = (key?: string, field?: string) => To(To.HEADER, key, field)
export const ToQuery = (key?: string, field?: string) => To(To.QUERY, key, field)
export const ToQueryName = (field?: string) => To(To.QUERY_NAME, undefined, field)
export const ToParam = (key?: string, field?: string) => To(To.PARAM, key, field)
export const ToField = (key?: string, field?: string) => To(To.FIELD, key, field)
export const ToBody = (field?: string) => To(To.BODY, undefined, field)
export const ToBodyParty = (field?: string) => To(To.BODY_PARTY, field)
