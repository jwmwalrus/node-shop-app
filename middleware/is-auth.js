export default (req, res, next) => {
    if (!req.session || !req.session.isAuthenticated) {
        return res.status(401).render('auth/login', { pageTitle: 'Login', input: {} });
    }
    next();
};

