import { randomBytes } from 'crypto';

import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import { validationResult } from 'express-validator';

import User from '../models/user.js';
import { AppError } from '../middleware/errors.js';

let transporter = nodemailer.createTransport({
   host: 'smtp.sendgrid.net',
   port: 587,
   auth: {
       user: "apikey",
       pass: process.env.SENDGRID_API_KEY
   }
})

export const getLogin = (req, res) => {
    res.render('auth/login', { pageTitle: 'Login', input: {} });
};

export const postLogin = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('auth/login', {
            pageTitle: 'Login',
            input: { ...req.body },
            errors: errors.array(),
        });
    }

    (async () => {
        try {
            const { email, password } = req.body;

            const user = await User.findOne({ email });
            if (user == null) {
                req.flash('error', 'Invalid email or password');
                return res.status(422).render('auth/login', {
                    pageTitle: 'Login',
                    input: { ...req.body },
                });
            }

            const matches = await bcrypt.compare(password, user.password);
            if (!matches) {
                req.flash('error', 'Invalid email or password');
                return res.status(422).render('auth/login', {
                    pageTitle: 'Login',
                    input: { ...req.body },
                });
            }

            req.session.isAuthenticated = true;
            req.session.user = user;
            req.session.save(() => {
                res.redirect('/');
            });
        } catch (e) {
            next(new AppError('Failed to login', { cause: e }), req, res);
        }
    })();
};

export const postLogout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
};

export const getSignup = (req, res) => {
    res.render('auth/signup', { pageTitle: 'Signup', input: {} });
};

export const postSignup = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('auth/signup', {
            pageTitle: 'Signup',
            input: { ...req.body },
            errors: errors.array(),
        });
    }

    (async () => {
        try {
            const { name, email, password } = req.body;

            const hashed = await bcrypt.hash(password, 12);

            const user = new User({
                name,
                email,
                password: hashed,
                cart: { items: [] },
            });
            await user.save();

            res.redirect('/login');

            const msgInfo = await transporter.sendMail({
                to: email,
                from: 'jmore@softserveinc.com',
                subject: 'Signup succeeded',
                html: '<h1>You successfully signed up!</h1>',
            });
            console.info({msgInfo});
        } catch (e) {
            next(new AppError('Failed to signup', { cause: e }), req, res);
        }
    })();
};

export const getReset = (req, res) => {
    res.render('auth/reset', { pageTitle: 'Reset Password', input: {} });
};

export const postReset = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('auth/reset', {
            pageTitle: 'Reset Password',
            input: { ...req.body },
            errors: errors.array(),
        });
    }

    (async () => {
        try {
            const { email } = req.body;

            const user = await User.findOne({ email });
            if (user == null) {
                req.flash('error', 'No account was found for that email');
                return res.status(422).render('auth/reset', {
                    pageTitle: 'Reset Password',
                    input: { ...req.body },
                });
            }

            let buffer;
            try {
                buffer = randomBytes(32);
            } catch (e) {
                return next(new AppError('Failed to create reset key', { cause: e }), req, res);
            }

            user.resetToken = buffer.toString('hex');
            user.resetTokenExpiration = Date.now() + 3600000;
            await user.save();

            req.flash('Password reset instructions were sent to the provided email address!');
            res.redirect('/reset');

            const msgInfo = await transporter.sendMail({
                to: email,
                from: 'jmore@softserveinc.com',
                subject: 'Password reset',
                html: `
                <p>You requested a password reset!</p>
                <p>Click on <a href="http://localhost:3000/reset/${user.resetToken}">this link</a> to set a new password.</p>
            `,
            });
            console.info({msgInfo});
        } catch (e) {
            next(new AppError('Failed to reset password', { cause: e }), req, res);
        }
    })();
};

export const getNewPassword = (req, res) => {
    (async () => {
        try {
            const { token } = req.params;

            const user = await User.findOne({
                resetToken: token,
                resetTokenExpiration: { $gt: Date.now() },
            });

            if (user == null) {
                req.flash('error', 'Invalid user or reset token already expired');
                return res.redirect('/reset');
            }

            res.render('auth/new-password', {
                pageTitle: 'New Password',
                token,
                userId: user._id.toString(),
                input: {},
            });
        } catch (e) {
            next(new AppError('Failed to render reset-password page', { cause: e }), req, res);
        }
    })();
};

export const postNewPassword = (req, res) => {
    const { token, userId } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('auth/new-password', {
            pageTitle: 'New Password',
            token,
            userId,
            input: { ...req.body },
            errors: errors.array(),
        });
    }

    (async () => {
        try {
            const { password } = req.body;

            const user = await User.findOne({
                resetToken: token,
                resetTokenExpiration: { $gt: Date.now() },
                _id: userId,
            });

            if (user == null) {
                req.flash('error', 'Invalid user or reset token already expired');
                return res.redirect(`/reset/${token}`);
            }

            const hashed = await bcrypt.hash(password, 12);

            user.password = hashed;
            user.resetToken = undefined;
            user.resetTokenExpiration = undefined;
            await user.save();

            res.redirect('/login');
        } catch (e) {
            next(new AppError('Failed to reset password', { cause: e }), req, res);
        }
    })();
};
