var express = require("express");
var cookieSession = require('cookie-session');
var app = express();
var flash = require('express-flash');
const bcrypt = require('bcrypt');


app.use(flash());

app.use(cookieSession({
  name: 'session',
  keys: ['any'],


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


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/", (req, res) => {
  if(req.session.user_id){
  	res.redirect('/urls')
  }
  else{
  	res.redirect('/login')
  }
});



app.get("/urls", (req, res) => {
let user = req.session.user_id;
let templateVars = 
	{user_id: user, urls:'empty' , email: 'empty', errors: null};	

	if (req.session['user_id']){
		
				templateVars['urls'] =  urlsForUser(users[user]['id']);
				templateVars['email'] =  users[user]['email'];

	}
	else{
		req.flash('error', 'Looks like you are not logged-in');
		templateVars['errors'] = req.flash('error')
	}


	
  res.render("urls_index", templateVars);
});



app.get("/urls/new", (req, res) => {
	let user = req.session.user_id;
	let templateVars = 
		{user_id: user, email: 'empty'};	
	console.log(req.session.user_id, "first one")

	if (req.session['user_id']){
		
		templateVars['email'] =  users[user]['email'];
		
		res.render("urls_new", templateVars);	
	}

	else {
	res.redirect('/login')}
	
});



app.get("/urls/:id", (req, res) => {

let user = req.session.user_id;	
let templateVars = {user_id: user, shortURL: 'empty', fullURL: 'empty', email: 'empty', status : 'does_not_exist'};

for (url in urlDatabase){
	if(url === req.session.user_id){
		templateVars['status'] = 'not_logged_in';
	}

}


if (req.session['user_id'] && urlDatabase[req.params['id']]['userID'] === req.session['user_id']){
	templateVars['shortURL'] = req.params.id;
	templateVars['fullURL'] = urlDatabase[req.params.id]['fullURL'];
	templateVars['email'] = users[user]['email'];
	templateVars['status'] = "logged_in";
}

else if (req.session['user_id'] && urlDatabase[req.params['id']]['userID'] !== req.session['user_id']){
	templateVars['shortURL'] = req.params.id;
	templateVars['fullURL'] = urlDatabase[req.params.id]['fullURL'];
	templateVars['email'] = users[user]['email'];
	templateVars['status'] = "not_owner";
}

	
 
  res.render("urls_show", templateVars);
});


app.get("/u/:id", (req, res) => {
	let user = req.session.user_id;	
	let templateVars = {user_id: user, shortURL: 'empty', fullURL: 'empty', email: 'empty', status : 'does_not_exist'};	
  for (url in urlDatabase){
  	if (url === req.params.id){
  		res.redirect(`http://${urlDatabase[req.params.id]['fullURL']}`)
  	}
  }
  res.render('urls_show', templateVars)

});

app.post("/urls", (req, res) => {
	if (req.session.user_id){
	var shortURL = generateRandomString();
	urlDatabase[shortURL] = {};
	urlDatabase[shortURL]['fullURL']= req.body['longURL'];
	urlDatabase[shortURL]['userID'] = req.session['user_id'];
 
  res.redirect(`/urls/${shortURL}`);
}
else{
	let user = req.session.user_id;	
	let templateVars = {user_id: user, shortURL: 'empty', fullURL: 'empty', email: 'empty', status : 'not_logged_in'};
	res.render('urls_show', templateVars);
}
}); 

app.post("/urls/:id/delete", (req, res) => {

	if (urlDatabase[req.params.id]['userID'] === req.session['user_id']){
	delete urlDatabase[req.params.id];
	res.redirect('/urls/')
}
else{
	req.flash('info','welcome')
}
	
});

app.post("/urls/:id/edit", (req, res) => {

	if (urlDatabase[req.params.id]['userID'] === req.session['user_id']){
	res.redirect(`/urls/${req.params.id}`)}
	else{
		req.flash('info','welcome')
	}
});

app.post("/urls/:id", (req, res) => {
if (req.session.user_id && urlDatabase[req.params['id']]['userID'] === req.session['user_id']){	
urlDatabase[req.params.id]['fullURL']= req.body['longURL']
res.redirect('/urls');
}
});

app.post("/login", (req, res) => {

	for (user in users){
	if (users[user]['email'] === req.body['email'] 
			&& bcrypt.compareSync(req.body['password'],users[user]['password'])){
		req.session['user_id'] = users[user]['id'];
	res.redirect('/urls')
}
}


req.flash('error',"something wrong in login");
res.render('forLogin',{
	errors: req.flash('error')
})

});

app.post("/logout", (req, res) => {
req.session = null;
res.redirect('/urls')
});

app.get("/register", (req, res) => {
	if (req.session.user_id){
		res.redirect('/urls')
	}

  res.render("registration", {
  	errors: null
  });
});

app.post("/register", (req, res) => {

	var randID = generateRandomString();
	var existingEmail = false;
	

	for (userID in users){
		
		if (users[userID]['email'] === req.body['email']){
			req.flash('error',"email already exists");
			res.render('registration',{
				errors: req.flash('error')
			})

		}
	}

	if (req.body['email'] === '' || req.body['password'] === ''){
		req.flash('error',"You must write something");
		res.render('registration',{
			errors: req.flash('error')
		})
	}

	else{

	users[randID] = {id: randID, email: req.body['email'], password:bcrypt.hashSync(req.body['password'],10)}
	
	
	req.session['user_id'] = randID;
	res.redirect('/urls')
	}
});

app.get("/login", (req, res) => {
	if (req.session.user_id){
		res.redirect('/urls')
	}

  res.render("forLogin", {
  	errors: null
  });
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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



