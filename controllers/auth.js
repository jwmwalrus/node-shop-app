import { randomBytes } from 'crypto';

import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';

import User from '../models/user.js';

let transporter = nodemailer.createTransport({
   host: 'smtp.sendgrid.net',
   port: 587,
   auth: {
       user: "apikey",
       pass: process.env.SENDGRID_API_KEY
   }
})

export const getLogin = (req, res, next) => {
    res.render('auth/login', { pageTitle: 'Login' });
};

export const postLogin = (req, res, next) => {
    const { email, password } = req.body;
    (async () => {
        try {
            const user = await User.findOne({ email });
            if (user == null) {
                req.flash('error', 'Invalid email or password');
                return res.redirect('/login');
            }

            const matches = await bcrypt.compare(password, user.password);
            if (!matches) {
                req.flash('error', 'Invalid email or password');
                return res.redirect('/login');
            }

            req.session.isAuthenticated = true;
            req.session.user = user;
            req.session.save(() => {
                res.redirect('/');
            });
        } catch (e) {
            console.error(e);
        }
    })();
};

export const postLogout = (req, res, next) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
};

export const getSignup = (req, res, next) => {
  res.render('auth/signup', { pageTitle: 'Signup' });
};

export const postSignup = (req, res, next) => {
    const { name, email, password, confirmPassword } = req.body;
    (async () => {
        try {
            const userDoc = await User.findOne({ email });
            if (userDoc) {
                req.flash('error', 'User already exists');
                return res.redirect('/signup');
            }

            if (password !== confirmPassword) {
                req.flash('error', 'Passwords do not match');
                return res.redirect('/signup');
            }

            const hashed = await bcrypt.hash(password, 12);

            const user = new User({ name, email, password: hashed, cart: { items: [] } });
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
            console.error(e);
        }
    })();
};

export const getReset = (req, res, next) => {
    res.render('auth/reset', { pageTitle: 'Reset Password' });
};

export const postReset = (req, res, next) => {
    (async () => {
        try {
            const { email } = req.body;

            const user = await User.findOne({ email });
            if (user == null) {
                req.flash('error', 'No account was found for that email');
                return res.redirect('/reset');
            }

            let buffer;
            try {
                buffer = randomBytes(32);
            } catch (e) {
                console.error(e);
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
            console.error(e);
        }
    })();
};

export const getNewPassword = (req, res, next) => {
    const { token } = req.params;

    (async () => {
        try {
            const user = await User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() }});
            if (user == null) {
                req.flash('error', 'Invalid user or reset token already expired');
                return res.redirect('/reset');
            }

            res.render('auth/new-password', { pageTitle: 'New Password', token, userId: user._id.toString() });
        } catch (e) {
            console.error(e);
        }
    })();
};

export const postNewPassword = (req, res, next) => {
    const { password, confirmPassword, token, userId } = req.body;

    if (password !== confirmPassword) {
        req.flash('error', 'Passwords do not match.');
        return res.redirect(`/reset/${token}`);
    }

    (async () => {
        try {
            const user = await User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() }, _id: userId });
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
            console.error(e);
        }
    })();
};
