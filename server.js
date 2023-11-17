//no use,backup 
//const dbUser = "381Project"; //lohin/create mongodb method
//const { MongoClient } = require("mongodb");//mongodb method
//let db=client.db(dbUser);//mongodb method(define db)
/*const connectMG = async () => {
   client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
   try {
      await client.connect();
      console.log('Wah Connected MG');
   } catch (err) {
      console.error('Failed Connect MG',err);
   }
} */ //mongodb method(cnDB)//const kittySchema = require('./models/kitty');//schema requirement
//
//names
const collectionName_user = 'user';  //login/create

const uri = `mongodb+srv://billydeng97:dhy97886886@cluster0.zsgzyzj.mongodb.net/381Project?retryWrites=true&w=majority`;

//names

//quotes
const mongoose = require('mongoose');
const express = require('express');
const session = require('cookie-session');
const app = express();
 app.set('view engine','ejs');
const bodyParser=require('body-parser');
 app.use(bodyParser.urlencoded({ extended: true }));
//quotes
//bookSchema
 const bookSchema = new mongoose.Schema({
    title: String,
    author: String,
    year: Number
});
const Book = mongoose.model('users', bookSchema);

//user schema 

//shortcuts
const closeDB=()=>mongoose.disconnect();	
const openDB=()=>mongoose.connect(uri);	
const db=mongoose.connection;
//shortcuts
//cookie
  app.use(session({
  name: 'Verify',
  keys: ['aaa','bbb','666'],
}));//cookie

//functions
const matchNamePW = async (db,usn,psw) => {
   try {let result = await db.collection(collectionName_user).findOne({ "username":`${usn}`,"password":`${psw}`});
      return result !== null; }
   catch (err) {
      console.error('SomethingWrong', err);
      return false;}}
      
const matchUserName = async (db,usn) => {
   try {let result = await db.collection(collectionName_user).findOne({ "username":`${usn}`});
      return result !== null; }
   catch (err) {
      console.error('SomethingWrong', err);
      return false;}}     
      


const createAcc=async (db,nusn,npsw)=>{
	
	try{
	let result=await db.collection(collectionName_user).insertOne({"username":`${nusn}`,"password":`${npsw}`});
	return result !== 1;}
	
	catch (err) {
	      console.error('SomethingWrong', err);
	      return false;}}
   
 
   const handle_login = async (req,username,password) => {
   try{ 
   await openDB();
   console.log("Connected DB");
   
   let result=await matchNamePW(db,username,password);
   if(result){
   console.log("Wah 666");
   
   let unique=await db.collection(collectionName_user).findOne({"username":`${username}`});
   let Id=unique._id.toString();
   console.log(Id);
   req.session.dbid=Id;
   return null;
   }
   else{
   return {Message:"Wrong Username or Password"};
   console.log("NOTCORRECT!!!")}
 
   
  }
   catch (err){
   console.error("Ahhhhhh!",err);
   }
   finally{
   await closeDB(); 
   console.log("Disconnected DB");}}
 //  
   const handle_accCreate = async (username, password) => {
   try{  
   await openDB();
   console.log("Connected DB");
   
	let match=await matchUserName(db,username);
	if(match){let result=true;
	console.log("Username used");
	return {Message:"User Name Already Used"};
	}
	
	else{
   let result=await createAcc(db,username,password);
       console.log("Wah666 Created");
       return null;}}
   
   
   catch (err){
   console.error("Ahhhhhh!",err);
   }
   finally{
   await closeDB(); 
   console.log("Disconnected DB");}}
   
   
   
   
//res req

app.get('/login', (req, res) => {
   res.status(200).render('login.ejs',{Message:null});   
  
});
app.post('/login', async(req,res) => {
   const result=await handle_login(req,req.body.username,req.body.password);
   if(result && result.Message){ res.status(200).render('login.ejs',{Message:result.Message});}
   if(result==null){
   return res.redirect('/');}
  
});

app.get('/createaccount', (req, res) => {
   res.status(200).render('createaccount.ejs',{Message:null});   
  });
  
app.post('/createaccount', async(req, res) => {
    const result=await handle_accCreate(req.body.username,req.body.password);
    if(result && result.Message){ res.status(200).render('createaccount.ejs',{Message:result.Message});}
  });

//mainpage
  app.get('/', async (req, res) => {
	if (!req.session.dbid) {
	console.log("坏坏哦偷看人家~");
	return res.redirect('/login');} ;
	
    try {
	await openDB();
	console.log('list books');
        const books = await Book.find();
        res.render('index', { books: books });
	   
    } catch (err) {
        res.status(500).send('Connot connect to DB');
		console.log('Connot connect to DB');
    }
	  finally{await closeDB();}
});
//mainpage
//manage books
app.get('/books/new', async (req, res) => {
    if (!req.session.dbid) {
	console.log("Did not login");
	return res.redirect('/login');}
	 try {
	console.log('insertone');
	res.render('createbook');
    } catch (err) {
        res.status(500).send('Server error');
    }
});

app.get('/books/edit/:id', async (req, res) => {
      if (!req.session.dbid) {
	console.log("Did not login");
	return res.redirect('/login');}
    try {
	    await openDB();
        const book = await Book.findById(req.params.id);
        res.render('edit', { book: book });
    } catch (err) {
        res.status(500).send('Server error');
        console.log('insert error or cannot connect db');
    }
	 finally{await closeDB();}
});

app.post('/books/add', async (req, res) => {
    try {
        await openDB();
        console.log('insertone');
        const newBook = new Book(req.body);
        await newBook.save();
        console.log('inserted book with id: ' + newBook._id);
         return res.redirect('/');
    } catch (err) {
        res.status(500).send('Server error');
		console.log('insert error or cannot connect db');
    }
      finally{await closeDB();}
});

app.post('/books/update/:id', async (req, res) => {
    try {
	await openDB();
        await Book.findByIdAndUpdate(req.params.id, req.body);
        return res.redirect('/');
    } catch (err) {
        res.status(500).send('Server error');
		console.log('insert error or cannot connect db');
    }
	 finally{await closeDB();}
});

app.post('/books/delete/:id', async (req, res) => {
    try {
	await openDB();
        await Book.findByIdAndDelete(req.params.id);
        return res.redirect('/');
    } catch (err) {
        res.status(500).send('Server error');
		console.log('insert error or cannot connect db');
    }
	 finally{await closeDB();}
});
//manage books

app.get('/logout',(req,res)=>{;
  req.session.dbid = null;
  res.redirect('/login');
  })
  
 //end
app.listen(process.env.PORT || 8099);

   
