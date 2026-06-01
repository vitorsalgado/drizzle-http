export interface PartidoSimples {
  id: number
  sigla: string
  nome: string
  uri: string
}

export interface LiderPartido {
  uri: string
  nome: string
  siglaPartido: string
  uriPartido: string
  uf: string
  idLegislatura: string
  urlFoto: string
}

export interface StatusPartido {
  data: string
  idLegislatura: string
  situacao: string
  totalPosse: string
  totalMembros: string
  uriMembros: string
  lider: LiderPartido
}

export interface Partido extends PartidoSimples {
  status: StatusPartido
  urlLogo: string
}
