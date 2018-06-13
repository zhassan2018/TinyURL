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
	console.log("cookie", req.cookies['username'])
  let templateVars = 
  { urls: urlDatabase, username: req.cookies['username']}; 	
  res.render("urls_index", templateVars);
});

app.post("/login", (req, res) => {
console.log(req.body)
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
  console.log(req.body);  // debug statement to see POST parameters
  //res.send("Ok")
  res.redirect(`/urls/${shortURL}`);
  console.log(urlDatabase)         // Respond with 'Ok' (we will replace this)
}); 

app.post("/urls/:id/delete", (req, res) => {

	delete urlDatabase[req.params.id];
	console.log(urlDatabase)
	res.redirect('/urls/')
});

app.post("/urls/:id", (req, res) => {
console.log(req.params.id)
console.log(req.params)
urlDatabase[req.params.id]= req.body['longURL']
res.redirect('/urls')
});

app.post("/login", (req, res) => {
console.log(req.body)
res.cookie('username',req.body['username'])
res.redirect('/urls')
});

app.post("/logout", (req, res) => {
console.log(req.body)
res.cookie('username','')
res.redirect('/urls')
});




function generateRandomString() {
	return Math.random().toString(36).substr(6); }


