function checkAuth(req, res, next) {
  if (req.session.userid) {
    next();
  } else {
    req.flash('message', 'Você precisa estar logado para acessar esta página');
    res.redirect('/login');
  }
}

module.exports = {
  checkAuth,
};
