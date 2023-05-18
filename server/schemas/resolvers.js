const { gql } = require('apollo-server-express');
const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models/index');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      try {
       if (context.user) {
        const userData = await User.findOne({ _id: context.user._id}).select('__v -password');
        return userData;
       }
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
    addUser: async (parent, args) => {
      try {
        const newUser = await User.create(args);
        const token = signToken(newUser);
        return { token, newUser };
      } catch (err) {
        console.log(err);
      }
    },
    saveBook: async (
      parent,
      { newBook },
      context
    ) => {
      try {
        
        if (context.user) {
          return User.findOneAndUpdate(
            { _id: context.user._id },
            {
              $push: {
                savedBooks: newBook,
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
     
      if (context.user) {
        try {
          return User.findOneAndUpdate(
            { _id: context.user._id },
            { $pull: { savedBooks: { bookId } } },
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