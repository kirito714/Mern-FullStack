
// require express
const express = require("express");
// require path
const path = require("path");
//require ApolloServer
const { ApolloServer } = require('apollo-server-express');
// destructure typeDefs and resolvers and require ./schemas
const { typeDefs, resolvers } = require("./schemas");
// destructuring AuthMiddleware and require ./utils/auth
const { authMiddleware } = require('./utils/auth');
// require the ./config/connection
const db = require("./config/connection");
//require the ./routes
// const routes = require("./routes");
// app.use(routes);

const PORT = process.env.PORT || 3001;
const app = express();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware,
})

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

server.applyMiddleware({ app });

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/build")));
}

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});


db.once("open", () => {
  app.listen(PORT, () => console.log(`🌍 Now listening on localhost:${PORT}`));
});
