import { getReasonPhrase } from 'http-status-codes';

export const renderError = (res, code, pageTitle) => {
    if (!code) {code = 400;}
    if (!pageTitle) {pageTitle = getReasonPhrase(code);}
    return res.status(code).render('errors', { code, pageTitle, path: '' });
}

export const errorHandler = ({code, pageTitle}) => {
    if (code == null) {code = 400;}
    if (pageTitle == null) {pageTitle = getReasonPhrase(code);}
    return (req, res, next) => {res.status(code).render('errors', { code, pageTitle, path: '' });};
};
