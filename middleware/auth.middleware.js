const Joi = require('joi');

const models = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const saltRounds = 10;
const hashPassword = (password) => {
  const salt = bcrypt.genSaltSync(saltRounds);
  const hash = bcrypt.hashSync(password, salt);
  return hash;
};

const forgotPasswordSchema = Joi.object({
  user: Joi.string().required(),
  product_code: Joi.string().required(),
});

const productCodeSchema = Joi.object({
  product_code: Joi.string().required(),
});

const resetPasswordSchema = Joi.object({
  password: Joi.string().required().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),

  password_confirmation: Joi.ref('password'),
  product_code: Joi.string().required(),
});

const signinSchema = Joi.object({
  user: Joi.string().required(),
  password: Joi.string().required(),
  product_code: Joi.string().required(),
});

/**
 * Validate user's input
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.isInputValidated = async (req, res, next) => {
  const result = forgotPasswordSchema.validate(req.body);
  // console.log(result)
  if ('error' in result) {
    res.status(400).json({
      error: 1,
      data: result,
      msg: 'Validation error(s)',
    });
  } else {
    next();
  }
};

/**
 * Validate user's password input
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.isPasswordInputValidated = async (req, res, next) => {
  const result = resetPasswordSchema.validate(req.body);
  // console.log(result)
  if ('error' in result) {
    res.status(400).json({
      error: 1,
      data: result,
      msg: 'Validation error(s)',
    });
  } else {
    next();
  }
};

/**
 * Validate user's product code input
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.isProductCodeInputValidated = async (req, res, next) => {
  const result = productCodeSchema.validate(req.body);
  // console.log(result)
  if ('error' in result) {
    res.status(400).json({
      error: 1,
      data: result,
      msg: 'Validation error(s)',
    });
  } else {
    next();
  }
};

/**
 * Validate login input
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.isSigninInputValidated = async (req, res, next) => {
  const result = signinSchema.validate(req.body);

  if ('error' in result) {
    res.status(400).json({
      error: 1,
      data: result,
      msg: 'Validation error(s)',
    });
  } else {
    next();
  }
};

/**
 * Validate user's product
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.validateUserProduct = async (req, res, next) => {
  let { product_code, user } = req.body;

  if (req._data !== undefined) {
    let { email } = req._data;
    user = email;
  }

  try {
    // get product
    const productResult = await models.products.findOne({
      where: { product_code },
    });
    if (productResult === null) {
      res.status(400).json({
        error: 1,
        msg: 'Product not found!',
      });
    } else {
      // check user's product
      const userProduct = await models.users.findOne({
        where: {
          [Op.or]: [{ phone: user }, { email: user }, { name: user }],
          product_id: productResult.id,
        },
      });
      if (userProduct === null) {
        res.status(400).json({
          error: 1,
          msg: 'Permission Error!',
        });
      } else {
        next();
      }
    }
  } catch (error) {
    res.status(400).json({
      error: 1,
      msg: error,
    });
  }
};

/**
 * Function to verify the product that a user's role belongs to
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.verifyOwner = async (req, res, next) => {
  const { product_id, user } = req.body;
  try {
    let result = await models.Users.findOne({
      where: {
        [Op.or]: [{ phone: user }, { email: user }, { name: user }],
        include: [{ model: Products }, { model: Roles }],
      },
    });
    if (result === null) {
      res.json({
        error: 1,
        msg: 'User does not exist!',
      });
    } else {
      // Check if product exists
      let product_result = await models.Products.findOne({
        where: { id: product_id },
      });
      if (product_result === null) {
        res.json({
          error: 1,
          msg: 'Product does not exist!',
        });
      } else {
        // Check if the user's role exists
        let role_result = await models.Roles.findOne({
          where: { id: product_result.role_id },
        });
        if (role_result === null) {
          res.json({
            error: 1,
            msg: 'Role does not exist!',
          });
        } else {
          // Check if the provided product id is the same as the one associated with the role
          if (product_id !== role_result.product_id) {
            res.json({
              error: 1,
              msg: 'User does not belong this product!',
            });
          } else {
            next();
          }
        }
      }
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({
      error: 1,
      msg: error,
    });
  }
};

/**
 * Function to verify email address after registration
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.verifyEmail = async (req, res, next) => {
  const bearerHeader = req.headers['authorization'];

  if (typeof bearerHeader !== 'undefined') {
    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1];

    try {
      const decrypted_data = await jwt.verify(
        bearerToken,
        process.env.private_sso_key
      );
      let user_data = await models.users.findOne({
        where: { email: decrypted_data.email, sso_id: decrypted_data.otpID },
      });

      if (user_data === null) {
        res.status(400).json({
          error: 1,
          msg: 'Token is invalid!',
        });
      } else {
        // activate account and activate email
        await models.users.update(
          { active: 1, email_verified: 1 },
          {
            where: {
              email: decrypted_data.email,
              sso_id: decrypted_data.otpID,
            },
          }
        );
        req._data = {
          access_token: bearerToken,
          ...decrypted_data,
        };
        next();
      }
    } catch (error) {
      console.log(error);
      res.status(400).json({
        error: 1,
        msg: error,
      });
    }
  } else {
    res.status(400).json({
      error: 1,
      msg: 'Authorization is required!',
    });
  }
};

/**
 * Function to verify password reset otp through the access_token
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.verifyPasswordResetOtp = async (req, res, next) => {
  const bearerHeader = req.headers['authorization'];

  if (typeof bearerHeader !== 'undefined') {
    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1];

    try {
      const decrypted_data = await jwt.verify(
        bearerToken,
        process.env.private_sso_key
      );

      let user_data = await models.users.findOne({
        where: { email: decrypted_data.email, sso_id: decrypted_data.otpID },
      });

      if (user_data === null) {
        res.status(400).json({
          error: 1,
          msg: 'Token is invalid!',
        });
      } else {
        let current_date = new Date().getTime();
        let password_expiration = new Date(
          user_data.sso_token_expiry
        ).getTime();

        if (current_date >= password_expiration) {
          res.json({
            error: 1,
            msg: 'Password reset link has expired!',
          });
        } else {
          req._data = {
            access_token: bearerToken,
            ...decrypted_data,
          };
          next();
        }
      }
    } catch (error) {
      console.log(error);
      res.status(400).json({
        error: 1,
        msg: error,
      });
    }
  } else {
    res.status(400).json({
      error: 1,
      msg: 'Authorization is required!',
    });
  }
};

/**
 * Function to verify password reset otp through the access_token passed as header
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.verifyPasswordResetTokenPassedAsHeader = async (req, res, next) => {
  const bearerHeader = req.headers['authorization'];

  if (typeof bearerHeader !== 'undefined') {
    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1];

    try {
      const decrypted_data = await jwt.verify(
        bearerToken,
        process.env.private_sso_key
      );
      let user_data = await models.users.findOne({
        where: { email: decrypted_data.email, sso_id: decrypted_data.otpID },
      });

      if (user_data === null) {
        res.status(400).json({
          error: 1,
          msg: 'Token is invalid!',
        });
      } else {
        let current_date = new Date().getTime();
        let password_expiration = new Date(
          user_data.sso_token_expiry
        ).getTime();

        if (current_date >= password_expiration) {
          res.json({
            error: 1,
            msg: 'Password reset link has expired!',
          });
        } else {
          req._data = {
            access_token: bearerToken,
            ...decrypted_data,
          };
          next();
        }
      }
    } catch (error) {
      console.log(error);
      res.status(400).json({
        error: 1,
        msg: error,
      });
    }
  } else {
    res.status(400).json({
      error: 1,
      msg: 'Authorization is required!',
    });
  }
};

/**
 * Function to authenticate any kind of user
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */

exports.authenticateUser = async (req, res, next) => {
  const bearerHeader = req.headers['authorization'];

  try {
    if (typeof bearerHeader !== 'undefined') {
      const bearer = bearerHeader.split(' ');
      const bearerToken = bearer[1];

      const user_data = await jwt.verify(
        bearerToken,
        process.env.private_sso_key
      );

      let user_details = await models.users.findOne({
        where: { email: user_data.email, sso_id: user_data.otpID },
        include: [models.products, models.roles],
        attributes: [
          'id',
          'first_name',
          'last_name',
          'name',
          'email',
          'phone',
          'phone_verified',
          'email_verified',
          'active',
          'createdAt',
          'updatedAt',
        ],
      });

      if (user_details === null) {
        res.status(400).json({
          error: 1,
          msg: 'Auth token is invalid!',
        });
      } else {
        user_details = user_details.dataValues;
        req._data = {
          _token: bearerToken,
          ...user_details,
        };
        next();
      }
    } else {
      res.status(400).json({
        error: 1,
        msg: 'Authorization is required!',
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({
      error: 1,
      msg: error,
    });
  }
};
