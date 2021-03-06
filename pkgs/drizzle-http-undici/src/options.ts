import { TlsOptions } from 'tls'
import Pool from 'undici/types/pool'

export class UndiciOptionsBuilder {
  private _connections?: number
  private _socketPath?: string | null
  private _keepAliveTimeout?: number
  private _keepAliveMaxTimeout?: number
  private _keepAliveTimeoutThreshold?: number
  private _pipelining?: number
  private _tls?: TlsOptions | null
  private _maxHeaderSize?: number
  private _headersTimeout?: number
  private _bodyTimeout?: number

  connections(conns: number): this {
    this._connections = conns
    return this
  }

  static newBuilder(): UndiciOptionsBuilder {
    return new UndiciOptionsBuilder()
  }

  socketPath(path: string | null): this {
    this._socketPath = path
    return this
  }

  keepAliveTimeout(timeout: number): this {
    this._keepAliveTimeout = timeout
    return this
  }

  keepAliveMaxTimeout(timeout: number): this {
    this._keepAliveMaxTimeout = timeout
    return this
  }

  keepAliveTimeoutThreshold(timeout: number): this {
    this._keepAliveTimeoutThreshold = timeout
    return this
  }

  pipelining(value: number): this {
    this._pipelining = value
    return this
  }

  tls(opts: TlsOptions | null): this {
    this._tls = opts
    return this
  }

  maxHeaderSize(max: number): this {
    this._maxHeaderSize = max
    return this
  }

  headersTimeout(timeout: number): this {
    this._headersTimeout = timeout
    return this
  }

  bodyTimeout(timeout: number): this {
    this._bodyTimeout = timeout
    return this
  }

  build(): Pool.Options {
    return {
      connections: this._connections,
      socketPath: this._socketPath,
      keepAliveTimeout: this._keepAliveTimeout,
      keepAliveMaxTimeout: this._keepAliveMaxTimeout,
      keepAliveTimeoutThreshold: this._keepAliveTimeoutThreshold,
      pipelining: this._pipelining,
      tls: this._tls,
      maxHeaderSize: this._maxHeaderSize,
      headersTimeout: this._headersTimeout,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      bodyTimeout: this._bodyTimeout
    }
  }
}
