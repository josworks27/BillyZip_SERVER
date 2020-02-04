"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
const server = index_1.default.listen(index_1.default.get('port'), () => console.log(`BillyZip App Listening on PORT ${index_1.default.get('port')}!`));
exports.default = server;
//# sourceMappingURL=server.js.map