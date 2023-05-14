const { gql } = require('apollo-server-express');
const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models/index');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      try {
        const userId = context.user._id;
        return User.findOne({ _id: userId });
      } catch {
        throw new AuthenticationError(
          "We had trouble Retrieving your Profile. Please try again"
        );
      }
    },
  },

  Mutation: {
    login: async (parent, { username, email, password }) => {
      try {
        const userProfile = await User.findOne({ username });
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
            const newUser = await User.create({username, email, password});
            const token = signToken(newUser);
            return { token, newUser };
        } catch (err) {
            console.log(err);
        }
    }
  },
};