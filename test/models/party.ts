export interface PartySimple {
  id: number
  acronym: string
  name: string
  uri: string
}

export interface PartyLeader {
  uri: string
  name: string
  uf: string
  termId: string
  photoUrl: string
}

export interface PartyStatus {
  date: string
  termId: string
  situation: string
  totalMembersOnInauguration: string
  totalMembers: string
  membersUri: string
  leader: PartyLeader
}

export interface Party extends PartySimple {
  status: PartyStatus
  logoUrl: string
}
