"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// POST
// /users/signup
exports.PostSignup = (req, res) => {
    res.send('signUp success!');
};
// POST
// /users/signin
exports.PostSignin = (req, res) => {
    res.send('signIn success!');
};
// GET
// /users/signout
exports.GetSignout = (req, res) => {
    res.send('signOut success!');
};
// GET
// /users/:id/current-info
exports.GetCurrentInfo = (req, res) => {
    res.send('GetCurrentInfo success!');
};
// GET
// /users/:id/list
exports.GetList = (req, res) => {
    res.send('GetList success!');
};
// GET
// /users/:id/my-info
exports.GetMyInfo = (req, res) => {
    res.send('GetMyInfo success!');
};
// PUT
// /users/:id/my-info
exports.PutMyInfo = (req, res) => {
    res.send('PutMyInfo success!');
};
