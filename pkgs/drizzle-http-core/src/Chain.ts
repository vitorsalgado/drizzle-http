export interface Chain<TReq, TRes> {
  request(): TReq

  argv(): unknown[]

  proceed(request: TReq): Promise<TRes>
}
