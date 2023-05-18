const express = require('express');

// imported ApolloServer from installed package
const { ApolloServer } = require('apollo-server-express');
const path = require('path');

// Deconstructed schema folder to import typeDefs and Resolvers/ (query data and "mutations").
const { typeDefs, resolvers } = require('./schemas/index');
const db = require('./config/connection');

const { authMiddleware } = require('./utils/auth');

const app = express();
const PORT = process.env.PORT || 3001;

// Created new isntance of ApolloServer passing in typeDefs and Resolver data.
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware,
});



app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
};

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// Activated Apollo server while also activating middleware (middleware eventually will be JWT token access for each request).
const startApolloServer = async (typeDefs, resolvers) => {
  await server.start();
  server.applyMiddleware({ app });
  
// opening MongoDb connection listening to Heroku chosen port, if not that port then PORT: 3001
  db.once("open", () => {
    app.listen(PORT, () => {
      console.log(`🌍 Now listening on localhost:${PORT}`);
      console.log(
        `Use graphQL at http://localhost:${PORT}${server.graphqlPath}`
      );
    });
  });
};

// Call startApolloServer() function to activate server. 
startApolloServer(typeDefs, resolvers);



