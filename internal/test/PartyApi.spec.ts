import { providePartyAPI } from './providePartyAPI.js'

describe('Party API', function () {
  const api = providePartyAPI()

  describe('when GET /partidos', function () {
    it(
      'should return party list',
      { retry: 2, timeout: 30000 },
      async function () {
        const parties = await api.parties('pt')

        expect(parties.data).toHaveLength(1)
        expect(parties.data[0].name).toEqual('Partido dos Trabalhadores')
      }
    )
  })
})
