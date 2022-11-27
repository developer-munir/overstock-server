const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();
const jwt = require("jsonwebtoken");

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.asxi1ae.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send("unauthorized access");
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN, function (error, decoded) {
    if (error) {
      return res.status(403).send("forbiden access");
    }
    req.decoded = decoded;
    next();
  });
};

async function run() {
  const userCollection = client.db("overstockDB").collection("users");
  const categoriesCollection = client
    .db("overstockDB")
    .collection("categories");
  const bookingCollection = client.db("overstockDB").collection("bookings");
  try {
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.send(result);
    });
    app.get("/users", verifyJWT, async (req, res) => {
      const query = {};
      const result = await userCollection.find(query).toArray();
      res.send(result);
    });
    app.get("/categories", async (req, res) => {
      const query = {};
      const result = await categoriesCollection
        .find(query)
        .project({ category_name: 1, category_id: 1, picture: 1, details: 1 })
        .limit(4)
        .toArray();
      res.send(result);
    });
    app.post('/products', async (req, res) => {
      const product = req.body;
      const result = await categoriesCollection.insertOne(product);
      res.send(result);
    })
    app.get('/products/category/:name',async (req, res) => {
      const categoryName = req.params.name;
      const query = { category_name: categoryName };
      const result = await categoriesCollection.find(query).toArray();
      res.send(result);
    })
    app.post("/bookings", async (req, res) => {
      const bookings = req.body;
      const result = await bookingCollection.insertOne(bookings);
      res.send(result);
    });
    app.get('/users/sellers', async (req, res) => {
      const query = {role:'seller'};
      const result = await userCollection.find(query).toArray();
      res.send(result);
    })
    app.get('/users/buyers', async (req, res) => {
      const query = {role:'buyer'};
      const result = await userCollection.find(query).toArray();
      res.send(result);
    })
    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await userCollection.findOne(query);
      res.send({ isAdmin: result?.role === "admin" });
    });
    app.get("/users/seller/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await userCollection.findOne(query);
      res.send({ isSeller: result?.role === "seller" });
    });
    app.get("/users/buyer/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await userCollection.findOne(query);
      res.send({ isBuyer: result?.role === "buyer" });
    });
    app.put("/users/admin/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    });
    app.get("/jwt", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      if (user) {
        const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, {
          expiresIn: "10h",
        });
        return res.send({ accessToken: token });
      }
      res.status(403).send({ accessToken: "forbiden access" });
    });
  } finally {
  }
}
run().catch((error) => console.log(error));

app.get("/", (req, res) => {
  res.send("overstock server is running on server");
});
app.listen(port, () => {
  console.log(`app running on port: ${port}`);
});
