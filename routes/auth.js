import { Router } from 'express';
import { check, body } from 'express-validator';

import User from '../models/user.js';

import {
    getLogin,
    postLogin,
    postLogout,
    getSignup,
    postSignup,
    getReset,
    postReset,
    getNewPassword,
    postNewPassword,
} from '../controllers/auth.js';

const nameValidator = check(
    'name',
    'At least two characters are required for the name',
)
    .notEmpty()
    .isLength({ min: 2 })
    .trim();

const emailValidator = check('email')
    .isEmail({ require_tld: false })
    .withMessage('Please enter a valid email address')
    .normalizeEmail();

const existingEmailValidator = check('email').custom(async (value) => {
    const user = await User.findOne({ email: value });
    if (!user) {
        throw new Error('No user exists with the provided E-Mail');
    }

    return true;
});

const newEmailValidator = check('email').custom(async (value) => {
    const user = await User.findOne({ email: value });
    if (user) {
        throw new Error('E-Mail exists already, please pick a different one');
    }

    return true;
});

const passwordValidator = body(
    'password',
    'Please enter a password with only numbers and letters and at least 5 characters long',
)
    .isLength({ min: 5 })
    .isAlphanumeric()
    .trim();

const confirmPasswordValidator = body('confirmPassword')
    .custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Passwords have to match');
        }

        return true;
    })
    .trim();

const router = Router();

router.get('/login', getLogin);
router.post('/login', [emailValidator], postLogin);
router.post('/logout', postLogout);
router.get('/signup', getSignup);
router.post(
    '/signup',
    [
        nameValidator,
        emailValidator,
        newEmailValidator,
        passwordValidator,
        confirmPasswordValidator,
    ],
    postSignup,
);
router.get('/reset', getReset);
router.post('/reset', [emailValidator, existingEmailValidator], postReset);
router.get('/reset/:token', getNewPassword);
router.post(
    '/new-password',
    [passwordValidator, confirmPasswordValidator],
    postNewPassword,
);

export default router;
