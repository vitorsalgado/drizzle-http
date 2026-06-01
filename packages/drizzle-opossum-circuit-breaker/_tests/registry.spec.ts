import CircuitBreaker from 'opossum'
import { CircuitBreakerRegistry } from '../CircuitBreakerRegistry'

describe('Circuit Breaker Registry', function () {
  const registry = new CircuitBreakerRegistry()

  it('should ', function () {
    const cb1 = new CircuitBreaker(() => Promise.resolve(), { name: 'test01' })
    const cb2 = new CircuitBreaker(() => Promise.resolve(), { name: 'test02' })

    registry.register(cb1)
    registry.register(cb2)

    const one = registry.find('test01')

    expect(one).not.toBeNull()
    expect(one?.name).toEqual('test01')

    for (const [name, cb] of registry) {
      expect(name).toBeDefined()
      expect(cb).toBeDefined()
    }

    const all = registry.list()

    expect(all).toHaveLength(2)
    expect(all[0].name).toEqual('test01')
    expect(all[1].name).toEqual('test02')
  })
})
