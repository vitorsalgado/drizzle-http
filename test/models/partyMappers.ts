import { Party } from './party'
import { PartySimple } from './party'
import { PartidoSimples } from './party.pt'
import { Partido } from './party.pt'

export function toSimpleParty(dto: PartidoSimples): PartySimple {
  return {
    id: dto.id,
    name: dto.nome,
    acronym: dto.sigla,
    uri: dto.uri
  }
}

export function toParty(dto: Partido): Party {
  return {
    id: dto.id,
    name: dto.nome,
    acronym: dto.sigla,
    uri: dto.uri,
    status: {
      date: dto.status.data,
      termId: dto.status.idLegislatura,
      situation: dto.status.situacao,
      totalMembersOnInauguration: dto.status.totalPosse,
      totalMembers: dto.status.totalMembros,
      membersUri: dto.status.uriMembros,
      leader: {
        uri: dto.status.lider.uri,
        name: dto.status.lider.nome,
        uf: dto.status.lider.uf,
        termId: dto.status.lider.idLegislatura,
        photoUrl: dto.status.lider.urlFoto
      }
    },
    logoUrl: dto.urlLogo
  }
}
