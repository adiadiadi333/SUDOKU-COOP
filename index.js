const express = require('express');
const firebase = require('firebase');
const path = require('path');
const sud = require('./sudoku.js');
const bp = require('body-parser');
const session = require('express-session');

const firebaseConfig = {
    apiKey: "AIzaSyB9Gj86aRbyt-Xqla7xCJJxPDl_Uz0FTqA",
    authDomain: "sudoku-333.firebaseapp.com",
    databaseURL: "https://sudoku-333.firebaseio.com",
    projectId: "sudoku-333",
    storageBucket: "sudoku-333.appspot.com",
    messagingSenderId: "631668838127",
    appId: "1:631668838127:web:487a428a1958e27f7b551a",
    measurementId: "G-6KJBJVDGC8"
};
firebase.initializeApp(firebaseConfig);
firebase.database().ref("lobbies").set(null);

var noms = [];
var nextnom = "00000";
const colors = [
    "AliceBlue",
    "AntiqueWhite",
    "Aqua",
    "Aquamarine",
    "Azure",
    "Beige",
    "Bisque",
    "Black",
    "BlanchedAlmond",
    "Blue",
    "BlueViolet",
    "Brown",
    "BurlyWood",
    "CadetBlue",
    "Chartreuse",
    "Chocolate",
    "Coral",
    "CornflowerBlue",
    "Cornsilk",
    "Crimson",
    "Cyan",
    "DarkBlue",
    "DarkCyan",
    "DarkGoldenRod",
    "DarkGray",
    "DarkGrey",
    "DarkGreen",
    "DarkKhaki",
    "DarkMagenta",
    "DarkOliveGreen",
    "DarkOrange",
    "DarkOrchid",
    "DarkRed",
    "DarkSalmon",
    "DarkSeaGreen",
    "DarkSlateBlue",
    "DarkSlateGray",
    "DarkSlateGrey",
    "DarkTurquoise",
    "DarkViolet",
    "DeepPink",
    "DeepSkyBlue",
    "DimGray",
    "DimGrey",
    "DodgerBlue",
    "FireBrick",
    "FloralWhite",
    "ForestGreen",
    "Fuchsia",
    "Gainsboro",
    "GhostWhite",
    "Gold",
    "GoldenRod",
    "Gray",
    "Grey",
    "Green",
    "GreenYellow",
    "HoneyDew",
    "HotPink",
    "IndianRed",
    "Indigo",
    "Ivory",
    "Khaki",
    "Lavender",
    "LavenderBlush",
    "LawnGreen",
    "LemonChiffon",
    "LightBlue",
    "LightCoral",
    "LightCyan",
    "LightGoldenRodYellow",
    "LightGray",
    "LightGrey",
    "LightGreen",
    "LightPink",
    "LightSalmon",
    "LightSeaGreen",
    "LightSkyBlue",
    "LightSlateGray",
    "LightSlateGrey",
    "LightSteelBlue",
    "LightYellow",
    "Lime",
    "LimeGreen",
    "Linen",
    "Magenta",
    "Maroon",
    "MediumAquaMarine",
    "MediumBlue",
    "MediumOrchid",
    "MediumPurple",
    "MediumSeaGreen",
    "MediumSlateBlue",
    "MediumSpringGreen",
    "MediumTurquoise",
    "MediumVioletRed",
    "MidnightBlue",
    "MintCream",
    "MistyRose",
    "Moccasin",
    "NavajoWhite",
    "Navy",
    "OldLace",
    "Olive",
    "OliveDrab",
    "Orange",
    "OrangeRed",
    "Orchid",
    "PaleGoldenRod",
    "PaleGreen",
    "PaleTurquoise",
    "PaleVioletRed",
    "PapayaWhip",
    "PeachPuff",
    "Peru",
    "Pink",
    "Plum",
    "PowderBlue",
    "Purple",
    "RebeccaPurple",
    "Red",
    "RosyBrown",
    "RoyalBlue",
    "SaddleBrown",
    "Salmon",
    "SandyBrown",
    "SeaGreen",
    "SeaShell",
    "Sienna",
    "Silver",
    "SkyBlue",
    "SlateBlue",
    "SlateGray",
    "SlateGrey",
    "Snow",
    "SpringGreen",
    "SteelBlue",
    "Tan",
    "Teal",
    "Thistle",
    "Tomato",
    "Turquoise",
    "Violet",
    "Wheat",
    "White",
    "WhiteSmoke",
    "Yellow",
    "YellowGreen",
];

app = express();
app.use(express.static(path.join(__dirname,"static")));
app.use(bp.text());
app.use(session({
    secret:'ssssshhhhhhthisisabigsecret',
    resave:false,
    saveUninitialized:false
}));

app.set('view engine','ejs');

app.post('/welcome',function (req,res) {
    req.session.uname = req.body;
    console.log(req.session.uname);
    res.status(301);
    res.redirect('http://localhost:8162/welcome');
});

app.get('/welcome',function (req,res) {
    var name = req.session.uname;
    let loggedIn = !!name;
    res.render('welcome',{logged:loggedIn,pname:name});
});

app.get('/lobby',function (req,res) {
    var name = req.session.uname;
    let loggedIn = !!name;
    console.log(loggedIn);
    res.render('lobby',{logged:loggedIn,pname:name});
});

app.get('/logout',function (req,res) {
    delete req.session.uname;
    res.redirect('http://localhost:8162/welcome');
});

app.get('/solo',function (req,res) {
    var name = req.session.uname;
    let loggedIn = !!name;
    res.render('solo',{logged:loggedIn,pname:name});
});

app.get('/:id([0-9]{5})', function (req,res) {
    console.log("got lobby access!");
    var plref = firebase.database().ref("lobbies/lob"+req.params.id+"/players");
    plref.once('value').then(function (snap) {
        var name = req.session.uname;
        let choices = snap.exists()? colors.filter(x => !(snap.child(x).exists())):colors;
        let newColor = choices[Math.floor(Math.random() * choices.length)];
        console.log(newColor);
        let dsgtn = name?name:newColor;
        let loggedIn = !!name;
        plref.child(newColor).set("0");
        res.render('main_game',{lobid:req.params.id,pcol:newColor,pname:dsgtn,logged:loggedIn});
    });
});

app.get('/makelobby:diff',function (req,res) {
    let nom;
    if(noms.length===0){
        nom = nextnom;
        nextnom = String(parseInt(nom) + 1).padStart(5, '0');
    }else{
        nom = noms.pop();
    }
    console.log("got lobby create, decided num is"+nom);
    let puzstr = sud.sudoku.generate(req.params.diff);
    firebase.database().ref("lobbies/lob"+nom+"/puzzle").set(puzstr);
    firebase.database().ref("lobbies/lob"+nom+"/perzle").set(puzstr);
    firebase.database().ref("lobbies/lob"+nom+"/starttime").set(Date.now());
    firebase.database().ref("lobbies/lob"+nom+"/difficulty").set(req.params.diff);
    firebase.database().ref("lobbies/lob"+nom+"/status").set("running");
    firebase.database().ref("lobbies/lob"+nom+"/chat").set("");
    res.send("Lobby created with ID:"+nom);
    console.log(noms);
});

app.get('/update:id([0-9]{5}):diff?',function (req,res) {
    console.log("got lobby update from"+req.params.id);
    let d = req.params.diff?req.params.diff:"easy";
    let puzstr = sud.sudoku.generate(d);
    firebase.database().ref("lobbies/lob"+req.params.id+"/puzzle").set(puzstr);
    firebase.database().ref("lobbies/lob"+req.params.id+"/perzle").set(puzstr);
    firebase.database().ref("lobbies/lob"+req.params.id+"/starttime").set(Date.now());
    firebase.database().ref("lobbies/lob"+req.params.id+"/status").set("running");
    res.send('successfully updated!');
});

app.get('/delete:id([0-9]{5})',function (req,res) {
    console.log("got lobby delete from"+req.params.id);
    firebase.database().ref("lobbies/lob"+req.params.id).remove(function () {
        console.log("removed lobby");
    });
    noms.push(req.params.id);
    console.log(noms);
});

app.listen(8162,function () {
    console.log("server started on port 8162");
});

