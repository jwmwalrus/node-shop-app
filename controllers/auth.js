import User from '../models/user.js';

export const getLogin = (req, res, next) => {
    res.render('auth/login', { pageTitle: 'Login' });
};

export const postLogin = (req, res, next) => {
    (async () => {
        const user = await User.findOne({ email: req.body.email });
        req.session.isAuthenticated = true;
        req.session.user = user;
        res.session.save(() => {
            res.redirect('/');
        });
    })();
};

export const postLogout = (req, res, next) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
};
