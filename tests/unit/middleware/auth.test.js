const mongoose = require("mongoose");
const auth = require("../../../middleware/auth");
const { User } = require("../../../models/user");

describe("auth middelware", () => {
  test("should return auth token payload that matches user", () => {
    user = {
      _id: mongoose.Types.ObjectId().toHexString(),
      email: "user1@abc.com",
      phone: 1234567890,
      isAdmin: true,
    };
    token = new User(user).getAuthToken();
    const req = {
      header: jest.fn().mockReturnValue(token),
    };
    const res = {};
    const next = jest.fn();

    auth(req, res, next);
    expect(req.user).toMatchObject(user);
  });
});
