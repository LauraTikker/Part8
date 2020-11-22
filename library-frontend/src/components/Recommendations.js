/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react'
import { useQuery, useLazyQuery } from '@apollo/client'
import { BOOKS_FILTERED_BY_GENRE, ME } from '../queries'

const Recommendations = (props) => {
  const userResult = useQuery(ME)
  const [getAllBooks, result ] = useLazyQuery(BOOKS_FILTERED_BY_GENRE, {
    pollInterval: 2000  })

 useEffect(() => {
    if (userResult.data && userResult.data.me !== null) {
    getAllBooks({ variables: { genre: userResult.data.me.favoriteGenre} })
  }

}, [userResult.data])   

  if (!props.show) {
    return null
  }

  if (userResult.loading || result.loading) {
    return <div><h2>Recommendations</h2><div>loading...</div></div>
  }

  const allBooks = result.data ? result.data.allBooks : []

  return (
    <div>
      <h2>recommendations</h2>
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
          {allBooks.map(a =>
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default Recommendations