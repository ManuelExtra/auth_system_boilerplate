const Joi = require("joi");

const schema = Joi.object({
    name: Joi.string()
            .required(),
    secret: Joi.string()
            .required(),
    url: Joi.string()
            .required(),
    product_id: Joi.string()
            .required()
})

exports.isInputValidated = async (req, res, next) => {
    
    const result = schema.validate(req.body);
    if ("error" in result) {
        res.status(400).json({
            error: 1,
            data: result,
            msg: "Validation error(s)"
        });
    } else {
        next()
    }
}