const { gql } = require('apollo-server-express');
const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models/index');

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
      };
      
    },
  },
};