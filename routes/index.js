var express = require('express');
var router = express.Router();
var User = require('../models/user');

router.get('/', (req, res, next) => {
    return res.render('index.ejs');
});


router.post('/', (req, res, next) => {
    console.log(req.body);
    var personInfo = req.body;


    if (!personInfo.email || !personInfo.username || !personInfo.password || !personInfo.passwordConf) {
        res.send();
    } else {
        if (personInfo.password == personInfo.passwordConf) {

            User.findOne({ email: personInfo.email }, (err, data) => {
                if (!data) {
                    User.findOne({}, (err, data) => {

                        if (data) {
                            console.log("if");
                        } else {
                        }

                        var newPerson = new User({
                            email: personInfo.email,
                            username: personInfo.username,
                            password: personInfo.password,
                            passwordConf: personInfo.passwordConf,
                            cities: ""
                        });

                        newPerson.save((err, Person) => {
                            if (err)
                                console.log(err);
                            else
                                console.log('Success');
                        });

                    }).sort({ _id: -1 }).limit(1);
                    res.send({ "Success": "You are regestered,You can login now." });
                } else {
                    res.send({ "Success": "Email is already used." });
                }

            });
        } else {
            res.send({ "Success": "password is not matched" });
        }
    }
});

router.get('/login', (req, res, next) => {
    return res.render('login.ejs');
});

router.post('/login', (req, res, next) => {
    //console.log(req.body);
    User.findOne({ email: req.body.email }, (err, data) => {
        if (data) {

            if (data.password == req.body.password) {
                //console.log("Done Login");
                req.session.userId = data._id;
                //console.log(req.session.userId);
                res.send({ "Success": "Success!" });

            } else {
                res.send({ "Success": "Wrong password!" });
            }
        } else {
            res.send({ "Success": "This Email Is not regestered!" });
        }
    });
});

router.get('/profile', (req, res, next) => {
    console.log("profile");
    User.findOne({ _id: req.session.userId }, (err, data) => {
        console.log("data");
        console.log(data);
        if (!data) {
            res.redirect('/');
        } else {
            //console.log("found");
            return res.render('profile.ejs', { "name": data.username, "email": data.email });
        }
    });
});

router.get('/logout', (req, res, next) => {
    console.log("logout")
    if (req.session) {
        // delete session object
        req.session.destroy((err) => {
            if (err) {
                return next(err);
            } else {
                return res.redirect('/');
            }
        });
    }
});

router.get('/forgetpass', (req, res, next) => {
    res.render("forget.ejs");
});

router.post('/forgetpass', (req, res, next) => {
    //console.log('req.body');
    //console.log(req.body);
    User.findOne({ email: req.body.email }, (err, data) => {
        console.log(data);
        if (!data) {
            res.send({ "Success": "This Email Is not regestered!" });
        } else {
            // res.send({"Success":"Success!"});
            if (req.body.password == req.body.passwordConf) {
                data.password = req.body.password;
                data.passwordConf = req.body.passwordConf;

                data.save((err, Person) => {
                    if (err)
                        console.log(err);
                    else
                        console.log('Success');
                    res.send({ "Success": "Password changed!" });
                });
            } else {
                res.send({ "Success": "Password does not matched! Both Password should be same." });
            }
        }
    });
});

// router.get("/api/storeData", (req, res, next) => {

// });
router.post("/api/storeCity", (req, res, next) => {
    if (req.session && req.session.userId) {
        User.findOne({ _id: req.session.userId }, (err, data) => {
            if (err) {
                console.log("[ERROR] " + err);
                return next(err);
            } else {
                if (data.cities) {
                    data.cities = data.cities + "$" + req.body.city;
                } else {
                    data.cities = req.body.city;
                }
                data.save((err, Person) => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("Success");
                    }
                });
                console.log(data.cities);
                // res.send({ "name": data.username, "email": data.email, "cities": data.cities });
            }
        });
    }
});

module.exports = router;