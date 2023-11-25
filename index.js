const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const port = 3005
app.use(express.json())
app.use(cors())


console.log(process.env.DB_NAME)
console.log(process.env.DB_PASS)


// wXaYtiTmu30GJQ7L
// leaner-flow





const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.kkqbu90.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const cardcollection =client.db('learn').collection('card')
    const annoucecollection =client.db('learn').collection('annouce')
// get all data 
    app.get('/card',async(req,res)=>{
      console.log(req.query)
      let query ={}
      if(req.query.tag){
       query={tag:req.query.tag}
      }
      const result = await cardcollection.find(query).sort({date:-1}).toArray()
      res.send(result)
    })
// get singel data 
app.get('/card/:id',async(req,res)=>{
  const id = req.params.id 
  const query = {_id:new ObjectId(id)}
  const result = await cardcollection.findOne(query)
  res.send(result)
})
// update data 
app.put('/card/:id',async(req,res)=>{
  const id = req.params.id 
  const filter = {_id:new ObjectId(id)}
  const options ={upset:true}
  const becomeUp = req.body 
  console.log(req.body)
  const update ={
    $set:{    
upvote:becomeUp.upvote,
downvote:becomeUp.downvote
    }
  }
 const result = await cardcollection.updateOne(filter,update,options)
 res.send(result)
})
// use sort by upvote and downvote
app.get('/vote',async(req,res)=>{
  const result = await cardcollection.aggregate([
{
  $addFields:{
    voteDefference:{$subtract:["$upvote","$downvote"]}
  }
},
{
  $sort:{voteDefference:-1}
}
  

  ]).toArray()
  res.send(result)
})
// annouce get 
app.get("/annouce",async(req,res)=>{
  const result = await annoucecollection.find().toArray()
  res.send(result)
})
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})