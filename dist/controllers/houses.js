"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// POST
// /houses
exports.PostNewHouse = (req, res) => {
    res.send('PostNewHouse success!');
};
// GET
// /houses
exports.GetAllHouses = (req, res) => {
    res.send('GetAllHouse success!');
};
// POST
// /houses/search
exports.PostSearchHouse = (req, res) => {
    res.send('PostSearchHouse success!');
};
// // POST
// // /houses/:id
// export const PostHouse = (req: Request, res: Response) => {
//   res.send('PostHouse success!');
// };
// GET
// /houses/:id
exports.GetHouse = (req, res) => {
    res.send('GetHouse success!');
};
// PUT
// /houses/:id
exports.PutHouse = (req, res) => {
    res.send('PutHouse success!');
};
// DELETE
// /houses/:id
exports.DeleteHouse = (req, res) => {
    res.send('DeleteHouse success!');
};
