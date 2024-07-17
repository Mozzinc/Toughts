const express = require('express');
const { check } = require('express-validator');
const router = express.Router();
const AuthController = require('../controllers/AuthController');

console.log(AuthController);

router.get('/login', AuthController.login);
router.post('/login', [
  check('email').isEmail().withMessage('Por favor, forneça um e-mail válido.'),
  check('password').notEmpty().withMessage('Por favor, forneça uma senha.')
], AuthController.loginPost);

router.get('/register', AuthController.register);
router.post('/register', [
  check('name').notEmpty().withMessage('O nome é obrigatório.'),
  check('email').isEmail().withMessage('Por favor, forneça um e-mail válido.'),
  check('password').isLength({ min: 6 }).withMessage('A senha deve ter no mínimo 6 caracteres.'),
  check('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('As senhas não coincidem.');
    }
    return true;
  })
], AuthController.registerPost);

router.get('/logout', AuthController.logout);

module.exports = router;
