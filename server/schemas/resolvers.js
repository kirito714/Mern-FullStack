const { AuthenticationError } = require("apollo-server-express");
const { User, Book } = require("../models");
const { signToken } = require("../utils/auth");

const resolvers = {
  Query: {
    user: async (parent, { username }) => {
      return User.findOne({ username }).populate("book");
    },

    book: async (parent, { bookId }) => {
      return Book.findOne({ bookId: bookId });
    },
    me: async (parent, args, context) => {
      if (context.user) {
        return User.findOne({ _id: context.user._id }).populate("book");
      }
      throw new AuthenticationError("You need to be logged in!");
    },
  },

  Mutation: {
    createUser: async (parent, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);
      return { token, user };
    },
    loginUser: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError("No user found with this email address");
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError("Incorrect credentials");
      }

      const token = signToken(user);

      return { token, user };
    },
    saveBook: async (
      parent,
      { name, authors, description, title, image, link },
      context
    ) => {
      if (context.user) {
        const book = await Book.create({
          name,
          authors,
          description,
          title,
          image,
          link,
        });

        await User.findOneAndUpdate(
          { bookId: context.user._id },
          { $addToSet: { books: books.booksId } }
        );

        return book;
      }
      throw new AuthenticationError("You need to be logged in!");
    },

    deleteBook: async (parent, { bookId }, context) => {
      if (context.user) {
        const book = await Thought.findOneAndDelete({
          bookId: bookId,
        });

        await User.findOneAndUpdate(
          { bookId: context.user._id },
          { $pull: { books: book.bookId } }
        );

        return book;
      }
      throw new AuthenticationError("You need to be logged in!");
    },
  },
};

module.exports = resolvers;
