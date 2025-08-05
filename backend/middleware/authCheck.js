const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    return res.status(401).json({message: "Acces denied"})
  }
};

const isAdmin = (req, res, next) => {
    if(req.session.user.role !== 'admin') {
        return res.status(403).send('Anda bukan admin dan tidak boleh akses halaman ini')
    } else {
        next()
    }
}

module.exports = { isAuthenticated, isAdmin }