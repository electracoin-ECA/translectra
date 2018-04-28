export default function(req, res, next) {
  if (req.user === undefined || !req.user.isActivated || !req.user.isAdmin) {
    res.redirect('/')

    return
  }

  next()
}
