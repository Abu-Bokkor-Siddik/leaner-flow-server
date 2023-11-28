const express = require('express')
const app = express()
const cors = require('cors')
const jwt = require('jsonwebtoken');
require('dotenv').config()
const stripe = require('stripe')(process.env.KEY_HIDE)
const port = 3005
app.use(express.json())
app.use(cors())


// console.log(process.env.DB_NAME)
// console.log(process.env.DB_PASS)
// console.log(process.env.KEY_HIDE)
// console.log(process.env.HIDE_KEY_SICRET)


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
    const commentcollection =client.db('learn').collection('comment')
    const reportcollection =client.db('learn').collection('report')
    const tagcollection =client.db('learn').collection('tag')
// jwt is here 
app.post('/jwt',async(req,res)=>{
  try{
    const users = req.body 
    const token = jwt.sign(users,process.env.HIDE_KEY_SICRET,{expiresIn:'365d'})
    res.send({token})
  }catch(err){
console.log(err)
  }
})
// end here 

// here is my get  api 
app.get('/mypost',async(req,res)=>{
 
  const email=req.query.email 
  // console.log(email)
  const query={email:email};
  const result = await cardcollection.find(query).toArray()
  res.send(result)

})
// single my post api 
app.get('/mypost/:id',async(req,res)=>{
  const id = req.params.id 
  const query ={ _id : new ObjectId(id)}
  const result = await cardcollection.findOne(query)
  res.send(result)
})
// delete card 
app.delete('/mypost/:id',async(req,res)=>{
  const id = req.params.id 
  const query ={_id:new ObjectId(id)}
  const result = await cardcollection.deleteOne(query)
  res.send(result)
})


// delete user 
app.delete('/users/:id',async(req,res)=>{
  const id =req.params.id 
  const query = {_id :new ObjectId(id)}
  const result = await usercollection.deleteOne(query)
  res.send(result)
})
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
      // console.log(email)
      const result = await usercollection.findOne(query)
      res.send(result)
    })
    // all user 
    app.get ('/users',async(req,res)=>{
      const user = req.body 
      const result = await usercollection.find(user).toArray()
      res.send(result)
    })
    // make admin here 
    app.patch('/users/admin:id',async(req,res)=>{
      const id = req.params.id
      // console.log(id)
      const filter ={_id : new ObjectId(id)}
      const updateadmin ={
        $set:{
          role:'admin'
        }
      }
      const result = await usercollection.updateOne(filter,updateadmin)
      res.send(result)
    })
    // find admin 
    app.get('/user/admin/:email',async(req,res)=>{
      const email = req.params.email 
      const query ={email:email}
      const user = await usercollection.findOne(query)
      let admin = false;
      if(user){
        admin = user?.role ==='admin';
    
      }
      res.send({admin})
    
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
// get 3 card in user my page ...
app.get('/three',async(req,res)=>{
  const query ={email:req.query.email}
  const result = await cardcollection.find(query).sort({date:-1}).limit(3).toArray()
  res.send(result)

})

// update data 
app.put('/card/:id',async(req,res)=>{
  const id = req.params.id 
  const filter = {_id:new ObjectId(id)}
  const options ={upset:true}
  const becomeUp = req.body 
  // console.log(req.body)
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
// post annouce 
app.post ('/annouce',async(req,res)=>{
  const annouces = req.body 
  const result = await annoucecollection.insertOne(annouces)
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
// comment api here ///
app.post('/comment',async(req,res)=>{
  try {
    const comments = req.body 
    const result = await commentcollection.insertOne(comments)
    res.send(result)
    
  } catch (error) {
    console.log(error)
  }
})
// get api email and title  success full 
app.get('/comment',async(req,res)=>{
 try {
  const query={}
  if (req.query.email & req.query.title){
    query={title:req.query.title,email:req.query.email}
  }
  const result = await commentcollection.find(query).toArray()
  res.send(result)
  
  
 } catch (error) {
  console.log(error)
 }
})
// only title  comment count a ata use korbo...
app.get ('/comments/title',async(req,res)=>{
  const query = {title:req.query.title}
  // console.log(query)
  const result = await commentcollection.find(query).toArray()
   res.send(result)
})
// get only comment number with title 
// http://localhost:3005/ass?title=Need help 
// app.get('/ass',async(req,res)=>{
//   const query={title:req.query.title}
//   const result = await commentcollection.find(query).toArray()
//   res.send(result)
//   console.log(query)

// })



//  here is post report in database 
app.post('/report',async(req,res)=>{
  const report = req.body 
  const result = await reportcollection.insertOne(report)
  res.send(result)
})

// get all report 
app.get('/report',async(req,res)=>{
  const result = await reportcollection.find().toArray()
  res.send(result)
})
// total user count 
app.get('/number',async(req,res)=>{
  const posts = await cardcollection.estimatedDocumentCount();
  const commentes = await commentcollection.estimatedDocumentCount();
  const users = await usercollection.estimatedDocumentCount();
  res.send({
    posts,
    commentes,
    users
  })

})
// all tag post here 
app.post('/tag',async(req,res)=>{
  const tag = req.body 
  const result = await tagcollection.insertOne(tag)
  res.send(result)
})
// get all tag here 
app.get('/tag',async(req,res)=>{
  const result = await tagcollection.find().toArray()
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
// 
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})