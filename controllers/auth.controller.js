const Users = require('../models').users;

const {
  TermiiMailProvider,
  mailer_template,
  Mailer,
  Logo,
} = require('../lib/Engine');

const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator');

const saltRounds = 10;
const hashPassword = (password) => {
  const salt = bcrypt.genSaltSync(saltRounds);
  const hash = bcrypt.hashSync(password, salt);
  return hash;
};

/**
 * Function for sending an authentication for a User
 * @param {*} req
 * @param {*} res
 */
exports.sendAuthUser = async (req, res) => {
  let { user } = req.body;
  try {
    let result = await Users.findOne({
      where: {
        [Op.or]: [{ email: user }, { phone: user }],
      },
    });

    if (result === null) {
      res.status(200).json({
        error: 1,
        msg: 'User account does not exist!',
      });
    } else {
      // Generated OTP should be hashed and stored in the db.
      // Otp should be sent to this phone number
      // if email is added, then a mail should be sent

      //For email
      const raw_data = {
        first_name: result.first_name,
        last_name: result.last_name,
        email: result.email,
        phone: result.phone,
        email_verified: result.email_verified,
        product: result.product,
        role: result.role,
      };

      const otpID = otpGenerator.generate(6, {
        digits: true,
        specialChars: false,
      });
      let _data = {
        otpID,
        email: result.email,
      };
      const token = jwt.sign(_data, process.env.private_sso_key);

      let pass_token_expiry = new Date(new Date().getTime() + 500 * 60000);

      // Update
      let response = await Users.update(
        { sso_id: otpID, sso_token_expiry: pass_token_expiry },
        { where: { [Op.or]: [{ email: user }, { phone: user }] } }
      );
      // TermiiMailProvider({
      //     "to": result.phone,
      //     "sms": `Your secure token is ${otp}`,
      //     "api_key": process.env.TERMII_API_KEY
      // })

      // setup mail credentials
      let params = {};
      params.logo = Logo;
      params.header_color = 'white';

      const link = `${process.env.WEB_URL}/verify/${token}`;

      params.body = `<p style="font-size:1.5em;"><b>Hi, ${result.first_name}</b></p>`;

      params.body += `<p style="font-size:1.5em;">
                You have requested to reset the password to your account on ${process.env.APP_NAME}. <br/>
                Click the link below to proceed. <br/></p>
            `;

      params.body += `
                <p style="margin-top:30px">
                    <a href="${link}" target="_BLANK" alt="click to reset password" style="padding:20px;color:white;font-size:1.2em;background-color:#000;text-decoration:none;border-radius:5px;border:0">Reset my Password</a>
                </p>
            `;
      params.date = new Date().getFullYear();
      params.footer = '';

      let params2 = {
        email: result.email,
        subject: `Password Reset - ${process.env.APP_NAME}`,
      };

      const template = mailer_template(params);
      // Send Mail
      Mailer(template, params2)
        .then((response) => {
          res.json({
            error: 0,
            msg: 'Request sent! A reset link was sent to your mailbox.',
            response,
          });
        })
        .catch((err) => {
          console.err;
          res.json({
            error: 1,
            msg: 'Network problem',
            err,
          });
        });

      // res.status(200).json({
      //     error: 0,
      //     msg: "Auth sent successfully!",
      //     otp
      // })
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
 * Function to finish off verifyPasswordResetOtp middleware | render user's data
 * @param {*} req
 * @param {*} res
 */
exports.RenderUser = (req, res) => {
  res.status(200).json({
    error: 0,
    data: req._data,
  });
};

/**
 * Function to verify authorized user
 * @param {*} req
 * @param {*} res
 */
exports.verifyAuthUser = async (req, res) => {
  let { token } = req.params;
  try {
    let result = await Users.findOne({ where: { sso_id: token } });
    if (result === null) {
      res.status(200).json({
        error: 1,
        msg: 'Phone number is incorrect!',
      });
    } else {
      // Compare otp with the hashed one in the db
      // const match = await bcrypt.compare(password, result.password)
      if (otp !== '1234') {
        res.status(200).json({
          error: 1,
          msg: 'Invalid OTP!',
        });
      } else {
        res.json({
          error: 0,
          msg: 'Account verified successfully!',
        });
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
 * Function to reset password
 * @param {*} req
 * @param {*} res
 */
exports.resetPassword = async (req, res) => {
  let { password } = req.body;
  // const access_token = req.access_token;
  const user_data = req._data;
  try {
    // Token from email's link
    // const user_data = await jwt.verify(access_token, process.env.private_sso_key);
    // encrypted data includes first_name, last_name, name, email, phone, password

    // Hash password
    password = hashPassword(password);

    // Update password
    const result = await Users.update(
      { password },
      { where: { email: user_data.email } }
    );
    res.json({
      error: 0,
      msg: 'Password updated successfully!',
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      error: 1,
      msg: error,
    });
  }
};

/**
 * Function to activate user's account
 * @param {*} req
 * @param {*} res
 */
exports.activateUser = async (req, res) => {
  const { user_id } = req.params;

  try {
    const User = await Users.findOne({ where: { id: user_id } });
    if (User === null) {
      res.status(400).json({
        error: 1,
        msg: 'Account not found!',
      });
    } else {
      User.active = 1;
      User.save();
      res.json({
        error: 0,
        msg: 'Account activated!',
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

/**
 * Function to deactivate user's account
 * @param {*} req
 * @param {*} res
 */
exports.deactivateUser = async (req, res) => {
  const { user_id } = req.params;

  try {
    const User = await Users.findOne({ where: { id: user_id } });
    if (User === null) {
      res.status(400).json({
        error: 1,
        msg: 'Account not found!',
      });
    } else {
      User.active = null;
      User.save();
      res.json({
        error: 0,
        msg: 'Account deactivated!',
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
