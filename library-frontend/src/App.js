
import React, { useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import LoginForm from './components/LoginForm'
import Recommendations from './components/Recommendations'
import { BOOK_ADDED, ALL_BOOKS } from './queries'
import { useApolloClient, useSubscription } from '@apollo/client'
import './App.css'

const App = () => {
  const [page, setPage] = useState('authors')
  const [token, setToken] = useState(null)
  const client = useApolloClient()

  const updateCacheWith = (addedBook) => {
    const includedIn = (set, object) => 
      set.map(p => p.id).includes(object.id)  

    const dataInStore = client.readQuery({ query: ALL_BOOKS })
    if (!includedIn(dataInStore.allBooks, addedBook)) {
      client.writeQuery({
        query: ALL_BOOKS,
        data: { allBooks : dataInStore.allBooks.concat(addedBook) }
      })
    }   
  }

  useSubscription(BOOK_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
      const addedBook = subscriptionData.data.bookAdded
      window.alert(`new book added titled ${addedBook.title}`)
      updateCacheWith(addedBook)

    }
  })

  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
    setPage('authors')
  }

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        {token ? <button onClick={() => setPage('add')}>add book</button> : <button onClick={() => setPage('log in')}>Log in</button>}
        {token ? <button onClick={() => setPage('recommentations')}>recommend</button> : null}
        {token ? <button onClick={() => logout()}>Log out</button> : null}
      </div>

      <LoginForm 
        show={page === 'log in'}
        setPage={setPage}
        setToken={setToken}
      />

      <Authors
        show={page === 'authors'}
        token={token}
      />

      <Books
        show={page === 'books'}
        updateCacheWith={updateCacheWith}
      />

      <NewBook
        show={page === 'add'}
        setPage={setPage}
        updateCacheWith={updateCacheWith}
      />

      <Recommendations
        show={page === 'recommentations'}
      />

    </div>
  )
}

export default App