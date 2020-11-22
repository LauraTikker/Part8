import { gql } from '@apollo/client'

const BOOK_DETAILS = gql`
fragment BookDetails on Book {
  title
    published
    author {
      name,
      born
    }
    genres,
    id
}
`
export const ALL_AUTHORS = gql`
query {
    allAuthors  {
    name,
    born,
    bookCount,
    id
  }
}
`

export const ALL_BOOKS = gql`
query {
    allBooks {
      ...BookDetails
  }
}
${BOOK_DETAILS}
`

export const BOOKS_FILTERED_BY_GENRE = gql`
query allBooks($genre: String!) {
    allBooks(genre: $genre)  {
      ...BookDetails
  }
}
${BOOK_DETAILS}
`

export const ADD_NEW_BOOK = gql`
mutation addBook($title: String!, $published: Int!, $author: String!, $genres: [String!]!) {
    addBook(
    title: $title,
    published: $published,
    author: $author,
    genres: $genres,
  ) {
    ...BookDetails
  }
}
${BOOK_DETAILS}
`

export const ADD_BIRTH_YEAR = gql`
mutation editAuthor($name: String!, $born: Int!) {
    editAuthor(
    name: $name,
    born: $born
  ) {
    name
    born
  }
}
`

export const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password)  {
      value
    }
  }
`

export const ME = gql`
query {
  me {
  username,
  favoriteGenre,
  }
}
`

export const BOOK_ADDED = gql`
subscription {    
  bookAdded {      
    ...BookDetails    
  }  
}
${BOOK_DETAILS}
`