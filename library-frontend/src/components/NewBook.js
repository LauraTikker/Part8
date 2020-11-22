import React, { useState } from 'react'
import { ADD_NEW_BOOK } from '../queries'
import { useMutation } from '@apollo/client'

const NewBook = ({show, setPage, updateCacheWith}) => {
  const [title, setTitle] = useState('')
  const [author, setAuhtor] = useState('')
  const [publishedYear, setPublishedYear] = useState('')
  const [genre, setGenre] = useState('')
  const [genres, setGenres] = useState([])

  const [ addNewBook ] = useMutation(ADD_NEW_BOOK, {
    update: (store, response) => {
      updateCacheWith(response.data.addBook)    
    }
  })

  if (!show) {
    return null
  }

  const submit = async (event) => {
    event.preventDefault()

    const published = Number(publishedYear)
    
    addNewBook({ variables: {title, published, author, genres }})

    setTitle('')
    setPublishedYear('')
    setAuhtor('')
    setGenres([])
    setGenre('')
    setPage('books')
  }

  const addGenre = () => {
    setGenres(genres.concat(genre))
    setGenre('')
  }

  return (
    <div>
      <form onSubmit={submit}>
        <div>
          title
          <input
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>
        <div>
          author
          <input
            value={author}
            onChange={({ target }) => setAuhtor(target.value)}
          />
        </div>
        <div>
          published
          <input
            type='number'
            value={publishedYear}
            onChange={({ target }) => setPublishedYear(target.value)}
          />
        </div>
        <div>
          <input
            value={genre}
            onChange={({ target }) => setGenre(target.value)}
          />
          <button onClick={addGenre} type="button">add genre</button>
        </div>
        <div>
          genres: {genres.join(' ')}
        </div>
        <button type='submit'>create book</button>
      </form>
    </div>
  )
}

export default NewBook