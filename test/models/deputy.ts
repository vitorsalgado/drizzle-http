export interface DeputySimple {
  id: string
  name: string
  email: string
  termId: string
  partyAcronym: string
  uf: string
  uri: string
  partyUri: string
  photoUri: string
}

export interface Cabinet {
  name: string
  building: string
  room: string
  floor: string
  phone: string
  email: string
}

export interface LastDeputyStatus {
  id: number
  uri: string
  name: string
  partyAcronym: string
  partyUri: string
  uf: string
  termId: number
  photoUri: string
  email: string
  date: string
  electoralName: string
}

export interface Deputy extends DeputySimple {
  civilName: string
  cpf: string
  gender: string
  websiteUrl: string
  socialNetwork: string
  birthDate: string
  deathDate: string
  birthState: string
  birthCity: string
  schooling: string
  lastStatus: LastDeputyStatus
}
