const config = require('./config')
const { ApolloServer, gql, UserInputError, AuthenticationError, PubSub } = require('apollo-server')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const Book = require('./models/book')
const Author = require('./models/author')
const User = require('./models/user')
const pubsub = new PubSub()

const MONGODB_URI = config.MONGODB_URI
const JWT_SECRET = config.JWT_SECRET

console.log('connecting to', MONGODB_URI)

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })


const typeDefs = gql`

  type Subscription {
    bookAdded: Book!
  }

  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }

  type Token {
    value: String!
  }

  type Author {
    name: String!,
    id: ID!,
    born: String,
    bookCount: Int
  }

  type Book {
    title: String!,
    published: Int!,
    author: Author!,
    id: ID!,
    genres: [String!]
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(genre: String, author: String): [Book]
    allAuthors: [Author!]!
    me: User
  }

  type Mutation {
    addBook(
      title: String!,
      published: Int!,
      author: String!,
      genres: [String!]!
    ): Book,
    editAuthor(
      name: String!,
      born: Int!
    ): Author,
    createUser(
      username: String!
      favoriteGenre: String!
    ): User
    login(
      username: String!
      password: String!
    ): Token
  }
`

const resolvers = {
  Query: {
      bookCount: () => Book.collection.countDocuments(),
      authorCount: () => Author.collection.countDocuments(),
      allBooks: async (root, args) => {
          if (JSON.stringify(args) !== '{}') {

            if (args.author) {
              const books = await Book.find({}).populate('author')
              return books.filter(books => books.author.name === args.author)
            } else if (args.genre) {
              return await Book.find({ genres: { $in: [args.genre]}}).populate('author')
            }
          
        } else {
            return Book.find({}).populate('author')
        }
    },
      allAuthors: () => Author.find({}).populate('books'),
      me: (root, args, context) => {
        return context.currentUser
      }
  },

  Mutation: {
    addBook: async (root, args, context) => {
      const currentUser = context.currentUser
      if (!currentUser) {
        throw new AuthenticationError("not authenticated")
      }
      
      const isAuthorPresent = await Author.findOne({name: args.author}).populate('books')
      const book = new Book({...args, author: isAuthorPresent})
      if (isAuthorPresent) {
        try {
          const booksOfAuthor = isAuthorPresent.books
          await isAuthorPresent.updateOne({books: booksOfAuthor.concat(book)})
        } catch (error) {
          throw new UserInputError(error.message, {
            invalidArgs: args,
          })
        }
      }
      if (!isAuthorPresent) {
          const newAuthor = {
          name: args.author,
          books: [book]
        }
        const author = new Author({...newAuthor})
        book.author = author
        try {
          await author.save()
        } catch (error) {
          throw new UserInputError(error.message, {
            invalidArgs: args,
          })
        }
      }
      try {
        await book.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }

      pubsub.publish('BOOK_ADDED', { bookAdded: book})

      return book
    },
    editAuthor: async (root, args, context) => {
      const currentUser = context.currentUser
      if (!currentUser) {
        throw new AuthenticationError("not authenticated")
      }

      const isAuthorPresent = await Author.findOne( {name: args.name })
      if (isAuthorPresent) {

      isAuthorPresent.born = args.born
      
      try {
        await isAuthorPresent.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }
      return isAuthorPresent
      } else {
        return null
      }
    },
    createUser: async (root, args) => {

      const user = new User({ ...args})
      
      try {
        await user.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }
      return user
    },
    login: async (root, args) => {

      const user = await User.findOne({ username: args.username})
      
      if (!user || args.password !== 'secred') {
        throw new UserInputError("wrong credentials")
      }
      
      const userForToken = {
        username: user.username,
        id: user._id,
      }

      return { value: jwt.sign(userForToken, JWT_SECRET) }
    },
  },

  Author: {
    bookCount: (root) => {
      console.log(root.books)
      return root.books.length
    }
  },

  Subscription: {    
    bookAdded: {      
      subscribe: () => pubsub.asyncIterator(['BOOK_ADDED'])    
    },
  },
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {    
    const auth = req ? req.headers.authorization : null
    if (auth && auth.toLowerCase().startsWith('bearer ')) {      
      const decodedToken = jwt.verify(        
        auth.substring(7), JWT_SECRET      
        )      
        const currentUser = await User.findById(decodedToken.id)   
        return { currentUser }    
      }
      return null
    }
})

server.listen().then(({ url, subscriptionsUrl }) => {
  console.log(`Server ready at ${url}`)
  console.log(`Subscriptions ready at ${subscriptionsUrl}`)
})