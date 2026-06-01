import { ResultadoApi } from './ResultadoApi.js'
import { ApiResult } from './ApiResult.js'

export const mapList =
  <R, TR>(mapper: (response: R) => TR) =>
  (response: ResultadoApi<R[]>): ApiResult<TR[]> => ({
    links: response.links,
    data: response.dados.map(mapper)
  })
