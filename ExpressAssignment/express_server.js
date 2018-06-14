var express = require("express");
var cookieParser = require('cookie-parser')
var app = express();

app.use(cookieParser())
var PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};



app.get("/", (req, res) => {
  res.end("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  let templateVars = 
  { urls: urlDatabase, username: req.cookies['username']}; 	
  res.render("urls_index", templateVars);
});

app.post("/login", (req, res) => {

res.cookie('username',req.body['username'])
res.redirect('/urls')
});


app.get("/urls/new", (req, res) => {
	let templateVars = 
	{username: req.cookies["username"]}; 	
	
  res.render("urls_new", templateVars);

});



app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, fullURL: urlDatabase[req.params.id], username: req.cookies["username"]};
  res.render("urls_show", templateVars);
});


app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.post("/urls", (req, res) => {
	var shortURL = generateRandomString();
	urlDatabase[shortURL]= req.body['longURL']
   // debug statement to see POST parameters
  //res.send("Ok")
  res.redirect(`/urls/${shortURL}`);
           // Respond with 'Ok' (we will replace this)
}); 

app.post("/urls/:id/delete", (req, res) => {

	delete urlDatabase[req.params.id];
	console.log(urlDatabase)
	res.redirect('/urls/')
});

app.post("/urls/:id", (req, res) => {
urlDatabase[req.params.id]= req.body['longURL']
res.redirect('/urls')
});

app.post("/login", (req, res) => {
res.cookie('username',req.body['username'])
res.redirect('/urls')
});

app.post("/logout", (req, res) => {
res.cookie('username','')
res.redirect('/urls')
});

app.get("/register", (req, res) => {
  res.render("registration");
});

app.post("/register", (req, res) => {

	var randID = generateRandomString();
	var existingEmail = false;

	

	for (userID in users){
		
		if (users[userID]['email'] === req.body['email']){
			existingEmail = true;

		}
	}

	if (existingEmail){
		res.status(400).send("Email already exists fool")
	}

	else if (req.body['email'] === '' || req.body['password'] === ''){
		res.status(400).send("Write something fool")
	}

	else{


	users[`user ${randID}`] = {id: randID, email: req.body['email'], password: req.body['password']}

	
	res.cookie('user_id',randID)
	res.redirect('/urls/')
	console.log(req.cookies)}
});




function generateRandomString() {
	return Math.random().toString(36).substr(6); }


