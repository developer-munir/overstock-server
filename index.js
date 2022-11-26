const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.asxi1ae.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  const userCollection = client.db('overstockDB').collection('users');
  const categoriesCollection = client.db('overstockDB').collection('categories');
  const bookingCollection = client.db('overstockDB').collection('bookings');
  try {
    app.post('/users', async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.send(result);
    })
    app.get('/users', async(req,res)=>{
      const query = {};
      const result = await userCollection.find(query).toArray();
      res.send(result);
    })
    app.get('/categories', async (req, res) => {
      const query = {};
      const result = await categoriesCollection
        .find(query)
        .project({ category_name: 1, category_id:1,picture:1,details:1})
        .limit(4)
        .toArray();
      res.send(result);
    })
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { category_id: id};
      const result = await categoriesCollection.find(query).toArray();
      res.send(result);
    });
    app.post('/bookings', async (req, res) => {
      const bookings = req.body;
      console.log(bookings)
      const result = await bookingCollection.insertOne(bookings);
      res.send(result);
    })
  } 
  finally {
    
  }
}
run().catch(error => console.log(error))

app.get("/", (req, res) => {
  res.send("overstock server is running on server");
});
app.listen(port, () => {
  console.log(`app running on port: ${port}`);
});
