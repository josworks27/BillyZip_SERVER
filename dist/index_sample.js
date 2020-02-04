"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const Post_1 = require("./entity/Post");
const Category_1 = require("./entity/Category");
// connection settings are in the "ormconfig.json" file
typeorm_1.createConnection()
    .then((connection) => __awaiter(void 0, void 0, void 0, function* () {
    const category1 = new Category_1.Category();
    category1.name = 'TypeScript';
    yield connection.manager.save(category1);
    const category2 = new Category_1.Category();
    category2.name = 'Programming';
    yield connection.manager.save(category2);
    const post = new Post_1.Post();
    post.title = 'Control flow based type analysis';
    post.text =
        'TypeScript 2.0 implements a control flow-based type analysis for local variables and parameters.';
    post.categories = [category1, category2];
    yield connection.manager.save(post);
    console.log('Post has been saved: ', post);
}))
    .catch((error) => console.log('Error: ', error));
//# sourceMappingURL=index_sample.js.map