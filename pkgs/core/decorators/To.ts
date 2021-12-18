import { notNull } from '../internal'
import { anyOf } from '../internal'
import { createModelDecorator } from '../builtin/parameterhandlers/handlers/ModelRegistry'

export type ToDest = 'header' | 'query' | 'queryname' | 'param' | 'field' | 'body'

export function To(to: ToDest, key?: string) {
  notNull(to)
  anyOf(to, ['header', 'query', 'queryname', 'param', 'field', 'body'])
  return createModelDecorator(to, key)
}

To.HEADER = 'header'
To.QUERY = 'query'
To.QUERY_NAME = 'queryname'
To.PARAM = 'param'
To.FIELD = 'field'
To.BODY = 'body'
