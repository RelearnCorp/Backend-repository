const bcrypt = require("bcryptjs");

(async () => {
  console.log(await bcrypt.hash("teacher123", 10));
  console.log(await bcrypt.hash("admin123", 10));
})();