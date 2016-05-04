'use strict';

/* jshint node: true */

/*
 * This builds on the webServer of previous projects in that it exports the current
 * directory via webserver listing on a hard code (see portno below) port. It also
 * establishes a connection to the MongoDB named 'cs142project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch any file accessible
 * to the current user in the current directory or any of its children.
 *
 * This webServer exports the following URLs:
 * /              -  Returns a text status message.  Good for testing web server running.
 * /test          - (Same as /test/info)
 * /test/info     -  Returns the SchemaInfo object from the database (JSON format).  Good
 *                   for testing database connectivity.
 * /test/counts   -  Returns the population counts of the cs142 collections in the database.
 *                   Format is a JSON object with properties being the collection name and
 *                   the values being the counts.
 *
 * The following URLs need to be implemented:
 * /user/list     -  Returns an array containing all the User objects from the database.
 *                   (JSON format)
 * /user/:id      -  Returns the User object with the _id of id. (JSON format).
 * /photosOfUser/:id' - Returns an array with all the photos of the User (id). Each photo
 *                      should have all the Comments on the Photo (JSON format)
 *
 */

var mongoose = require('mongoose');
var async = require('async');
var session = require('express-session');
var bodyParser = require('body-parser');
var fs = require("fs");
var multer = require('multer');
var processFormBody = multer({storage: multer.memoryStorage()}).single('uploadedphoto');


// Load the Mongoose schema for User, Photo, and SchemaInfo
var User = require('./schema/user.js');
var Photo = require('./schema/photo.js');
var SchemaInfo = require('./schema/schemaInfo.js');

var express = require('express');
var app = express();


mongoose.connect('mongodb://localhost/cs142project6');

// We have the express static module (http://expressjs.com/en/starter/static-files.html) do all
// the work for us.
app.use(express.static(__dirname));
app.use(session({secret: 'secretKey', resave: false, saveUninitialized: false}));
app.use(bodyParser.json());


app.get('/', function (request, response) {
    response.send('Simple web server of files from ' + __dirname);
});

/*
 * Use express to handle argument passing in the URL.  This .get will cause express
 * To accept URLs with /test/<something> and return the something in request.params.p1
 * If implement the get as follows:
 * /test or /test/info - Return the SchemaInfo object of the database in JSON format. This
 *                       is good for testing connectivity with  MongoDB.
 * /test/counts - Return an object with the counts of the different collections in JSON format
 */
app.get('/test/:p1', function (request, response) {
    // Express parses the ":p1" from the URL and returns it in the request.params objects.
    console.log('/test called with param1 = ', request.params.p1);

    var param = request.params.p1 || 'info';

    if (param === 'info') {
        // Fetch the SchemaInfo. There should only one of them. The query of {} will match it.
        SchemaInfo.find({}, function (err, info) {
            if (err) {
                // Query returned an error.  We pass it back to the browser with an Internal Service
                // Error (500) error code.
                console.error('Doing /user/info error:', err);
                response.status(500).send(JSON.stringify(err));
                return;
            }
            if (info.length === 0) {
                // Query didn't return an error but didn't find the SchemaInfo object - This
                // is also an internal error return.
                response.status(500).send('Missing SchemaInfo');
                return;
            }

            // We got the object - return it in JSON format.
            console.log('SchemaInfo', info[0]);
            response.end(JSON.stringify(info[0]));
        });
    } else if (param === 'counts') {
        // In order to return the counts of all the collections we need to do an async
        // call to each collections. That is tricky to do so we use the async package
        // do the work.  We put the collections into array and use async.each to
        // do each .count() query.
        var collections = [
            {name: 'user', collection: User},
            {name: 'photo', collection: Photo},
            {name: 'schemaInfo', collection: SchemaInfo}
        ];
        async.each(collections, function (col, done_callback) {
            col.collection.count({}, function (err, count) {
                col.count = count;
                done_callback(err);
            });
        }, function (err) {
            if (err) {
                response.status(500).send(JSON.stringify(err));
            } else {
                var obj = {};
                for (var i = 0; i < collections.length; i++) {
                    obj[collections[i].name] = collections[i].count;
                }
                response.end(JSON.stringify(obj));

            }
        });
    } else {
        // If we know understand the parameter we return a (Bad Parameter) (400) status.
        response.status(400).send('Bad param ' + param);
    }
});

/*
 * URL /user/list - Return all the User object.
 */
app.get('/user/list', function (request, response) {
    if(request.session === null || request.session == undefined || request.session.user === null || request.session.user === undefined) {
        response.status(401).send("User is not logged in.");
        return;
    } else {
        var User = mongoose.model('User', SchemaInfo);
        var output = new Array();
        User.find( function (err, users) {
            if(err != null) {
                response.status(500).send("Error");
            }
            for(var i = 0; i < users.length; i++) {
                var user = users[i];
                var obj = {id: user.id, first_name: user.first_name, last_name: user.last_name};
                output.push(obj);
                //console.log(obj);
            }
            response.status(200).send(output);
        });
    }
});

/*
 * URL /user/:id - Return the information for User (id)
 */
app.get('/user/:id', function (request, response) {
    if(request.session === null || request.session == undefined || request.session.user === null || request.session.user === undefined) {
        response.status(401).send("User is not logged in.");
    } else {
        var id = request.url.substring(6);
    
        var User = mongoose.model('User',SchemaInfo);
        User.findOne({_id: id}, function (err, user) { 
            if(err != null) {
                response.status(400).send("Invalid User ID");
                return;
            }
            if(user == undefined) {
                response.status(400).send("User not found");
            }
            var obj = {
                location: user.location,
                occupation: user.occupation,
                first_name: user.first_name,
                last_name: user.last_name,
                id: user.id,
                description: user.description,
                _id: user._id
            }; 
            response.status(200).send(obj);
        });
    }
});

app.get('/latest/:id', function(request, response) {
    if(request.session == undefined || request.session.user === null || request.session.user == undefined) {
        response.status(401).send("User is not logged in.");
        return;
    }
    Photo.find({user_id: request.params.id}, function(err, photos) {
        if (err) {
            console.error('Doing /latest/id error:', err);
            response.status(400).send(JSON.stringify(err));
            return;
        }
        photos = photos.filter(function(phot) {
           if(phot.vis_perms == undefined) { return true; }
           if(phot.vis_perms.length < 1) { return true; }
           if(phot.vis_perms.length === 1 && phot.vis_perms[0].length === 0) { return true; }
           // Note: Must be == rather than === since the object types are different: 
           if(phot.user_id == request.session.user.id) { return true; }
           // Visibility list will be case sensitive. This is a design choice.
           if(phot.vis_perms.indexOf(request.session.user.first_name + " " + request.session.user.last_name) > -1) {
              return true;
           }
           return false;
        });

        if(photos.length === 0) {
            response.status(200).send(null);
            return;
        }
        var photo = photos.reduce(function(prev,cur) {
            if(prev.date_time.getTime() < cur.date_time.getTime()) {
                return cur;
            } else {
                return prev;
            }
        });
        response.status(200).send(photo);
    })
})

app.get('/popular/:id', function(request, response) {
    if(request.session == undefined || request.session.user === null || request.session.user == undefined) {
        response.status(401).send("User is not logged in.");
        return;
    }
    Photo.find({user_id: request.params.id}, function(err, photos) {
        if (err) {
            console.error('Doing /popular/id error:', err);
            response.status(400).send(JSON.stringify(err));
            return;
        }
        photos = photos.filter(function(phot) {
           if(phot.vis_perms == undefined) { return true; }
           if(phot.vis_perms.length < 1) { return true; }
           if(phot.vis_perms.length === 1 && phot.vis_perms[0].length === 0) { return true; }
           // Note: Must be == rather than === since the object types are different: 
           if(phot.user_id == request.session.user.id) { return true; }
           // Visibility list will be case sensitive. This is a design choice.
           if(phot.vis_perms.indexOf(request.session.user.first_name + " " + request.session.user.last_name) > -1) {
              return true;
           }
           return false;
        });

        if(photos.length === 0) {
            response.status(200).send(null);
            return;
        }
        var photo = photos.reduce(function(prev,cur) {
            if(prev.comments.length < cur.comments.length) {
                return cur;
            } else {
                return prev;
            }
        });
        response.status(200).send(photo);
    })
});

app.get('/photosearch/:text', function(request, response) {
    if(request.session == undefined || request.session.user === null || request.session.user == undefined) {
        response.status(401).send("User is not logged in.");
    } else {
        var text = request.params.text;

        // lookup all photos.
        Photo.find({}, function (err, photos) {
          if (err) {
            console.error('Doing /photosOfUser/id error:', err);
            response.status(400).send(JSON.stringify(err));
            return;
          }
          // Only allow photos with visibility permissions.
          photos = photos.filter(function(phot) {
             if(phot.vis_perms == undefined) { return true; }
             if(phot.vis_perms.length < 1) { return true; }
             if(phot.vis_perms.length === 1 && phot.vis_perms[0].length === 0) { return true; }
             // Note: Must be == rather than === since the object types are different: 
             if(phot.user_id == request.session.user.id) { return true; }
             // Visibility list will be case sensitive. This is a design choice.
             if(phot.vis_perms.indexOf(request.session.user.first_name + " " + request.session.user.last_name) > -1) {
                return true;
             }
             return false;
          });

          photos = photos.filter(function(phot) {
                var comments = phot.comments;
                for(var i = 0; i < comments.length; i++ ) {
                    var ctxt = comments[i].comment.toLowerCase();
                    if(ctxt.indexOf(text.toLowerCase()) !== -1) { return true; }
                }
                return false;
          });

          var photosClone = JSON.parse(JSON.stringify(photos));
          // For each photo add the comments to the photo
          async.each(photosClone, function (photo, callback_photo) {

            User.findOne({id: photo.user_id}, function(err,user) {
                photo.user = user;
            });

            // For each of the comments add the author's user info.
            async.each(photo.comments, function (comment, callback_comment) {
              User.findOne({id: comment.user_id}, function (err, user) {
                comment.user = user;
                callback_comment(err);
              });
            }, function (err) {
              // called when we are done adding the user info to each of the comments.
              if (err) {
                console.error('Doing /photosOfUser/id error on fetching user:', comment.user_id, err.trace);
              }
              callback_photo(err);
            });

          }, function (err) {
            // called when are done with updating each of the photo.
            if (err) {
              console.error('Doing /photosearch/ error:', err.trace);
              response.status(400).send(JSON.stringify(err));
              return;
            }
            response.end(JSON.stringify(photosClone));
          });

        });
    }
});

/*
 * Following code for project 6 received from TA.
 * URL /photosOfUser/:id - Return the Photos for User (id)
 */
app.get('/photosOfUser/:id', function (request, response) {
    if(request.session == undefined || request.session.user === null || request.session.user == undefined) {
        response.status(401).send("User is not logged in.");
    } else {
        // lookup all the photos of this user.
        Photo.find({user_id: request.params.id}, function (err, photos) {
          if (err) {
            console.error('Doing /photosOfUser/id error:', err);
            response.status(400).send(JSON.stringify(err));
            return;
          }

          // Only allow photos with visibility permissions.
          photos = photos.filter(function(phot) {
             if(phot.vis_perms == undefined) { return true; }
             if(phot.vis_perms.length < 1) { return true; }
             if(phot.vis_perms.length === 1 && phot.vis_perms[0].length === 0) { return true; }
             // Note: Must be == rather than === since the object types are different: 
             if(phot.user_id == request.session.user.id) { return true; }
             // Visibility list will be case sensitive. This is a design choice.
             if(phot.vis_perms.indexOf(request.session.user.first_name + " " + request.session.user.last_name) > -1) {
                return true;
             }
             return false;
          });

          photos.sort(function(a,b) {
             return b.likes.length - a.likes.length;
          })

          // Make a copy models so we can update them
          var photosClone = JSON.parse(JSON.stringify(photos));
          // For each photo add the comments to the photo
          async.each(photosClone, function (photo, callback_photo) {
            // For each of the comments add the author's user info.
            async.each(photo.comments, function (comment, callback_comment) {
              User.findOne({id: comment.user_id}, function (err, user) {
                comment.user = user;
                callback_comment(err);
              });
            }, function (err) {
              // called when we are done adding the user info to each of the comments.
              if (err) {
                console.error('Doing /photosOfUser/id error on fetching user:', comment.user_id, err.trace);
              }
              callback_photo(err);
            });
          }, function (err) {
            // called when are done with updating each of the photo.
            if (err) {
              console.error('Doing /photosOfUser/id error:', err.trace);
              response.status(400).send(JSON.stringify(err));
              return;
            }
            response.end(JSON.stringify(photosClone));
          });
        });
    }
});

app.post('/admin/login', function(request, response){
    var login_name = request.body.login_name;
    var pwd = request.body.password;

    var User = mongoose.model('User',SchemaInfo);
    User.findOne({login_name: login_name}, function (err, user) { 
        if(err != null) {
            response.status(400).send("An Error Occurred.")
        } else if(user == null) {
            response.status(400).send("Invalid User ID");
        } else if(pwd !== user.password) {
            response.status(400).send("Incorrect Password");            
        } else {
            request.session.user = user;
            response.status(200).send(user);
        }
    });
});


app.post('/user', function(request, response) {
    // Note: if an input is never filled, it appears as undefined, 
    // but it if is filled then deleted, it shows up as ""
    if(request.body.login_name == undefined || request.body.login_name === "") {
        response.status(400).send("login_name undefined");
        return;
    }

    if(request.body.password == undefined || request.body.password === "") {
        response.status(400).send("password undefined");
        return;
    }

    if(request.body.first_name == undefined || request.body.first_name === "") {
        response.status(400).send("first_name undefined");
        return;
    }

    if(request.body.last_name == undefined || request.body.last_name === "") {
        response.status(400).send("last_name undefined");
        return;
    }

    User.findOne({login_name: request.body.login_name}, function(err,user) {
        if(err) {
            response.status(400).send("Database Error");
            return;
        }
        if(user != undefined) {
            response.status(400).send("login_name exists");
            return;
        }

        User.create({
            login_name: request.body.login_name,
            password: request.body.password,
            first_name: request.body.first_name,
            last_name: request.body.last_name,
            location: request.body.location,
            occupation: request.body.occupation,
            description: request.body.description
        }, function(err, user) {
            if(err) {
                response.status(400).send("User create error");
                return;
            }
            user.id = user._id;
            user.save();
            request.session.user = user;
            console.log("User created with id: ", user.id);
            response.status(200).send(user);
        })
    })
});

app.get('/admin/logout', function(request, response) {
    request.session.destroy(function(err) {
        if(err) {
            response.status(401).send();
            return;
        }
        response.status(200).send();
        return;
    });
});

app.post('/commentsOfPhoto/:photo_id', function(request, response) {
    if(request.session == undefined || request.session.id === null) {
        response.status(401).send("User is not logged in.");
    } else if(request.body.comment == undefined || request.body.comment === null || request.body.comment.length < 1) {
        response.status(401).send("Comment empty");
    } else {
        // lookup all the photos of this user.
        var photoid = request.params.photo_id;
        Photo.findOne({_id: photoid}, function (err, photo) {
            if (err) {
              console.error('/commentsOfPhoto/:photoid error:', err);
              response.status(401).send("Photo Error");
              return;
            } else if(photo == null) {
              console.error('Invalid photo id');
              response.status(401).send('Invalid photo id');
            } else {
              photo.comments.push({comment: request.body.comment, user_id: request.session.user.id});
              photo.save();
              response.status(200).send("Upload successful");
            }
        });
    }
});


app.post('/deletePhoto/:photo_id', function(request, response) {
    if(request.session == undefined || request.session.id === null) {
        response.status(401).send("User is not logged in.");
        return;
    }

    var photoid = request.params.photo_id;

    Photo.findOne({_id: photoid}, function(err, photo) {
        if(err) {
            console.error('/like/:photoid error:', err);
            response.status(401).send("Like error");
            return;
        } else if (photo == null) {
            console.error('Invalid photo id');
            response.status(401).send('Invalid photo id');
        } else if(photo.user_id == request.session.user.id) {
            Photo.remove({_id: photoid}, function(err) {
                if(err){
                    response.status(401).send("An Error Occurred");
                    return;
                }
                response.status(200).send();
            });
        } else {
            console.error('Permission denied.');
            response.status(401).send('Permission Denied.');
        }
    });

});

app.post('/deleteComment/:photo_id', function(request, response) {
    if(request.session == undefined || request.session.id === null) {
        response.status(401).send("User is not logged in.");
        return;
    }

    var photoid = request.params.photo_id;
    var comment = request.body.comment;

    Photo.findOne({_id: photoid}, function(err, photo) {
        if(err) {
            console.error('/like/:photoid error:', err);
            response.status(401).send("Like error");
            return;
        } else if (photo == null) {
            console.error('Invalid photo id');
            response.status(401).send('Invalid photo id');
        } else if(comment.user_id == request.session.user.id) {
            var comments = photo.comments;
            comments = comments.filter(function(com) {
                if(com._id != comment._id) { return true; }
                return false;
            });
            photo.comments = comments;
            photo.save();
            response.status(200).send();
        } else {
            console.error('Permission denied.');
            response.status(401).send('Permission Denied.');
        }
    });

});

app.post('/like/:photo_id', function(request, response) {
    if(request.session == undefined || request.session.id === null) {
        response.status(401).send("User is not logged in.");
        return;
    }

    var photoid = request.params.photo_id;
    Photo.findOne({_id: photoid}, function(err,photo) {
        if(err) {
            console.error('/like/:photoid error:', err);
            response.status(401).send("Like error");
            return;
        } else if (photo == null) {
            console.error('Invalid photo id');
            response.status(401).send('Invalid photo id');
        } else {
            // Using the session user Id requires the user to log in and
            // ensures that requests from unregistered user ids are impossible.
            var userid = request.session.user.id;
            var i = photo.likes.indexOf(userid);
            if(i < 0) {
                photo.likes.push(userid);
            } else {
                photo.likes.splice(i,1);
            }
            photo.save();
            response.status(200).send("Success");
        }
    });
});

app.post("/delete/:id", function(request, response) {
    if(request.session == undefined || request.session.id === null) {
        response.status(401).send("User is not logged in.");
        return;
    }
    if(request.session.user.id !== request.params.id) {
        response.status(401).send("Permission Denied");
        return;
    }

    Photo.remove({user_id: request.params.id}, function(err) {
        if(err) {
            console.err(err);
            response.status(401).send("An Error Occurred");
            return;
        }
    });
    Photo.find({}, function (err, photos) {
          if (err) {
            console.error('Doing /delete/id error:', err);
            response.status(400).send(JSON.stringify(err));
            return;
          }
          for(var i = 0; i < photos.length; i++) {
            photos[i].comments = photos[i].comments.filter(function(com) {
                if(com.user_id == request.params.id) { 
                    console.log(com);
                    return false; 
                }
                return true;
            });
            photos[i].save();
          }
    });

    User.remove({id: request.params.id}, function(err) {
        if(err) {
            response.status(401).send("Error removing user");
            return;
        }
        request.session.destroy(function(err2) {
            if(err) {
                response.status(401).send();
                return;
            }
            response.status(200).send();
            return;
        });
    });

    
});

app.post('/photos/new', function(request,response) {
    processFormBody(request, response, function (err) {
        if (err || !request.file) {
            response.status(400).send("File Upload Error");
            return;
        }
        // request.file has the following properties of interest
        //      fieldname      - Should be 'uploadedphoto' since that is what we sent
        //      originalname:  - The name of the file the user uploaded
        //      mimetype:      - The mimetype of the image (e.g. 'image/jpeg',  'image/png')
        //      buffer:        - A node Buffer containing the contents of the file
        //      size:          - The size of the file in bytes

        // XXX - Do some validation here.
        // We need to create the file in the directory "images" under an unique name. We make
        // the original file name unique by adding a unique prefix with a timestamp.
        var timestamp = new Date().valueOf();
        var filename = 'U' +  String(timestamp) + request.file.originalname;

        fs.writeFile("./images/" + filename, request.file.buffer, function (err) {
          // XXX - Once you have the file written into your images directory under the name
          // filename you can create the Photo object in the database
          if(err != null) {
            response.status(400).send("File Write Error");
            return;
          }
          Photo.create({
            file_name: filename, 
            user_id: request.session.user.id,
            vis_perms: request.body.vis_perms.split(",") // split needed since request concatenates strings
        }, function(err, photo) {
            if(err != null) {
                response.status(400).send("Database Update Error");
                return;
            }
            photo.id = photo._id;
            photo.save();
            console.log("Photo created with _id: ", photo._id);
            response.status(200).send(photo);
          })
        });
    });
});


var server = app.listen(3000, function () {
    var port = server.address().port;
    console.log('Listening at http://localhost:' + port + ' exporting the directory ' + __dirname);
});


