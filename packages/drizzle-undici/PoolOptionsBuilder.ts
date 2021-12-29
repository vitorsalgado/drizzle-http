import { TlsOptions } from 'tls'
import { URL } from 'url'
import Pool from 'undici/types/pool'
import { Dispatcher } from 'undici'

export class PoolOptionsBuilder {
  private _connections?: number
  private _socketPath?: string
  private _keepAliveTimeout?: number
  private _keepAliveMaxTimeout?: number
  private _keepAliveTimeoutThreshold?: number
  private _pipelining?: number
  private _tls?: TlsOptions
  private _maxHeaderSize?: number
  private _headersTimeout?: number
  private _bodyTimeout?: number
  private _factory?: (origin: URL, opts: object) => Dispatcher

  static newBuilder(): PoolOptionsBuilder {
    return new PoolOptionsBuilder()
  }

  connections(connections: number): this {
    this._connections = connections
    return this
  }

  socketPath(path?: string): this {
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

  tls(opts?: TlsOptions): this {
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

  factory(factory?: (origin: URL, opts: object) => Dispatcher): this {
    this._factory = factory
    return this
  }

  build(): Pool.Options {
    return {
      connections: this._connections,
      keepAliveTimeout: this._keepAliveTimeout,
      keepAliveMaxTimeout: this._keepAliveMaxTimeout,
      keepAliveTimeoutThreshold: this._keepAliveTimeoutThreshold,
      pipelining: this._pipelining,
      tls: this._tls,
      maxHeaderSize: this._maxHeaderSize,
      headersTimeout: this._headersTimeout,
      bodyTimeout: this._bodyTimeout,
      factory: this._factory
    }
  }
}
