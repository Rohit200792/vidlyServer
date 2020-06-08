const port = require("../../../index");
const app = require("../../../index");
const mongoose = require("mongoose");
const request = require("supertest")(app);
const { Genre } = require("../../../models/genre");
const { User } = require("../../../models/user");

describe("/api/genres", () => {
  beforeEach(() => {
    jest.setTimeout(15000);
  });

  afterEach(async () => {
    await Genre.remove({});
    jest.setTimeout(5000);
  });

  describe("GET /", () => {
    it("should read list of all genres with success status 200", async () => {
      await Genre.collection.insertMany([
        { name: "genre1" },
        { name: "genre2" },
      ]);
      const res = await request.get("/api/genres");
      expect(res.status).toBe(200);
      expect(res.body.some((g) => g.name === "genre1")).toBeTruthy();
    });
  });

  describe("GET/:id", () => {
    it("should read genre selected by id with success status 200", async () => {
      const genre = await Genre.collection.insert({ name: "genre1" });
      const res = await request.get(`/api/genres/${genre.insertedIds[0]}`);
      expect(res.status).toBe(200);
      genre.ops[0]._id = genre.ops[0]._id.toHexString();
      expect(res.body).toMatchObject(genre.ops[0]);
      expect(res.body).toHaveProperty("name", genre.ops[0].name);
    });

    it("should give genre not found with error status 400", async () => {
      const id = new mongoose.Types.ObjectId().toHexString;
      const res = await request.get(`/api/genres/${id}`);
      expect(res.status).toBe(400);
    });
  });

  describe("POST /", () => {
    let user;
    let genre;
    let token;

    beforeEach(() => {
      user = new User({
        _id: mongoose.Types.ObjectId().toHexString(),
        email: "user1@abc.com",
        phone: 1234567890,
        isAdmin: true,
      });
      token = user.getAuthToken();
      genre = { name: "genre1" };
    });

    checkDB = async () => {
      const genreDB = await Genre.find(genre);
      expect(genreDB.length).toBe(0);
    };

    it("should give auth token not found with error status 401", async () => {
      const res = await request.post("/api/genres").send(genre);
      expect(res.status).toBe(401);
      await checkDB();
    });

    it("should give user is not an admin with error status 403", async () => {
      user.isAdmin = false;
      token = user.getAuthToken();
      const res = await request
        .post("/api/genres")
        .set("x-auth-token", token)
        .send(genre);
      expect(res.status).toBe(403);
      await checkDB();
    });

    it("should give genre name length > 3 with error status 400", async () => {
      genre.name = "g1";
      const res = await request
        .post("/api/genres")
        .set("x-auth-token", token)
        .send(genre);
      expect(res.status).toBe(400);
      await checkDB();
    });

    it("should give genre name length < 30 with error status 400", async () => {
      genre.name = new Array(32).join("g");
      const res = await request
        .post("/api/genres")
        .set("x-auth-token", token)
        .send(genre);
      expect(res.status).toBe(400);
      await checkDB();
    });

    it("should give genre name is required with error status 400", async () => {
      genre = {};
      const res = await request
        .post("/api/genres")
        .set("x-auth-token", token)
        .send(genre);
      expect(res.status).toBe(400);
      await checkDB();
    });

    it("should post new genre to DB with success status 200", async () => {
      const res = await request
        .post("/api/genres")
        .set("x-auth-token", token)
        .send(genre);
      expect(res.status).toBe(200);
      const genreDB = await Genre.find(genre);
      expect(genreDB).not.toBe(null);
      expect(genreDB[0]).toHaveProperty("name", "genre1");
    });
  });
});
