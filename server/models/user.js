const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    minlength: 1,
    trim: true,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: "value is not a valid email"
    }
  },
  password: {
    type: String,
    require: true,
    minlength: 6
  },
  tokens: [{
    access: {
      type: String,
      require: true
    },
    token: {
      type: String,
      require: true
    }
  }]  
});

/**
 * Override the toJSON() method, to return only the properties speciafied below
 * such as _id and email.
 * 
 * If that method is not overrided, whenever making a request to the user
 * endpoint, it would send back not only the _id and email properties, but also
 * the password and the tokens, which should not be visible to whoever is making 
 * the HTTP request.
 */
UserSchema.methods.toJSON = function () {
  const user = this;
  /**
   * mangoose varible user and convert to a regular object with only the 
   * properties specified here.
   */
  const userObject = user.toObject();

  return _.pick(userObject, ['_id', 'email']);
};

/**
 * UserSchema.methods is an object, which allows to create
 * new instance methods, in this case the method generateAuthToken
 * is being created.
 * 
 * This cannot use the arrow function syntax, since it doesn't
 * bind the `this` keyword, which in this case is necessary to
 * access the document data.
 */
UserSchema.methods.generateAuthToken = function() {
  const user = this;
  const SECRET_TOKEN = 'ABC123';

  /**
   * Both the access and token varibles will hold the values for the user's
   * tokens array declared above.
   */
  const access = 'AUTH';
  const token = jwt.sign({_id: user._id.toHexString(), access}, SECRET_TOKEN).toString();

  /**
   * The following line the token and access variables are being store to the
   * user's tokens array.
   */
  user.tokens = user.tokens.concat([{access, token}]);

  // It sends back the token assigned to that user
  return user.save().then(() => {
    return token;
  });
};

// Defining a User model
const User = mongoose.model('User', UserSchema);

module.exports = {
  User
};
