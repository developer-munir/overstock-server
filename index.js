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
