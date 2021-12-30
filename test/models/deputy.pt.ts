export interface DeputadoSimples {
  id: string
  nome: string
  email: string
  idLegislatura: string
  siglaPartido: string
  siglaUf: string
  uri: string
  uriPartido: string
  urlFoto: string
}

export interface Gabinete {
  nome: string
  predio: string
  sala: string
  andar: string
  telefone: string
  email: string
}

export interface UltimoStatusDeputado {
  id: number
  uri: string
  nome: string
  siglaPartido: string
  uriPartido: string
  siglaUf: string
  idLegislatura: number
  urlFoto: string
  email: string
  data: string
  nomeEleitoral: string
}

export interface Deputado extends DeputadoSimples {
  nomeCivil: string
  cpf: string
  sexo: string
  urlWebSite: string
  redeSocial: string
  dataNascimento: string
  dataFalecimento: string
  ufNascimento: string
  municipioNascimento: string
  escolaridade: string
  ultimoStatus: UltimoStatusDeputado
}
