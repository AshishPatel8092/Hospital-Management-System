const bcrypt = require("bcryptjs");

const password = "MyNewPassword@123";

const hash = bcrypt.hashSync(password, 10);

console.log("New bcrypt hash:");
console.log(hash);