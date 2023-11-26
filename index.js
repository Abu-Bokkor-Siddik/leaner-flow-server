const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const stripe = require('stripe')(process.env.KEY_HIDE)
const port = 3005
app.use(express.json())
app.use(cors())


console.log(process.env.DB_NAME)
console.log(process.env.DB_PASS)
console.log(process.env.KEY_HIDE)


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
    const usercollection =client.db('learn').collection('user')
    const annoucecollection =client.db('learn').collection('annouce')

    // save user 
    app.post("/user",async(req,res)=>{
      const user =req.body
      // if user exist 
      const query={email:user.email}
      const exists = await usercollection.findOne(query);
      if(exists){
        return res.send({message:'exist user',insertedId:null})
      }
      const result = await usercollection.insertOne(user)
      res.send(result)
    })



    // on data for profile 
    app.get('/user',async(req,res)=>{
      const email=req.query.email 
      const query={email:email};
      console.log(email)
      const result = await usercollection.findOne(query)
      res.send(result)
    })
// get all data 
    app.get('/card',async(req,res)=>{
      // console.log(req.query)

      let query ={}
      if(req.query.tag){
       query={tag:req.query.tag}
      }
      // pagination 
      // const page =Number(req.query.page);
      // const limit =Number(req.query.limit);
      // const skip=(page-1)*limit    .skip(skip).limit(limit)
      const result = await cardcollection.find(query).sort({date:-1}).toArray()
      // const total = await cardcollection.estimatedDocumentCount()
      res.send(result)
    })

    // post in card 
    app.post('/card',async(req,res)=>{
      const CardItem = req.body 
      const result =await cardcollection.insertOne(CardItem)
      res.send(result)
      // console.log(CardItem)
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
// user info update 
app.put('/update',async(req,res)=>{
  const query= {email:req.query.email}
  const options = {upset:true}
  const becomeUp = req.body;
  const update ={
    $set:{
      badge:becomeUp.badge,
      
      date:new Date().toLocaleString(),
      status:true


    }
  }
  const result = await usercollection.updateOne(query,update,options)
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

// payment indent 
app.post('/create-payment-intent',async(req,res)=>{
  const {price}=req.body;
  const amount = parseInt(price*100)

  console.log(amount)
  const paymentIndent = await stripe.paymentIntents.create({
    amount:amount,
    currency:'usd',
    payment_method_types:['card']
  });
  res.send({
    ClientSecret:paymentIndent.client_secret
  })
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