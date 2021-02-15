import {
  Accept,
  CORS,
  Drizzle,
  FetchCallFactory,
  GET,
  KeepAlive,
  Query,
  Response,
  theTypes
} from '@drizzle-http/browser'
import { useState } from 'react'
import './App.css'
import logo from './logo.svg'

class DeputiesApi {
  @GET('/partidos')
  @Accept('application/json;charset=utf-8')
  @CORS()
  @KeepAlive(true)
  parties (@Query('sigla') acronym, @Query('ordem') orderBy) {
    return theTypes(Promise, Response)
  }
}

const deputiesApi = Drizzle.builder()
  .baseUrl('https://dadosabertos.camara.leg.br/api/v2/')
  .callFactory(FetchCallFactory.DEFAULT)
  .build()
  .create(DeputiesApi)

function App () {
  const [parties, updateParties] = useState([])

  const onPartiesSearch = value =>
    updateParties({
      offers: parties.dados.filter(party => party.name.toLowerCase().indexOf(value) >= 0)
    })

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <button onClick={onPartiesSearch}>Search Parties</button>
      </header>
    </div>
  )
}

export default App
