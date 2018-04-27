export default function(req, res, next) {
  if (!req.secure) {
    res.redirect(`${process.env.WEBSITE_URL}${req.url}`)

    return
  }

  next()
}
