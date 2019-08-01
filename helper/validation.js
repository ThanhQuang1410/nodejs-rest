//Validate
const Joi = require('@hapi/joi');

const dataValidation = (data, schema) => {
    return Joi.validate(data, schema)
}


module.exports.dataValidation = dataValidation;