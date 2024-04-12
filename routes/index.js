var express = require('express');
var router = express.Router();
const userModel = require("./users");
const postModel = require("./post")
const passport = require('passport');
const localStrategy = require("passport-local");
const upload = require("./multer");

passport.use(new localStrategy(userModel.authenticate()))

// index get
router.get('/', function(req, res, next) {
  res.render('index', {nav: false});
});
//register get
router.get('/register', function(req, res, next) {
  res.render('register', {nav: false});
});
//profile get
router.get('/profile', isLoggedIn, async function(req, res, next) {
  const user =
  await userModel
  .findOne({username: req.session.passport.user})
  .populate("posts")
  res.render('profile', {user, nav: true});
});
//add get
router.get('/add', isLoggedIn, async function(req, res, next) {
  const user = await userModel.findOne({username: req.session.passport.user})
  res.render('add', {user, nav: true});
});
//show get
router.get('/show/posts', isLoggedIn, async function(req, res, next) {
  const user =
  await userModel
  .findOne({username: req.session.passport.user})
  .populate("posts")
  res.render('show', {user, nav: true});
});

//feed get
router.get('/feed', isLoggedIn, async function(req, res, next) {
  const user = await userModel.findOne({username: req.session.passport.user})
  const posts = await postModel.find()
  .populate("user")
  res.render("feed", {user, posts, nav:true})
});

// logout get
router.get("/logout", function(req, res, next){
  req.logout(function(err){
    if (err){return next(err);}
    res.redirect("/")
  })
})


//fileupload post
router.post('/fileupload', isLoggedIn, upload.single("image"), async function(req, res, next) {
  const user = await userModel.findOne({username: req.session.passport.user})
  user.profileImage = req.file.filename;
  await user.save();
  res.redirect("/profile");
});
// register post
router.post("/register", function(req, res, next){
  const data = new userModel({
    username: req.body.username,
    fullname: req.body.fullname,
    email: req.body.email,
    contact: req.body.contact
  })
  userModel.register(data, req.body.password)
  .then(function(){
    passport.authenticate("local")(req,res, function(){
      res.redirect("/profile")
    })
  })
})

// login post
router.post("/login", passport.authenticate("local", {
  failureRedirect: "/",
  successRedirect: "/profile"}) , function(req, res, next){
})
function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    return next()
  }
  res.redirect("/")
}

//createpost post
router.post('/createpost', isLoggedIn,upload.single("post_image") , async function(req, res, next) {
  const user = await userModel.findOne({username: req.session.passport.user})
  const post = await postModel.create({
    user: user._id,
    title: req.body.title,
    description: req.body.description,
    image: req.file.filename
  })
  user.posts.push(post._id);
  await user.save();
  res.redirect("/profile");
});

module.exports = router;
