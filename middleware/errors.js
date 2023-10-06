import { getReasonPhrase } from 'http-status-codes';

/* eslint no-param-reassign: off */
export const renderError = (res, msg, code, pageTitle) => {
    if (!code) {
        code = 400;
    }
    if (!pageTitle) {
        pageTitle = getReasonPhrase(code);
    }

    return res.status(code).render('errors', { msg, code, pageTitle });
};

export class AppError extends Error {
    constructor(msg, options) {
        super(msg, { cause: options?.cause });

        this.code = options?.code ?? 400;
    }

    render(res) {
        let msg = this.message;

        if (this.cause) {
            msg += ': ' + this.cause.message;
        }

        console.error(this);

        renderError(res, msg, this.code);
    }
}
