const http = require("http");
const assert = require("assert");
const app = require("../src/index");

const server = app.listen(0, () => {
  const port = server.address().port;

  http.get(`http://localhost:${port}/health`, (res) => {
    let data = "";
    res.on("data", (chunk) => (data += chunk));
    res.on("end", () => {
      const body = JSON.parse(data);
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(body.status, "ok");
      console.log("All tests passed.");
      server.close();
    });
  });
});
