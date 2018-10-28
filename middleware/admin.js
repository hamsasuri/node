module.exports = function (req, res, next) {
    // auth sets req.user
    if (!req.user.isAdmin) return res.status(403).send('Access denied.');
    next();
}