import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import { deputiesApi } from './api'

function App() {
  const [parties, updateParties] = useState([])
  const [acronym, setAcronym] = useState('')

  const onPartiesSearch = () => deputiesApi.parties(acronym).then(parties => updateParties([...parties.dados]))

  return (
    <div>
      <input type="text" onChange={event => setAcronym(event.target.value)} />
      <button onClick={onPartiesSearch}>Search Parties</button>
      <ol>
        {parties.map(party => (
          <li key={party.id}>
            {party.sigla}: {party.nome}
          </li>
        ))}
      </ol>
    </div>
  )
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
)
