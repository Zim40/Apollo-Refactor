const { gql } = require("apollo-server-express");

const typeDefs = gql`
  """
  Defines User Data
  """
  type User {
    _id: ID!
    username: String!
    email: String!
    bookCount: Int
    savedbooks: [Book]
  }
  """
  Defines Book Data
  """
  type Book {
    bookId: ID!
    authors: [String]
    description: String
    image: String
    link: String
    title: String
  }
  """
  Defines Auth Data
  """
  type Auth {
    token: ID!
    user: User
  }

  type Query {
    me: User
  }

  input SaveBook {
    bookId: String
    authors: [String]
    description: String
    title: String
    image: String
    link: String
  }
  """
  Defines Data Field queries for Resolvers
  """
  type Mutation {
    login(email: String!, password: String!): Auth

    addUser(username: String!, email: String!, password: String!): Auth

    saveBook(input: SaveBook!): User

    removeBook(bookId: String!): User
  }
`;

module.exports = typeDefs;
