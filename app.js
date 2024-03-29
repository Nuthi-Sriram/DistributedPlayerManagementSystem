var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var passport = require("passport");
var localStrategy = require("passport-local");
var methodOverride = require("method-override");
var flash = require("connect-flash");
var User = require("./models/user");
var Player = require("./models/player");
var Memory = require("./models/memory");
var Team = require("./models/team");
var Match=require("./models/match");
var PlayerStats=require("./models/playermatchstats");
var Schedule = require("./models/schedule");
var alert = require('alert');
require('dotenv').config();

 
mongoose.connect(process.env.DB_PATH, { useNewUrlParser: true });
app.set("view engine", "ejs"); 
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(flash());
 
app.use(require("express-session")({
    secret: "My name is Anshul",
    resave: false,
    saveUninitialized: false
}));
// ------- Passport configuration ---------//

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});



//------- Home route----------//
app.get("/", function (req, res) {
    res.render("index");
});

app.get("/about", function (req, res) {
    res.render("About");
})

// --------Signup route--------//

app.get("/signup", function (req, res) {
    res.render("signup");
});

app.post("/signup", function (req, res) {
    var newUser = new User({ username: req.body.username });
    User.register(newUser, req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            return res.render("signup");
        }
        else {
            passport.authenticate("local")(req, res, function () {
                req.flash("success", "Signup Successful, Please login with Your Credentials");
                res.redirect("/login");
            });
        }
    });
});

// -----------login routes----------------------//

app.get("/login", function (req, res) {
    res.render("login");
});

app.get("/relogin", function (req, res) {
    res.render("login");
    alert("Please enter a valid username and password");
});

 app.post("/login", passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/relogin"
}), function (req, res) {
});

// Login routes for selection committe
app.get("/loginsc", function (req, res) {
    res.render("loginsc");
});

app.get("/reloginsc", function (req, res) {
    res.render("loginsc");
    alert("Please enter a valid username and password");
});

app.post("/loginsc", passport.authenticate("local", {
    successRedirect: "/dashboardsc",
    failureRedirect: "/reloginsc"
}), function (req, res) {
});
 
// Login routes for enthusiasts committe
app.get("/loginen", function (req, res) {
    res.render("loginen");
});

app.get("/reloginen", function (req, res) {
    res.render("loginen");
    alert("Please enter a valid username and password");
})

app.post("/loginen", passport.authenticate("local", {
    successRedirect: "/dashboarden",
    failureRedirect: "/reloginen"
}), function (req, res) {
});


//-------------- logout routes ----------------//

app.get("/logout", function (req, res) {
    req.logout();
    req.flash("success", "Successfully logged You out");
    res.redirect("/login");
});


//----------------dashboard route---------------//

app.get("/dashboard", isLoggedIn, function (req, res) {
    res.render("dashboard");
});   
 

//----------------dashboard sc route---------------//

app.get("/dashboardsc", isLoggedIn, function (req, res) {
    res.render("dashboardsc");
});

//----------------dashboard enthusiast route---------------//

app.get("/dashboarden", isLoggedIn, function (req, res) {
    res.render("dashboarden");
});
 

// ------ Gallery Routes-----//

app.get("/dashboard/gallery", isLoggedIn, function (req, res) {
    Memory.find({ user: req.user.id }, function (err, memory) {
        if (err) {
            console.log(err);
        }
        else {
            res.render("gallery", { memory: memory });
        }
    });
});

app.get("/dashboard/gallery/newmemory", isLoggedIn, function (req, res) {
    res.render("newmemory");
})

app.post("/dashboard/gallery", isLoggedIn, function (req, res) {
    var newMemory = {
        image: req.body.image,
        title: req.body.title,
        description: req.body.description,
        user: req.user.id
    };
    Memory.create(newMemory, function (err, newMemory) {
        if (err) {
            console.log(err);
            req.flash("error", "Some error Occured");
            res.redirect("/dashboard/gallery/newmemory");
        }
        else {
            req.flash("success", "Successfully added a new blog");
            res.redirect("/dashboard/gallery");
        }
    });
});

//------------------ Delete memory--------//

app.delete("/dashboard/gallery/:id", isLoggedIn, function (req, res) {
    Memory.findByIdAndRemove(req.params.id, function (err) {
        if (err) {
            req.flash("error", "Item not deleted");
            res.redirect("/dashboard/gallery");
        }
        else {
            req.flash("success", "Successfully Deleted");
            res.redirect("/dashboard/gallery");
        }
    });
});


// -------------------team---------------//

app.get("/dashboard/myteams", isLoggedIn, function (req, res) {
    Team.find({ user: req.user.id }, function (err, team) {
        if (err) {
            console.log(err);
        }
        else {
            res.render("team", { team: team });
        }
    })
});


app.get("/dashboard/newteam", function (req, res) {
    res.render("newteam");
});


app.post("/dashboard/newteam", function (req, res) {
    var newTeam = {
        image: req.body.logo,
        name: req.body.team,
        user: req.user.id
    };
    Team.create(newTeam, function (err, newteam) {
        if (err) {
            console.log(err);
            res.redirect("/dashboard/newteam");
        }
        else {
            req.flash("success", "Successfully added a new team");
            res.redirect("/dashboard/myteams");
        }
    });
});


//------------------ Player route---------------//

app.get("/dashboard/myteams/:id", function (req, res) {
    var _id = req.params.id;
    Team.findById({ user: req.user.id, _id }, function (err, team) {
        if (err) {
            console.log(err);
        }
        else {
            Player.find({ user: req.user.id, team: req.params.id }, function (err, player) {
                if (err) {
                    console.log(err);
                }
                else {
                    res.render("players", { player: player, team: team });
                }
            });
        }
    });
});




// ------------------New Player------------//

app.get("/dashboard/myteams/:id/newplayer", isLoggedIn, function (req, res) {
    var _id = req.params.id;
    Team.findById({ _id }, function (err, team) {
        if (err) {
            console.log(err);
        }
        else {
            res.render("newplayer", { team: team });
        }
    });
});

app.post("/dashboard/myteams/:id", isLoggedIn, function (req, res) {
    var newPlayer = {
        name: req.body.name,
        fatherName: req.body.fatherName,
        dateOfBirth: req.body.dateOfBirth,
        preTeam: req.body.preTeam,
        address: req.body.address,
        mobileNo: req.body.mobileNo,
        email: req.body.email,
        user: req.user.id,
        team: req.params.id
    };
    Player.create(newPlayer, function (err, newPlayer) {
        if (err) {
            console.log(err);
            res.redirect("/dashboard/myteams/:id/newplayer");
        }
        else {
            req.flash("success", "Successfully added a new player");
            res.redirect("/dashboard/myteams/" + req.params.id);
        }
    });
});

// -----------------Show Route-------------//

app.get("/dashboard/myteams/:id/:playerid", isLoggedIn, function (req, res) {
    var _id = req.params.id;
    Team.findById({ user: req.user.id, _id }, function (err, team) {
        if (err) {
            console.log(err);
        }
        else {
            var _id = req.params.playerid;
            Player.findById({ _id, team: req.params.id }, function (err, player) {
                if (err) {
                    console.log(err);
                }
                else {
                    res.render("show", { player: player, team: team });
                }
            });
        }
    });
});

//---------------- Edit Player ---------------//

app.get("/dashboard/myteams/:id/:playerid/edit", isLoggedIn, function (req, res) {
    var _id = req.params.id;
    Team.findById({ user: req.user.id, _id }, function (err, team) {
        if (err) {
            console.log(err);
        }
        else {
            var _id = req.params.playerid;
            Player.findById({ _id, team: req.params.id }, function (err, updatePlayer) {
                if (err) {
                    console.log(err);
                }
                else {
                    if (updatePlayer.user != req.user.id) {
                        res.redirect("/dashboard/myteams");
                    }
                    else {
                        res.render("edit", { player: updatePlayer, team: team });
                    }

                }
            });
        }
    });
});


app.put("/dashboard/myteams/:id/:playerid", isLoggedIn, function (req, res) {
    var _id = req.params.playerid;
    Player.findByIdAndUpdate({ _id, team: req.params.id }, req.body.player, function (err, updatedplayer) {
        if (err) {
            console.log(err);
        }
        else {
            req.flash("success", "Successfully edited details");
            res.redirect("/dashboard/myteams/" + req.params.id);
        }
    });
});

//--------------- Delete Route-----------//

app.delete("/dashboard/myteams/:id/:playerid", isLoggedIn, function (req, res) {
    var _id = req.params.playerid;
    Player.findByIdAndRemove({ _id, team: req.params.id }, function (err) {
        if (err) {
            res.redirect("/dashboard/myteams");
        }
        else {
            req.flash("success", "Successfully deleted player");
            res.redirect("/dashboard/myteams/" + req.params.id);
        }
    });
});

//----------------selection committee match routes---------------//
app.get("/dashboardsc/mymatches", isLoggedIn, function (req, res) {
    Match.find({ user: req.user.id }, function (err, team) {
        if (err) {
            console.log(err);
        }
        else {
            res.render("matchsc", { team: team });
        }
    })
});

//------------------ Player route---------------//

app.get("/dashboardsc/mymatches/:id", function (req, res) {
    var _id = req.params.id;
    Match.findById({ user: req.user.id, _id }, function (err, match) {
        if (err) {
            console.log(err);
        }
        else {
            // console.log("test");
            PlayerStats.find({ user: req.user.id, match: req.params.id }, function (err, player) {
                if (err) {
                    console.log(err);  
                }
                else {  
                    // console.log("inside playerstats");
                    // console.log(player);
                    // console.log(match); 
                    res.render("playerstatssc", { player: player, match: match });
                }
            });
        } 
    });
});


// -----------------Show Route-------------//

app.get("/dashboardsc/mymatches/:id/:playerid", isLoggedIn, function (req, res) {
    var _id = req.params.id;
    Match.findById({ user: req.user.id, _id }, function (err, match) {
        if (err) {
            console.log(err);
        }
        else {
            var _id = req.params.playerid;
            PlayerStats.findById({ _id, match: req.params.id }, function (err, player) {
                if (err) {
                    console.log(err);
                }
                else {
                    res.render("showstatssc", { player: player, match: match });
                }
            });
        }
    });
});


//-------------enthusiasts route----------//

app.get("/dashboarden/mymatches", isLoggedIn, function (req, res) {
    Match.find({ user: req.user.id }, function (err, team) {
        if (err) {
            console.log(err);
        }
        else {
            res.render("matchen", { team: team });
        }
    })
});

//------------------ Player route---------------//

app.get("/dashboarden/mymatches/:id", function (req, res) {
    var _id = req.params.id;
    Match.findById({ user: req.user.id, _id }, function (err, match) {
        if (err) {
            console.log(err);
        }
        else {
            // console.log("test");
            PlayerStats.find({ user: req.user.id, match: req.params.id }, function (err, player) {
                if (err) {
                    console.log(err);  
                }
                else {  
                    // console.log("inside playerstats");
                    // console.log(player);
                    // console.log(match); 
                    res.render("playerstatsen", { player: player, match: match });
                }
            });
        } 
    });
});


// -----------------Show Route-------------//

app.get("/dashboarden/mymatches/:id/:playerid", isLoggedIn, function (req, res) {
    var _id = req.params.id;
    Match.findById({ user: req.user.id, _id }, function (err, match) {
        if (err) {
            console.log(err);
        }
        else {
            var _id = req.params.playerid;
            PlayerStats.findById({ _id, match: req.params.id }, function (err, player) {
                if (err) {
                    console.log(err);
                }
                else {
                    res.render("showstatsen", { player: player, match: match });
                }
            });
        }
    });
});
//------ end of enthusiasts routes--------------------//


//--------------------------Match Routes ------------------//

app.get("/dashboard/mymatches", isLoggedIn, function (req, res) {
    Match.find({ user: req.user.id }, function (err, team) {
        if (err) {
            console.log(err);
        }
        else {
            res.render("match", { team: team });
        }
    })
});


app.get("/dashboard/newmatch", function (req, res) {
    res.render("newmatch");
});


app.post("/dashboard/newmatch", function (req, res) {
    var newMatch = {
        image: req.body.logo,
        name: req.body.team,
        user: req.user.id
    };
    Match.create(newMatch, function (err, newMatch) {
        if (err) {
            console.log(err);
            res.redirect("/dashboard/newmatch");
        }
        else {
            req.flash("success", "Successfully added a new team");
            res.redirect("/dashboard/mymatches");
        }
    });
});


//------------------ Player route---------------//

app.get("/dashboard/mymatches/:id", function (req, res) {
    var _id = req.params.id;
    Match.findById({ user: req.user.id, _id }, function (err, match) {
        if (err) {
            console.log(err);
        }
        else {
            // console.log("test");
            PlayerStats.find({ user: req.user.id, match: req.params.id }, function (err, player) {
                if (err) {
                    console.log(err);  
                }
                else {  
                    // console.log("inside playerstats");
                    // console.log(player);
                    // console.log(match); 
                    res.render("playerstats", { player: player, match: match });
                }
            });
        } 
    });
});




// ------------------New Player------------//

app.get("/dashboard/mymatches/:id/newplayer", isLoggedIn, function (req, res) {
    var _id = req.params.id;
    Match.findById({ _id }, function (err, team) {
        if (err) {
            console.log(err);
        }
        else {
            res.render("newplayerstats", { team: team });
        }
    });
});

app.post("/dashboard/mymatches/:id", isLoggedIn, function (req, res) {
    var newPlayer = {
        name: req.body.name,
        nomatch: req.body.nomatch,
        runs: req.body.runs,
        BF: req.body.BF,
        hundreds: req.body.hundreds,
        fiftys: req.body.fiftys,
        fours: req.body.fours,
        sixs: req.body.sixs,
        team: req.body.team,
        match: req.params.id,
        user: req.user.id
    };
    PlayerStats.create(newPlayer, function (err, newPlayer) {
        if (err) {
            console.log(err);
            res.redirect("/dashboard/mymatches/:id/newplayer");
        }
        else {
            req.flash("success", "Successfully added a new player");
            res.redirect("/dashboard/mymatches/" + req.params.id);
        }
    });
});

// -----------------Show Route-------------//

app.get("/dashboard/mymatches/:id/:playerid", isLoggedIn, function (req, res) {
    var _id = req.params.id;
    Match.findById({ user: req.user.id, _id }, function (err, match) {
        if (err) {
            console.log(err);
        }
        else {
            var _id = req.params.playerid;
            PlayerStats.findById({ _id, match: req.params.id }, function (err, player) {
                if (err) {
                    console.log(err);
                }
                else {
                    res.render("showstats", { player: player, match: match });
                }
            });
        }
    });
});

//---------------- Edit Player ---------------//

app.get("/dashboard/mymatches/:id/:playerid/edit", isLoggedIn, function (req, res) {
    var _id = req.params.id;
    Match.findById({ user: req.user.id, _id }, function (err, match) {
        if (err) {
            console.log(err);
        }
        else {
            var _id = req.params.playerid;
            PlayerStats.findById({ _id, match: req.params.id }, function (err, updatePlayer) {
                if (err) {
                    console.log(err);
                }
                else {
                    if (updatePlayer.user != req.user.id) {
                        res.redirect("/dashboard/mymatches");
                    }
                    else {
                        res.render("editstats", { player: updatePlayer, match: match });
                        
                    }

                }
            });
        }
    });
});


app.put("/dashboard/mymatches/:id/:playerid", isLoggedIn, function (req, res) {
    var _id = req.params.playerid;
    PlayerStats.findByIdAndUpdate({ _id, match: req.params.id }, req.body.player, function (err, updatedplayer) {
        if (err) {
            console.log(err);
        }
        else {
            req.flash("success", "Successfully edited details");
            // console.log(updatedplayer);
            res.redirect("/dashboard/mymatches/" + req.params.id);
        }
    });
});

//--------------- Delete Route-----------//

app.delete("/dashboard/mymatches/:id/:playerid", isLoggedIn, function (req, res) {
    var _id = req.params.playerid;
    PlayerStats.findByIdAndRemove({ _id, match: req.params.id }, function (err) {
        if (err) {
            res.redirect("/dashboard/mymatches");
        }
        else {
            req.flash("success", "Successfully deleted player");
            res.redirect("/dashboard/mymatches/" + req.params.id);
        }
    });
});



//---------------------------end of match routes--------------//

// --------------------Schedule Routes---------------//




//--------------dashboard sc teams ------------------------//

// -------------------team---------------//

app.get("/dashboardsc/myteams", isLoggedIn, function (req, res) {
    Team.find({ user: req.user.id }, function (err, team) {
        if (err) {
            console.log(err);
        }
        else {
            res.render("teamsc", { team: team });
        }
    })
});
 

app.get("/dashboardsc/newteam", function (req, res) {
    res.render("newteamsc");
});


app.post("/dashboardsc/newteam", function (req, res) {
    var newTeam = {
        image: req.body.logo,
        name: req.body.team,
        user: req.user.id
    };
    Team.create(newTeam, function (err, newteam) {
        if (err) {
            console.log(err);
            res.redirect("/dashboardsc/newteam");
        }
        else {
            req.flash("success", "Successfully added a new team");
            res.redirect("/dashboardsc/myteams");
        }
    });
});


//------------------ Player route---------------//

app.get("/dashboardsc/myteams/:id", function (req, res) {
    var _id = req.params.id;
    Team.findById({ user: req.user.id, _id }, function (err, team) {
        if (err) {
            console.log(err);
        }
        else {
            Player.find({ user: req.user.id, team: req.params.id }, function (err, player) {
                if (err) {
                    console.log(err);
                }
                else {
                    res.render("playerssc", { player: player, team: team });
                }
            });
        }
    });   
});




// ------------------New Player------------//

app.get("/dashboardsc/myteams/:id/newplayer", isLoggedIn, function (req, res) {
    var _id = req.params.id;
    Team.findById({ _id }, function (err, team) {
        if (err) {
            console.log(err);
        }
        else {
            res.render("newplayersc", { team: team });
        }
    });
});

app.post("/dashboardsc/myteams/:id", isLoggedIn, function (req, res) {
    var newPlayer = {
        name: req.body.name,
        fatherName: req.body.fatherName,
        dateOfBirth: req.body.dateOfBirth,
        preTeam: req.body.preTeam,
        address: req.body.address,
        mobileNo: req.body.mobileNo,
        email: req.body.email,
        user: req.user.id,
        team: req.params.id
    };
    Player.create(newPlayer, function (err, newPlayer) {
        if (err) {
            console.log(err);
            res.redirect("/dashboardsc/myteams/:id/newplayer");
        }
        else {
            req.flash("success", "Successfully added a new player");
            res.redirect("/dashboardsc/myteams/" + req.params.id);
        }
    });
});

// -----------------Show Route-------------//

app.get("/dashboardsc/myteams/:id/:playerid", isLoggedIn, function (req, res) {
    var _id = req.params.id;
    Team.findById({ user: req.user.id, _id }, function (err, team) {
        if (err) {
            console.log(err);
        }
        else {
            var _id = req.params.playerid;
            Player.findById({ _id, team: req.params.id }, function (err, player) {
                if (err) {
                    console.log(err);
                }
                else {
                    res.render("showsc", { player: player, team: team });
                }
            });
        }
    });   
});  

//---------------- Edit Player ---------------//

app.get("/dashboardsc/myteams/:id/:playerid/edit", isLoggedIn, function (req, res) {
    var _id = req.params.id;
    Team.findById({ user: req.user.id, _id }, function (err, team) {
        if (err) {
            console.log(err);
        }
        else {
            var _id = req.params.playerid;
            Player.findById({ _id, team: req.params.id }, function (err, updatePlayer) {
                if (err) {
                    console.log(err);
                }
                else {
                    if (updatePlayer.user != req.user.id) {
                        res.redirect("/dashboardsc/myteams");
                    }
                    else {
                        res.render("edit", { player: updatePlayer, team: team });
                    }

                }
            });
        }
    });
});


app.put("/dashboardsc/myteams/:id/:playerid", isLoggedIn, function (req, res) {
    var _id = req.params.playerid;
    Player.findByIdAndUpdate({ _id, team: req.params.id }, req.body.player, function (err, updatedplayer) {
        if (err) {
            console.log(err);
        }
        else {
            req.flash("success", "Successfully edited details");
            res.redirect("/dashboardsc/myteams/" + req.params.id);
        }
    });
});

//--------------- Delete Route-----------//

app.delete("/dashboardsc/myteams/:id/:playerid", isLoggedIn, function (req, res) {
    var _id = req.params.playerid;
    Player.findByIdAndRemove({ _id, team: req.params.id }, function (err) {
        if (err) {
            res.redirect("/dashboardsc/myteams");
        }
        else {
            req.flash("success", "Successfully deleted player");
            res.redirect("/dashboardsc/myteams/" + req.params.id);
        }
    });
});

app.get("/dashboardsc/schedule",isLoggedIn, function (req, res) {
    Schedule.find({ user: req.user.id }, function (err, schedule) {
        if (err) {
            console.log(err);
        }
        else {
            res.render("schedulesc", { schedule: schedule });
        }
    });
});

app.get("/dashboarden/schedule",isLoggedIn, function (req, res) {
    Schedule.find({ user: req.user.id }, function (err, schedule) {
        if (err) {
            console.log(err);
        }
        else {
            res.render("scheduleen", { schedule: schedule });
        }
    });
});

app.get("/dashboardsc/schedule/newschedule", isLoggedIn, function (req, res) {
    res.render("newSchedulesc");
});
  
app.post("/dashboardsc/schedule", isLoggedIn, function (req, res) {
    var scheduleDetails = {
        Teamname: req.body.teamname,
        scheduleDate: req.body.scheduleDate,
        time: req.body.time,
        user: req.user.id
    };
    Schedule.create(scheduleDetails, function (err, scheduleDetails) {
        if (err) {
            console.log(err);
        }
        else {
            req.flash("success", "Added a new schedule");
            res.redirect("/dashboardsc/schedule");
        }
    });
});
//-------------------- Delete Schedule-------------//

app.delete("/dashboardsc/schedule/:id", isLoggedIn, function (req, res) {
    Schedule.findByIdAndRemove(req.params.id, function (err) {
        if (err) {
            res.redirect("/dashboardsc/schedule");
        }
        else {
            req.flash("success", "Successfully Deleted");
            res.redirect("/dashboardsc/schedule");
        }
    });
}); 


// ----------- end of dashboard sc teams -------------------------//

app.get("/dashboard/schedule",isLoggedIn, function (req, res) {
    Schedule.find({ user: req.user.id }, function (err, schedule) {
        if (err) {
            console.log(err);
        }
        else {
            res.render("schedule", { schedule: schedule });
        }
    });
});

app.get("/dashboard/schedule/newschedule", isLoggedIn, function (req, res) {
    res.render("newSchedule");
});

app.post("/dashboard/schedule", isLoggedIn, function (req, res) {
    var scheduleDetails = {
        Teamname: req.body.teamname,
        scheduleDate: req.body.scheduleDate,
        time: req.body.time,
        user: req.user.id
    };
    Schedule.create(scheduleDetails, function (err, scheduleDetails) {
        if (err) {
            console.log(err);
        }
        else {
            req.flash("success", "Added a new schedule");
            res.redirect("/dashboard/schedule");
        }
    });
});
//-------------------- Delete Schedule-------------//

app.delete("/dashboard/schedule/:id", isLoggedIn, function (req, res) {
    Schedule.findByIdAndRemove(req.params.id, function (err) {
        if (err) {
            res.redirect("/dashboard/schedule");
        }
        else {
            req.flash("success", "Successfully Deleted");
            res.redirect("/dashboard/schedule");
        }
    });
});


// --------------middleware--------------//




function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    else {
        req.flash("error", "Please Login First");
        res.redirect("/login");
    }
}
// app.listen(process.env.PORT,function(){
//     console.log("DPMS is Online");
//     console.log(process.env.PORT);
// });

app.listen(3000, function () {
    console.log("DPMS is Online");
    // console.log(process.env.PORT);
});