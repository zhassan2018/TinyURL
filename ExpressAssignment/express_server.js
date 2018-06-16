var express = require("express");
var cookieSession = require('cookie-session');
var app = express();
var logout = true;
var registered ='';
const bcrypt = require('bcrypt');

app.use(cookieSession({
  name: 'session',
  keys: ['any'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

var PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


var urlDatabase = {
  "b2xVn2": {'fullURL':"http://www.lighthouselabs.ca", 'userID':"b2xVn2"},
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
var registered = false;
var currentID = '';
var EmailCurrent ='';
	for (x in users){
		
		if (users[x]['id'] === req.session['user_id'] && logout === true){
			registered = true;
			IDtoSend = "";
			currentID = users[x]['id'];
			
			break;
		}
		else if (users[x]['id'] === req.session['user_id'] && logout === false){
			registered = true
			IDtoSend = "something";
			EmailCurrent = users[x]['email']
			currentID = users[x]['id'];
			break;
		}
		
		else{IDtoSend = "";
			 
		}
	}

let templateVars = 
{ urls:'' , user: IDtoSend, email: EmailCurrent}; 


if (registered === true && logout === false){
	templateVars['urls'] = urlsForUser(currentID)
}
else if (registered && logout){
	templateVars['urls'] = 'NOlogin'
}
else{
	templateVars['urls'] = 'NOregister'
}	


	
  res.render("urls_index", templateVars);
});



app.get("/urls/new", (req, res) => {

	if (logout === true){
		res.redirect('/login')
	}
else{
	for (x in users){
		
		if (users[x]['id'] === req.session['user_id'] && logout === true){
			
			IDtoSend = "";
		}
		else if (users[x]['id'] === req.session['user_id'] && logout === false){
			IDtoSend = "something";
			EmailCurrent = users[x]['email']
		}
		
		else{IDtoSend = ""
			 
		}
	}

	let templateVars = 
	{user: IDtoSend, email: EmailCurrent}; 
	
	
  res.render("urls_new", templateVars);}

});



app.get("/urls/:id", (req, res) => {
var IDtoSend = "";

	for (x in users){
		
		if (urlDatabase[req.params['id']]['userID'] === req.session['user_id'] && logout === true){
			
			IDtoSend = "nothing";
		}
		else if (req.session['user_id'] === urlDatabase[req.params['id']]['userID'] && logout === false){
			IDtoSend = "something";
			EmailCurrent = users[x]['email']
		}
		
		else{IDtoSend = "";
			 
		}
	}





  let templateVars = { shortURL: req.params.id, fullURL: urlDatabase[req.params.id]['fullURL'], user: IDtoSend,email: EmailCurrent};
 
  res.render("urls_show", templateVars);
});


app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.post("/urls", (req, res) => {
	var shortURL = generateRandomString();
	urlDatabase[shortURL] = {};
	urlDatabase[shortURL]['fullURL']= req.body['longURL'];
	urlDatabase[shortURL]['userID'] = req.session['user_id'];
   // debug statement to see POST parameters
  //res.send("Ok")
 
  res.redirect(`/urls/${shortURL}`);
           // Respond with 'Ok' (we will replace this)
}); 

app.post("/urls/:id/delete", (req, res) => {

	if (urlDatabase[req.params.id]['userID'] === req.session['user_id']){


	delete urlDatabase[req.params.id];}
	
	res.redirect('/urls/')
});

app.post("/urls/:id/edit", (req, res) => {

	if (urlDatabase[req.params.id]['userID'] === req.session['user_id']){
	res.redirect(`/urls/${req.params.id}`)}
});

app.post("/urls/:id", (req, res) => {
urlDatabase[req.params.id]['fullURL']= req.body['longURL']
res.redirect('/urls')
});

app.post("/login", (req, res) => {

	var foundEmailandPassword = false;
	var foundEmail = false;
	var foundID = '';

	for (x in users){
		if (users[x]['email'] === req.body['email'] 
			&& bcrypt.compareSync(req.body['password'],users[x]['password'])){
			foundEmailandPassword = true;
		foundID = x;

		}

		if (users[x]['email'] === req.body['email']){
			foundEmail = true;
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
	req.session['user_id'] = users[foundID]['id']
	res.redirect('/urls')
}


});

app.post("/logout", (req, res) => {


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


	users[randID] = {id: randID, email: req.body['email'], password:bcrypt.hashSync(req.body['password'],10)}
	
	
	req.session['user_id'] = randID;
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

function urlsForUser(id){
	var newURLDB={};
	for (x in urlDatabase){
		if (urlDatabase[x]['userID'] === id){
			newURLDB[x] = urlDatabase[x];
		}
	}
	return newURLDB;
}	


