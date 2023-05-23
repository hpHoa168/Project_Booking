//custom middleware
function requireAdmin(req, res, next) {
    if (req.session["admin"]) {
        return next()
    } else {
        res.redirect('/login')
    }
}

function requireUser(req, res, next) {
    if (req.session["customer"]) {
        return next()
    } else {
        res.redirect('/login')
    }
}

function requireManager(req, res, next) {
    if (req.session["manager"]) {
        return next()
    } else {
        res.redirect('/login')
    }
}

module.exports = {
    requireAdmin,
    requireUser,
    requireManager,
}