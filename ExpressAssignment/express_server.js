var express = require("express");
var cookieParser = require('cookie-parser')
var app = express();
var logout = true;
var registered = false;

app.use(cookieParser())
var PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


var urlDatabase = {
  "b2xVn2": {'fullURL':"http://www.lighthouselabs.ca"},
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

	for (x in users){
		
		if (users[x]['id'] === req.cookies['user_id'] && logout === true){
			
			IDtoSend = "";
		}
		else if (users[x]['id'] === req.cookies['user_id'] && logout === false){
			IDtoSend = users.x;
		}
		
		else{IDtoSend = ""
			 
		}
	}


  let templateVars = 
  { urls: urlDatabase, user: IDtoSend}; 	
  res.render("urls_index", templateVars);
});



app.get("/urls/new", (req, res) => {

	if (logout === true){
		res.redirect('/login')
	}
else{
	for (x in users){
		
		if (users[x]['id'] === req.cookies['user_id'] && logout === true){
			
			IDtoSend = "";
		}
		else if (users[x]['id'] === req.cookies['user_id'] && logout === false){
			IDtoSend = users.x;
		}
		
		else{IDtoSend = ""
			 
		}
	}

	let templateVars = 
	{user: IDtoSend}; 	
	
  res.render("urls_new", templateVars);}

});



app.get("/urls/:id", (req, res) => {

	for (x in users){
		
		if (users[x]['id'] === req.cookies['user_id'] && logout === true){
			
			IDtoSend = "";
		}
		else if (users[x]['id'] === req.cookies['user_id'] && logout === false){
			IDtoSend = users.x;
		}
		
		else{IDtoSend = ""
			 
		}
	}
console.log(urlDatabase[req.params.id])

  let templateVars = { shortURL: req.params.id, fullURL: urlDatabase[req.params.id]['fullURL'], user: IDtoSend};
  res.render("urls_show", templateVars);
});


app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.post("/urls", (req, res) => {
	var shortURL = generateRandomString();
	urlDatabase[shortURL] = {};
	urlDatabase[shortURL]['fullURL']= req.body['longURL']
	urlDatabase[shortURL]['userID'] = shortURL
   // debug statement to see POST parameters
  //res.send("Ok")
  console.log(urlDatabase)
  res.redirect(`/urls/${shortURL}`);
           // Respond with 'Ok' (we will replace this)
}); 

app.post("/urls/:id/delete", (req, res) => {

	console.log(req.params.id);
	console.log(req.cookies['user_id'])

	delete urlDatabase[req.params.id];
	
	res.redirect('/urls/')
});

app.post("/urls/:id/edit", (req, res) => {

	
	res.redirect(`/urls/${req.params.id}`)
});

app.post("/urls/:id", (req, res) => {
urlDatabase[req.params.id]= req.body['longURL']
res.redirect('/urls')
});

app.post("/login", (req, res) => {

	var foundEmailandPassword = false;
	var foundEmail = false;
	var foundID = '';

	for (x in users){
		if (users[x]['email'] === req.body['email'] 
			&& users[x]['password'] === req.body['password']){
			foundEmailandPassword = true;
		foundID = x;

		}

		if (users[x]['email'] === req.body['email']){
			foundEmail = true
		}

	}

if (foundEmailandPassword === false ){
	res.status(403).send("Wrong Password")
}

else if (foundEmail === false ){
	res.status(403).send("No email found")
}

else{
	logout = false;
	res.cookie('user_id',users[foundID]['id'])
	res.redirect('/')
}


});

app.post("/logout", (req, res) => {
res.cookie('user_id',req.cookies['user_id'])
logout = true;
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
	}
});

app.get("/login", (req, res) => {
  res.render("forLogin");
});

app.post("/NotLogged", (req, res) => {
res.redirect('/login')
});

app.post("/NotRegister", (req, res) => {
res.redirect('/register')
});




function generateRandomString() {
	return Math.random().toString(36).substr(6); }


