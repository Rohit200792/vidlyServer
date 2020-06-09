const { Genre } = require("../../../models/genre");
const { User } = require("../../../models/user");
const app = require("../../../index");
const request = require("supertest")(app);
let server;

describe("auth middleware", () => {
  let genre;
  beforeEach(async () => {
    server = require("../../../app")(app);
    genre = { name: "genre1" };
    jest.setTimeout(15000); //to avoid async callback timeout error
    await new Promise((resolve) => setTimeout(() => resolve(), 5000)); // give time to connect to DB
  });

  afterEach(async () => {
    await Genre.remove({});
    server.close();
    jest.setTimeout(5000);
  });

  afterAll(async () => {
    await new Promise((resolve) => setTimeout(() => resolve(), 500)); // avoid jest open handle error
  });

  it("should give auth token not found with error status 401", async () => {
    const res = await request.post("/api/genres").send(genre);
    expect(res.status).toBe(401);
  });

  it("should return invalid token with error status 400", async () => {
    const token = "a";
    const res = await request
      .post("/api/genres")
      .set("x-auth-token", token)
      .send(genre);
    expect(res.status).toBe(400);
  });
});
