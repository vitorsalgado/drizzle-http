import { ResultadoApi } from './ResultadoApi'
import { ApiResult } from './ApiResult'

export const mapSingle =
  <R, TR>(mapper: (response: R) => TR) =>
  (response: ResultadoApi<R>): ApiResult<TR> => ({
    links: response.links,
    data: mapper(response.dados)
  })
