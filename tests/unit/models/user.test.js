const mongoose = require("mongoose");
const config = require("config");
const jwt = require("jsonwebtoken");
const { User } = require("../../../models/user");

describe("getAuthToken", () => {
  it("should return same payload when decoded by private key", () => {
    const payload = {
      _id: new mongoose.Types.ObjectId().toHexString(),
      isAdmin: true,
      email: "a",
      phone: 1,
    };
    const user = new User(payload);
    const token = user.getAuthToken();
    const decoded = jwt.verify(token, config.get("jwtPrivateKey"));
    expect(decoded).toMatchObject(payload);
  });
});
