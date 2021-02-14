export interface Chain<TReq, TRes> {
  request(): TReq

  argv(): any[]

  proceed(request: TReq): Promise<TRes>
}

export interface Interceptor<TReq, TRes> {
  intercept(chain: Chain<TReq, TRes>): Promise<TRes>
}
