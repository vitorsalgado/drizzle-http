import { ResultadoApi } from './ResultadoApi.js'
import { ApiResult } from './ApiResult.js'

export const mapSingle =
  <R, TR>(mapper: (response: R) => TR) =>
  (response: ResultadoApi<R>): ApiResult<TR> => ({
    links: response.links,
    data: mapper(response.dados)
  })
