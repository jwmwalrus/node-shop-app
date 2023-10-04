export default (req, res, next) => {
    if (!req.session || !req.session.isAuthenticated) {
        return res.redirect('/login');
    }
    next();
};

