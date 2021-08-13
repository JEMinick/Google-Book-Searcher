const { User, Book } = require('../models');
const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');
// const { param } = require('../routes');

const resolvers = {

    Query: {

        showUsers: async ( parent, args, context ) => {
            const userInfo = await User.find({})
            .populate('savedBooks')
            return userInfo;
        },
        
        //get a user by username
        me: async (parent, args, context) => {
            if ( context.user ) {
                const userData = await User.findOne({ _id: context.user._id })
                // .select('-__v -password')
                .populate('savedBooks')
                return userData;
            }
            throw new AuthenticationError('Not logged in')
        },

    },

    Mutation: {

        addUser: async (parent, args) => {
            // console.log(`Mutation:addUser`);
            // console.log( args );
            const user = await User.create(args);
            const token = signToken(user);
          
            return {token, user};
        },

        login: async (parent, {email, password}) => {
            // console.log( '\nlogin():')
            // console.log( `email:`, email );
            // console.log( `password:`, password, '\n' );
            const user = await User.findOne({email});

            if(!user) {
                throw new AuthenticationError('Incorrect credentials');
            }

            const correctPw = await user.isCorrectPassword(password);

            if(!correctPw) {
                throw new AuthenticationError('Incorrect credentials');
            }

            const token = signToken(user);
            return {token, user};
    
        },

        saveBook: async (parent, args, context) => {
            if (context.user) {
            //   const savedBook = await Book.create({ ...args, username: context.user.username });
          
             const updatedUser =  await User.findByIdAndUpdate(
                { _id: context.user._id },
                { $addToSet: { savedBooks: args.input } },
                { new: true }
              );
          
            return updatedUser;
            }
          
            throw new AuthenticationError('You need to be logged in!');
        },



        removeBook: async (parent, args, context) => {
            if(context.user) {
            const updatedUser = await User.findOneAndUpdate(
                { _id: context.user._id },
                { $pull: { savedBooks: { bookId: args.bookId } } },
                { new: true }
            );

            return updatedUser;
            }

            throw new AuthenticationError('You need to be logged in!');
        }
    }
};

module.exports = resolvers;