import React, { useState } from 'react'
import { useQuery } from '@apollo/client'
import { ALL_BOOKS } from '../queries'

const Books = (props) => {
  const [filteredGenre, setFilteredGenre] = useState('')
  const result = useQuery(ALL_BOOKS)

  if (!props.show) {
    return null
  }

  if (result.loading) {
    return <div><h2>books</h2><div>loading...</div></div>
  }

  const books = result.data.allBooks

  const genres = new Set()
  

  books.forEach(book => {
    book.genres.forEach(genre => genres.add(genre))
  });

  let filteredBooks = books
  if (filteredGenre !== '') {
      filteredBooks = books.filter(book => book.genres.includes(filteredGenre))
  }

  const genreArray = Array.from(genres)
  return (
    <div>
      <h2>books</h2>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              author
            </th>
            <th>
              published
            </th>
          </tr>
          {filteredBooks.map(a =>
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          )}
        </tbody>
      </table>
          <div>
            <button key='all' onClick={() => setFilteredGenre('')}>All</button>
            {genreArray.map(genre => 
              <button key={genre} onClick={({target}) => setFilteredGenre(target.textContent)}>{genre}</button>
          )}</div>
    </div>
  )
}

export default Books