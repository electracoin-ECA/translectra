export default function(req, res, next) {
  if (req.user === undefined || !req.user.isActivated) {
    res.redirect('/')

    return
  }

  next()
}
