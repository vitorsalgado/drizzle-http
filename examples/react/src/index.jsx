import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import PartiesClientAPI from './api'

function App() {
  const [parties, updateParties] = useState([])
  const [acronym, setAcronym] = useState('')

  const onPartiesSearch = () =>
    PartiesClientAPI
      .parties(acronym)
      .then(response => response.json())
      .then(parties =>
        updateParties([...parties.dados]))

  return (
    <div>
      <input type='text' onChange={event => setAcronym(event.target.value)} />
      <button onClick={onPartiesSearch}>Search Parties</button>
      <ol>
        {
          parties.map(party =>
            <li>
              {party.sigla}: {party.nome}
            </li>
          )
        }
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
