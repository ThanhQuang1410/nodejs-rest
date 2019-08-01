const router = require('express').Router();
const User = require('../models/User');
const Joi = require('@hapi/joi');
const {dataValidation} = require('../helper/validation');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const verify = require('../helper/verifyToken');

const schema = {
    name: Joi.string()
        .min(6)
        .required(),
    email: Joi.string()
        .min(6)
        .required()
        .email(),
    password: Joi.string()
        .min(6)
        .required()
};

router.post('/resgister', async (req, res) => {
    //Validate before save
    const {error} = dataValidation(req.body, schema);
    if(error) return res.status(400).send(error.details[0].message);
    //Check already data 
    const emailExist = await User.findOne({email: req.body.email});
    if(emailExist) return res.status(400).send('Email already exists');

    //Hash password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    //Save user data
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashPassword
    });
    try{
        const savedUser = await user.save();
        res.send(savedUser);
    } catch (err) {
        res.status(400).send(err);
    }
});

router.post('/login', async (req, res) => {
    const schemaLogin = {...schema};
    delete schemaLogin["name"];
    const {error} = dataValidation(req.body, schemaLogin);

    if(error) return res.status(400).send(error.details[0].message);

    const user = await User.findOne({email: req.body.email});

    if(!user)  return res.status(400).send('User dose not exist');

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if(!validPassword) return res.status(400).send('Invalid password!!');

    //Create and assign token (session)
    const token = jwt.sign({_id: user._id} , process.env.TOKEN_SECRET);
    res.header('auth-token', token);
    res.send(user);
})

router.post('/edit', verify, async (req, res) => {
    const schemaEdit = {};

    Object.keys(req.body).forEach(key => {
        schemaEdit[key] = schema[key] 
    });
    const {error} = dataValidation(req.body, schemaEdit);
    if(error) return res.status(400).send(error.details[0].message);

    const user = await User.findOne({_id: req.user._id});

    if(!user)  return res.status(400).send('User dose not exist');

    const userChangeinfor = await User.findByIdAndUpdate({_id: user._id}, req.body, {useFindAndModify: false});
    userChangeinfor.save();

    const userNewinfor = await User.findOne({_id: userChangeinfor._id});
    res.send(userNewinfor);
})

module.exports = router;