import { Chain } from './Chain'

export interface Interceptor<TReq, TRes> {
  intercept(chain: Chain<TReq, TRes>): Promise<TRes>
}
