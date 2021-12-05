export interface Chain<TReq, TRes> {
  request(): TReq

  argv(): unknown[]

  proceed(request: TReq): Promise<TRes>
}

export interface Interceptor<TReq, TRes> {
  intercept(chain: Chain<TReq, TRes>): Promise<TRes>
}
