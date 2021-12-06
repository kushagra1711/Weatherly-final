var express = require("express");
var router = express.Router();
var User = require("../models/user");
var https = require("https");
const { pathToFileURL } = require("url");

router.get("/", (req, res, next) => {
    return res.render("index.ejs");
});

router.post("/", (req, res, next) => {
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
                            cities: "",
                        });

                        newPerson.save((err, Person) => {
                            if (err) console.log(err);
                            else console.log("Success");
                        });
                    })
                        .sort({ _id: -1 })
                        .limit(1);
                    res.send({ Success: "You are regestered,You can login now." });
                } else {
                    res.send({ Success: "Email is already used." });
                }
            });
        } else {
            res.send({ Success: "password is not matched" });
        }
    }
});

router.get("/login", (req, res, next) => {
    return res.render("login.ejs");
});

router.post("/login", (req, res, next) => {
    User.findOne({ email: req.body.email }, (err, data) => {
        if (data) {
            if (data.password == req.body.password) {
                req.session.userId = data._id;
                res.send({ Success: "Success!" });
            } else {
                res.send({ Success: "Wrong password!" });
            }
        } else {
            res.send({ Success: "This Email Is not regestered!" });
        }
    });
});

router.get("/profile", (req, res, next) => {
    console.log("profile");
    User.findOne({ _id: req.session.userId }, (err, data) => {
        console.log("data");
        console.log(data);
        if (!data) {
            res.redirect("/");
        } else {
            return res.render("profile.ejs", {
                name: data.username,
                email: data.email,
            });
        }
    });
});

router.get("/logout", (req, res, next) => {
    console.log("logout");
    if (req.session) {
        // delete session object
        req.session.destroy((err) => {
            if (err) {
                return next(err);
            } else {
                return res.redirect("/");
            }
        });
    }
});

router.get("/forgetpass", (req, res, next) => {
    res.render("forget.ejs");
});

router.post("/forgetpass", (req, res, next) => {
    User.findOne({ email: req.body.email }, (err, data) => {
        console.log(data);
        if (!data) {
            res.send({ Success: "This Email Is not regestered!" });
        } else {
            if (req.body.password == req.body.passwordConf) {
                data.password = req.body.password;
                data.passwordConf = req.body.passwordConf;

                data.save((err, Person) => {
                    if (err) console.log(err);
                    else console.log("Success");
                    res.send({ Success: "Password changed!" });
                });
            } else {
                res.send({
                    Success: "Password does not matched! Both Password should be same.",
                });
            }
        }
    });
});

function getTemp(city, callback) {
    const api = {
        key: "cd3c097765ba92903ec783b6cf5bef86",
        base: "api.openweathermap.org",
    };
    const options = {
        hostname: api.base,
        path: `/data/2.5/weather?q=${city}&units=metric&APPID=${api.key}`,
        method: "GET",
    };

    https
        .request(options, callback)
        .on("error", (error) => {
            console.error("[ERROR]" + error);
        })
        .end();
}

router.post("/api/getTemp", (req, res, next) => {
    console.log("[INFO] API called");
    getTemp(req.body.city, (resp) => {
        resp.on("data", (d) => {
            console.log("[INFO] API returned ok");
            res.header("Content-Type", "application/json");
            res.send({ data: JSON.parse(d) });
        });
    });
});

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
                        console.log("[INFO] Successfully added '" + req.body.city + "'");
                    }
                });
                res.end();
            }
        });
    }
});

router.post("/api/getCity", (req, res, next) => {
    if (req.session && req.session.userId) {
        User.findOne({ _id: req.session.userId }, (err, data) => {
            if (err) {
                console.log("[ERROR] " + err);
                return next(err);
            } else {
                var cty = data.cities.split("$");
                var dc = {};
                for (var i = 0; i < cty.length; i++) {
                    dc[cty[i].toLocaleLowerCase()] = 1;
                }
                var ls = [];
                for (var key in dc) {
                    if (key != undefined) {
                        ls.push(key);
                    }
                }
                console.log(ls);
                res.send({ cities: ls });
            }
        });
    }
});

module.exports = router;
