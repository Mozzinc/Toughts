const { validationResult } = require('express-validator');
const ModelFactory = require('../models/modelFactory');
const bcrypt = require('bcryptjs');
const User = ModelFactory.createModel('User');
const logDecorator = require('../decorators/logDecorator');

const MAX_LOGIN_ATTEMPTS = 3;
const LOCK_TIME = 30 * 1000; // 30 segundos

class AuthController {
  static login(req, res) {
    res.render('auth/login');
  }

  static async loginPost(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('auth/login', { message: errors.array().map(err => err.msg).join(', ') });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ where: { email: email } });

    if (!user) {
      req.logAction('Failed Login - User Not Found', req, { email });
      res.render('auth/login', { message: 'Usuário não encontrado!' });
      return;
    }

    const now = new Date();
    if (user.lockUntil && user.lockUntil > now) {
      const lockTimeRemaining = Math.ceil((user.lockUntil - now) / 1000);
      res.render('auth/login', { message: `Conta bloqueada. Tente novamente em ${lockTimeRemaining} segundos.` });
      return;
    }

    const passwordMatch = bcrypt.compareSync(password, user.password);

    if (!passwordMatch) {
      user.loginAttempts += 1;
      if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        user.lockUntil = new Date(now.getTime() + LOCK_TIME);
        req.logAction('Failed Login - Account Locked', req, { userId: user.id, email });
        user.loginAttempts = 0;
      } else {
        req.logAction('Failed Login - Incorrect Password', req, { userId: user.id, email });
      }
      await user.save();
      res.render('auth/login', { message: 'Senha inválida!' });
      return;
    }

    // Verifique novamente o status de bloqueio antes de continuar
    if (user.lockUntil && user.lockUntil > now) {
      const lockTimeRemaining = Math.ceil((user.lockUntil - now) / 1000);
      res.render('auth/login', { message: `Conta bloqueada. Tente novamente em ${lockTimeRemaining} segundos.` });
      return;
    }

    user.loginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    req.session.userid = user.id;
    req.session.isAdmin = user.isAdmin;
    console.log(`UserID in session after successful login: ${req.session.userid}`);
    req.logAction('Successful Login', req, { userId: user.id, email });
    req.flash('message', 'Login realizado com sucesso!');
    req.session.save((err) => {
      if (err) {
        console.error('Erro ao salvar a sessão:', err);
        res.render('auth/login', { message: 'Erro ao salvar a sessão.' });
      } else {
        res.redirect('/');
      }
    });
  }

  static register(req, res) {
    res.render('auth/register');
  }

  static async registerPost(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('auth/register', { message: errors.array().map(err => err.msg).join(', ') });
    }

    const { name, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.render('auth/register', { message: 'As senhas não conferem!' });
    }

    // Validação da senha
    if (password.length < 6) {
      return res.render('auth/register', { message: 'A senha deve ter no mínimo 6 caracteres.' });
    }
    if (!/[A-Z]/.test(password)) {
      return res.render('auth/register', { message: 'A senha deve conter pelo menos uma letra maiúscula.' });
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return res.render('auth/register', { message: 'A senha deve conter pelo menos um caractere especial.' });
    }

    const userExists = await User.findOne({ where: { email: email } });

    if (userExists) {
      return res.render('auth/register', { message: 'O e-mail já está em uso!' });
    }

    const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10));

    try {
      const newUser = await User.create({
        name,
        email,
        password: hashedPassword,
      });

      req.logAction('Register', req, { userId: newUser.id, email: newUser.email });

      req.flash('message', 'Registro realizado com sucesso!');
      res.redirect('/login');
    } catch (error) {
      console.error(error);
      res.render('auth/register', { message: 'Erro ao registrar usuário.' });
    }
  }

  static logout(req, res) {
    console.log(`UserID in session before logout: ${req.session.userid}`);
    req.logAction('Logout', req, { userId: req.session.userid });
    req.session.destroy(() => {
      res.redirect('/login');
    });
  }
}

// Aplicar o decorador manualmente aos métodos
AuthController.login = logDecorator(AuthController.login);
AuthController.loginPost = logDecorator(AuthController.loginPost);
AuthController.register = logDecorator(AuthController.register);
AuthController.registerPost = logDecorator(AuthController.registerPost);
AuthController.logout = logDecorator(AuthController.logout);

module.exports = AuthController;
