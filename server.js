var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var multer = require('multer');
var url = require('url');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var cookieParser = require('cookie-parser');
var session = require('express-session');

var ip = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
var port = process.env.OPENSHIFT_NODEJS_PORT || 3000;
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = mongoose.Types.ObjectId;

var userName = process.env.OPENSHIFT_MONGODB_DB_USERNAME || 'admin';
var password = process.env.OPENSHIFT_MONGODB_DB_PASSWORD || 'mG8idtg1md6f';
var mongoDBHost = process.env.OPENSHIFT_MONGODB_DB_HOST || 'localhost';
var mongoDBPort = process.env.OPENSHIFT_MONGODB_DB_PORT || '27017';
var uri = 'mongodb://' + userName + ':' + password + '@' + mongoDBHost + ':' + mongoDBPort + '/beingchef';
mongoose.connect(uri);

var ip = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
var port = process.env.OPENSHIFT_NODEJS_PORT || 3000;
app.use(express.static(__dirname + '/public'));

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(multer()); // for parsing multipart/form-data
app.use(session({ secret: 'this is the secret' }));
app.use(cookieParser())
app.use(passport.initialize());
app.use(passport.session());

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With');
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    next();
})
.options('*', function (req, res, next) {
    res.end();
});

//Schema and model definition

var ReviewSchema = new mongoose.Schema({
    rating: {type: Number, default: 0, max: 5},
    comment: String,
    creationDate: {type:Date, default:Date.now},
    username: String,
    recipeTitle: String,
    recipeUrl: String,
    recipeId: String
}, { collection: 'review' });

var IngredientSchema = new mongoose.Schema({
    name: String,
    quantity: Number,
    unit: String
});

var FavoriteSchema = new mongoose.Schema({
    recipeTitle: String,
    recipeUrl: String,
    recipeId: String
});

var RecipeSchema = new mongoose.Schema({
    title: String,
    externalId : String,
    isExternal: { type: Boolean, default: true },
    description: String,
    url: String,
    ingredients: [IngredientSchema],
    directions: String,
    serving: Number,
    isPrivate: { type: Boolean, default: false },
    cuisine: String,
    time: String,
    owner: String,
    reviews: [Schema.ObjectId],
    creationDate: Date
}, { collection: 'recipe' });

var UserSchema = new mongoose.Schema({
    username: String,
    password: { type: String, select: false },
    firstName: String,
    lastName: String,
    email: String,
    favorites: [FavoriteSchema],
    reviews: [Schema.ObjectId],
    followers: [Schema.ObjectId],
    following: [Schema.ObjectId],
    groceryList: [IngredientSchema]
}, { collection: 'user' });

var UserModel = mongoose.model('UserModel', UserSchema);
var RecipeModel = mongoose.model('RecipeModel', RecipeSchema);
var ReviewModel = mongoose.model('ReviewSchema', ReviewSchema);
var IngredientModel = mongoose.model('IngredientSchema', IngredientSchema)

passport.use(new LocalStrategy(
function (username, password, done) {
    UserModel.findOne({ username: username, password: password }, function (err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false); }
        return done(null, user);
    });
}));

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

app.post("/login", passport.authenticate('local'), function (req, res) {
    var user = req.user;
    res.jsonp(user);
});

app.get('/loggedin', function (req, res) {
    res.send(req.isAuthenticated() ? req.user : '0');
});

app.post('/logout', function (req, res) {
    req.logOut();
    res.send(200);
});

app.post('/register', function (req, res) {
    var newUser = req.body;
    UserModel.findOne({ username: newUser.username }, function (err, user) {
        if (err) { return next(err); }
        if (user) {
            res.json(null);
            return;
        }
        var newUser = new UserModel(req.body);
        newUser.save(function (err, user) {
            req.login(user, function (err) {
                if (err) { return next(err); }
                res.json(user);
            });
        });
    });
});

//Recipe APIs
app.get('/recipe/:recipeId', function (req, res) {
    var recipeId = req.params.recipeId;
    RecipeModel.findOne({ externalId: recipeId }, function (err, data) {
        res.jsonp(data);
    });
});

//User APIs
app.post('/review', function (req, res) {
    var reqData = req.body;
    var recipeData = reqData.dish;
    var review = reqData.review;
    var userId = reqData.user;
    var r = new ReviewModel(review);
    r.save(function (err, reviewdata) {
        if (err != null) {
            res.jsonp(null);
            return
        }
        if ('_id' in recipeData) {
            UserModel.findById(userId, function (err, userdata) {
                userdata.reviews.push(reviewdata._id);
                userdata.save(function (err, updateUserData) {
                    RecipeModel.findById(recipeData._id, function (err, data) {
                        data.reviews.push(reviewdata._id);
                        data.save(function (err, updateRecipeData) {
                            res.jsonp({ user: updateUserData, recipe: updateRecipeData, review: reviewdata })
                            return;
                        });
                    });
                });
            });
        } else {
            var newRecipe = new RecipeModel({
                title: recipeData.Title,
                externalId: recipeData.RecipeID,
                url: recipeData.ImageURL,
                description: recipeData.Description,
                cuisine: recipeData.Cuisine,
            });

            newRecipe.save(function (err, newrecipedata) {
                UserModel.findById(userId, function (err, userdata) {
                    userdata.reviews.push(reviewdata._id);
                    userdata.save(function (err, updateUserData) {
                        RecipeModel.findById(newrecipedata._id, function (err, data) {
                            data.reviews.push(reviewdata._id);
                            data.save(function (err, updateRecipeData) {
                                res.jsonp({ user: updateUserData, recipe: updateRecipeData, review: reviewdata })
                                return;
                            });
                        });
                    });
                });
            });
        }

    });
    
});

var addFavoriteForUser = function (userId, recipe, res) {
    UserModel.findById(userId, function (err, userdata) {
        for (val in userdata.favorites) {
            if (userdata.favorites[val].recipeId == recipe.externalId) {
                res.jsonp({ user: userdata, recipeDataId: recipe._id });
                return;
            }
        }
        
        userdata.favorites.push({
            recipeId: recipe.externalId,
            recipeTitle: recipe.title,
            recipeUrl: recipe.url
        });
        userdata.save(function (err, newUserData) {
            res.jsonp({ user: newUserData, recipeDataId: recipe._id });
        });
    });
}

app.post('/favorite', function (req, res) {
    var reqData = req.body;
    //var recipeId = reqData.dish.RecipeID;
    var recipeData = reqData.dish;
    if ('_id' in recipeData) {
        addFavoriteForUser(reqData.user, {
            externalId: recipeData.RecipeID,
            title: recipeData.Title,
            url: recipeData.ImageURL
        }, res);
    } else {
        var newRecipe = new RecipeModel({
            title: recipeData.Title,
            externalId: recipeData.RecipeID,
            url: recipeData.ImageURL,
            description: recipeData.Description,
            cuisine: recipeData.Cuisine,
        });
        newRecipe.save(function (err, data) {
            addFavoriteForUser(reqData.user, data, res);
        });
    }
});

app.get('/favorite/:userid', function (req, res) {
    var userId = req.params.userid;
    UserModel.findById(userId, function (err, userdata) {
        if (userdata == null) {
            res.jsonp(null);
            return;
        } else {
            res.jsonp(userdata.favorites);
        }
    });
});

app.get('/reviewbyuser/:userid', function (req, res) {
    var userId = req.params.userid;
    UserModel.findById(userId, function (err, userdata) {
        if (userdata == null) {
            res.jsonp(null);
            return;
        } else {
            ReviewModel.find({ '_id': { $in: userdata.reviews } }, function (err, reviewdata) {
                if (err != null || reviewdata == null) {
                    res.jsonp(null);
                    return;
                }
                res.jsonp(reviewdata);
            })
            
        }
    });
});

app.get('/reviewbyrecipe/:recipeid', function (req, res) {
    var recipeId = req.params.recipeid;
    RecipeModel.findOne({externalId: recipeId}, function (err, recipedata) {
        if (recipedata == null || recipedata.reviews.length == 0) {
            res.jsonp(null);
            return;
        } else {
            ReviewModel.find({ '_id': { $in: recipedata.reviews } }, function (err, reviewdata) {
                if (err != null || reviewdata == null) {
                    res.jsonp(null);
                    return;
                }
                res.jsonp(reviewdata);
            })

        }
    });
});

app.post('/remove_favorite', function (req, res) {
    var reqData = req.body;
    var userid = reqData.userid;
    var favoriteid = reqData.favoriteid;
    UserModel.findById(userid, function (err, userdata) {
        userdata.favorites.id(favoriteid).remove();
        userdata.save(function (err, data) {
            res.jsonp(data.favorites);
        });
    });
})


app.post('/remove_review', function (req, res) {
    var reqData = req.body;
    var userid = reqData.userid;
    var reviewid = reqData.reviewid;
    var recipeid = reqData.recipeid;
    ReviewModel.remove({ _id: reviewid }, function (err) {
        if (err != null) {
            res.jsonp(null);
            return;
        }
        UserModel.update({_id: userid}, {$pull: {reviews: reviewid}}, function (err, userdata) {
            RecipeModel.update({ externalId: recipeid }, { $pull: { reviews: reviewid } }, function (err, recipedata) {
                res.jsonp({ userreviews: userdata.reviews})
            });
        });
    })
})


app.get('/user/:userid', function (req, res) {
    var userId = req.params.userid;
    UserModel.findById(userId, function (err, userdata) {
        if (userdata == null) {
            res.jsonp(null);
            return;
        } else {
            res.jsonp(userdata);
        }
    });
})

app.get('/username/:username', function (req, res) {
    var username = req.params.username;
    UserModel.findOne({username: username}, function (err, userdata) {
        if (userdata == null) {
            res.jsonp(null);
            return;
        } else {
            ReviewModel.find({ '_id': { $in: userdata.reviews } }, function (err, reviewdata) {
                res.jsonp({ user: userdata, userReviews: reviewdata });
            })
        }
    });
})

app.post('/follow', function (req, res) {
    var reqData = req.body;
    var userId = reqData.userId;
    var followId = reqData.followId;
    UserModel.findById(userId, function (err, userdata) {
        if (userdata == null) {
            res.jsonp(null);
            return;
        } else {
            UserModel.count({ _id: followId }, function (err, count) {
                if (count > 0) {
                    userdata.following.push(followId);
                    userdata.save(function (err, updatedUserData) {
                        res.jsonp(updatedUserData);
                        return;
                    })
                } else {
                    res.jsonp(null);
                    return;
                }
            })
        }
    });
});

app.post('/unfollow', function (req, res) {
    var reqData = req.body;
    var userId = reqData.userId;
    var followId = reqData.followId;
    UserModel.findById(userId, function (err, userdata) {
        if (userdata == null) {
            res.jsonp(null);
            return;
        } else {
            UserModel.count({ _id: followId }, function (err, count) {
                if (count > 0) {
                    UserModel.update({ _id: userId }, { $pull: { following: followId } }, function (err, updatedUserData) {
                        res.jsonp(updatedUserData);
                        return;
                    });
                } else {
                    res.jsonp(null);
                    return;
                }
            })
        }
    });
});

app.get('/following/:userid', function (req, res) {
    var userId = req.params.userid;
    UserModel.findById(userId, function (err, userdata) {
        if (userdata == null) {
            res.jsonp(null);
            return;
        } else {
            UserModel.find({ '_id': { $in: userdata.following } }, function (err, followingUsers) {
                res.jsonp(followingUsers);
            })
        }
    });
})

app.post('/grocery', function (req, res) {
    var reqData = req.body;
    var userId = reqData.userId;
    var groceryList = reqData.groceryList;
    UserModel.findById(userId, function (err, userdata) {
        var found = false;
        for (var i = 0; i < groceryList.length; i++) {
            for (var j = 0; j < userdata.groceryList.length; j++) {
                if (userdata.groceryList[j].name.toUpperCase() === groceryList[i].Name.toUpperCase() &&
                    ((userdata.groceryList[j].unit === groceryList[i].Unit) ||
                    (userdata.groceryList[j].unit != null && groceryList[i].Unit != null &&
                    groceryList[i].Unit.toUpperCase() === userdata.groceryList[j].unit.toUpperCase()))) {
                    userdata.groceryList[j].quantity = userdata.groceryList[j].quantity + parseFloat(groceryList[i].Quantity);
                    found = true;
                    break;
                } 
            }
            if (!found) {
                userdata.groceryList.push(new IngredientModel({
                    name: groceryList[i].Name,
                    quantity: groceryList[i].Quantity,
                    unit: groceryList[i].Unit
                }))
            }
            found = false;
        }
        userdata.save(function (err, updatedUserData) {
            res.jsonp(updatedUserData);
        });
    })
})

app.get('/grocery/:userid', function (req, res) {
    var userId = req.params.userid;
    UserModel.findById(userId, function (err, userdata) {
        if (userdata == null) {
            res.jsonp(null);
            return;
        } else {
            res.jsonp(userdata.groceryList);
        }
    });
})

app.delete('/grocery/:userId/:groceryId', function (req, res) {
    var userId = req.params.userId;
    var groceryId = req.params.groceryId;
    UserModel.findById(userId, function (err, userdata) {
        userdata.groceryList.id(groceryId).remove();
        userdata.save(function (err, updatedUserData) {
            res.jsonp(updatedUserData);
        });
    })
})

app.get('/user', function (req, res) {
    UserModel.find(function (err, users) {
        res.jsonp(users);
    });
})

var auth = function (req, res, next) {
    if (!req.isAuthenticated())
        res.send(401);
    else
        next();
};

app.listen(port, ip);