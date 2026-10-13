const assert = require("assert");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");
const { hashArtifact, recordWithRetry } = require("../record");

describe("Recorder — hashArtifact", function () {
  const fixturePath = path.join(__dirname, "fixture.txt");

  before(function () {
    fs.writeFileSync(fixturePath, "hello blockchain");
  });

  after(function () {
    fs.unlinkSync(fixturePath);
  });

  it("returns a hex string prefixed with 0x", function () {
    const hash = hashArtifact(fixturePath);
    assert.ok(hash.startsWith("0x"));
    assert.strictEqual(hash.length, 66);
  });

  it("matches Node.js crypto SHA-256 output", function () {
    const expected =
      "0x" +
      crypto.createHash("sha256").update(fs.readFileSync(fixturePath)).digest("hex");
    const actual = hashArtifact(fixturePath);
    assert.strictEqual(actual, expected);
  });

  it("produces different hashes for different content", function () {
    const otherPath = path.join(__dirname, "fixture2.txt");
    fs.writeFileSync(otherPath, "different content");
    try {
      const h1 = hashArtifact(fixturePath);
      const h2 = hashArtifact(otherPath);
      assert.notStrictEqual(h1, h2);
    } finally {
      fs.unlinkSync(otherPath);
    }
  });

  it("throws when file does not exist", function () {
    assert.throws(() => hashArtifact("/nonexistent/file.js"), { code: "ENOENT" });
  });
});

describe("Recorder — recordWithRetry", function () {
  it("resolves on first successful call", async function () {
    const fakeContract = {
      recordDeployment: async () => ({
        hash: "0xabc",
        wait: async () => ({ blockNumber: 42 }),
      }),
    };
    const receipt = await recordWithRetry(fakeContract, "abc", "build-1", "0xhash");
    assert.strictEqual(receipt.blockNumber, 42);
  });

  it("retries on transient failure then succeeds", async function () {
    let calls = 0;
    const fakeContract = {
      recordDeployment: async () => {
        calls++;
        if (calls < 3) throw new Error("transient");
        return { hash: "0xdef", wait: async () => ({ blockNumber: 99 }) };
      },
    };
    const receipt = await recordWithRetry(fakeContract, "abc", "build-2", "0xhash", 1, 10);
    assert.strictEqual(receipt.blockNumber, 99);
    assert.strictEqual(calls, 3);
  });

  it("throws after exhausting all retries", async function () {
    const fakeContract = {
      recordDeployment: async () => {
        throw new Error("permanent failure");
      },
    };
    await assert.rejects(
      () => recordWithRetry(fakeContract, "abc", "build-3", "0xhash", 1, 10),
      { message: "permanent failure" }
    );
  });
});
