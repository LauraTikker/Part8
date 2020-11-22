  
import React, { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { ALL_AUTHORS, ADD_BIRTH_YEAR } from '../queries'


const Authors = (props) => {
  const result = useQuery(ALL_AUTHORS, {
    pollInterval: 2000  })
  const [name, setName] = useState('')
  const [yearBorn, setYearBorn] = useState('')

  const [ addBirthYear ] = useMutation(ADD_BIRTH_YEAR)

  if (!props.show) {
    return null
  }

  if (result.loading) {
    return <div><h2>authors</h2><div>loading...</div></div>
  }

  const authors = result.data.allAuthors
  
  const onSubmit = async (event) => {
    event.preventDefault()

    const born = Number(yearBorn)
    
    addBirthYear({ variables: { name, born }})

    setName('')
    setYearBorn('')
  }

  const changeBirthYear = () => {
    return (
      <div>
         <h2>Set birthyear</h2>
      <form onSubmit={onSubmit}>
        <div>
          name
          <select defaultValue={'DEFAULT'} onChange={({ target }) => setName(target.value)}>
          <option disabled value="DEFAULT"> -- select an author -- </option>
            {authors.map(a =>
            <option key={a.id} value={a.name}>{a.name} </option>
          )}
          </select>
        </div>
        <div>
          born
          <input
            value={yearBorn}
            onChange={({ target }) => setYearBorn(target.value)}
          />
        </div>
        <button type='submit'>update author</button>
      </form>     
      </div>
    )
  }

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              born
            </th>
            <th>
              books
            </th>
          </tr>
          {authors.map(a =>
            <tr key={a.id}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          )}
        </tbody>
      </table>
            {props.token ? changeBirthYear() : null}
    </div>
  )
}

export default Authors
