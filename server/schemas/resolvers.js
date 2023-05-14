const { gql } = require('apollo-server-express');
const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models/index');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      try {
        const userId = context.user._id;
        if (!userId) {
          throw new AuthenticationError("Please create an Account!");
        }

        return User.findOne({ _id: userId });
      } catch {
        throw new AuthenticationError(
          "We had trouble Retrieving your Profile. Please try again"
        );
      }
    },
  },

  Mutation: {
    login: async (parent, { email, password }) => {
      try {
        const userProfile = await User.findOne({ email });
        if (!userProfile) {
          throw new AuthenticationError("Could not find Profile");
        }

        const correctPw = await userProfile.isCorrectPassword(password);
        if (!correctPw) {
          throw new AuthenticationError("Incorrect Password");
        }

        const token = signToken(userProfile);
        return { token, userProfile };
      } catch (err) {
        console.log(err, "There has been an internal issue!");
      }
    },
    createUser: async (parent, { username, email, password }) => {
      try {
        const newUser = await User.create({ username, email, password });
        const token = signToken(newUser);
        return { token, newUser };
      } catch (err) {
        console.log(err);
      }
    },
    savebook: async (
      parent,
      { title, author, description, bookId, image, link },
      context
    ) => {
      try {
        const userId = context.user._id;
        if (userId) {
          return User.findOneAndUpdate(
            { _id: userId },
            {
              $addToSet: {
                savedBooks: title,
                author,
                description,
                bookId,
                image,
                link,
              },
            },
            {
              new: true,
              runValidators: true,
            }
          );
        }
        throw new AuthenticationError(
          "You need to be logged in the save books."
        );
      } catch (err) {
        console.log(err);
      }
    },
    removeBook: async (parent, { bookId }, context) => {
      const user = context.user._id;
      if (user) {
        try {
          return User.findOneAndUpdate(
            { _id: context.user._id },
            { $pull: { savedBooks: bookId } },
            { new: true }
          );
        } catch (err) {
          console.log(err);
          throw new AuthenticationError("There has been an error!");
        }
      }
    },
  },
};

module.exports = resolvers;