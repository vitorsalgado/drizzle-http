import { providePartyAPI } from './providePartyAPI'

describe('Party API', function () {
  const api = providePartyAPI()

  describe('when GET /partidos', function () {
    it('should return party list', async function () {
      const parties = await api.parties('pt')

      expect(parties.data).toHaveLength(1)
      expect(parties.data[0].name).toEqual('Partido dos Trabalhadores')
    })
  })
})
