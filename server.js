const express = require("express");
const app = express();
const path = require("path");
const session = require("express-session");
const cookieParser = require("cookie-parser");
app.use(cookieParser());
let oneDay = 1000 * 60 * 60 * 24;
app.use(session({
    secret: "SD^&8w8hdud9w9",
    saveUninitialized: true,
    resave: false,
    cookie: { maxAge: oneDay }
}))
app.use(express.urlencoded());

const client = require("mongodb").MongoClient;
let dbinstance;
client.connect("mongodb+srv://mrinal2002:Password123@cluster0.q62i6dy.mongodb.net/?retryWrites=true&w=majority").then((data) => {
    dbinstance = data.db("CRUD");
})

//app.use(express.static("public"));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
    res.redirect("/login");
})
app.get("/login", (req, res) => {
    res.render("login", { message: "" });
})

app.post("/login", (req, res) => {
    dbinstance.collection("allDetails").findOne({ $and: [{ "name": req.body.name }, { "userid": req.body.userid }] }).then((response) => {
        if (response == null) {
            res.render("login", { message: "username and password is incorrect" });
        }
        else {
            req.session.name = response.name;
            req.session.userid = response.userid;
            res.redirect("/dashboard");
        }
    })
})

app.get("/dashboard", (req, res) => {
    if (req.session.name && req.session.userid) {
        res.render("dashboard", { dashboardmessage: "" });
    }
    else {
        res.render("login", { message: "please login first" });
    }
})

app.get("/showData", (req, res) => {
    if (req.session.name && req.session.userid) {
        dbinstance.collection("allDetails").find({ /*"userid": req.session.userid*/ }).toArray().then((response) => {
            res.render("read", { Data: response });
        })
    }
    else {
        res.render("login", { message: "Dont try without login bro" });
    }
})

app.get("/insert", (req, res) => {
    if (req.session.name && req.session.userid) {
        res.render("create", { insertmessage: "" });
    }
    else {
        res.render("login", { message: "please login karlo yarr!!" });
    }
})

app.post("/insert", (req, res) => {
    dbinstance.collection("allDetails").findOne({ $and: [{ "name": req.body.name }, { "userid": req.body.userid }] }).then((response) => {
        if (response == null) {
            let obj = { "name": req.body.name, "userid": req.body.userid, "dept": req.body.dept, "occupation": req.body.occupation };
            dbinstance.collection("allDetails").insertOne(obj).then((result) => {
                console.log(result);
                res.render("create", { insertmessage: "insert success!!" });
            })
        }
        else {
            res.render("create", { insertmessage: "please insert unique data which is not your database" });
        }
    })

})

app.get("/update", (req, res) => {
    res.render("update", { updatemessage: "" });
})

app.post("/update", (req, res) => {
    if(req.session.name && req.session.userid){
        dbinstance.collection("allDetails").findOne({ $and: [{ "name": req.body.name }, { "userid": req.body.userid }] }).then((response) => {
            if (response == null) {
                dbinstance.collection("allDetails").updateOne({ "name": req.session.name }, { $set: { "name": req.body.name } }).then((result) => {
                    console.log(result);
                })
                dbinstance.collection("allDetails").updateOne({ "userid": req.session.userid }, { $set: { "userid": req.body.userid } }).then((result2) => {
                    console.log(result2);
                    res.render("update", { updatemessage: "updatae succssfull u can see your updated data in show data section" });
                })
            }
            else {
                res.render("update", { updatemessage: "please provide unique data to update" });
            }
        })
    }
    else{
        res.render("login",{message:"login tho karle pahle"});
    }
    
})

app.get("/delete", (req, res) => {
    if (req.session.name && req.session.userid) {
        dbinstance.collection("allDetails").deleteOne({ "userid": req.session.userid }).then((result) => {
            console.log("one collection deleted");
            res.render("delete", { deletemessage: "data delete success!" })
        })
    }
    else{
        res.render("login",{message:"please login first!!!"});
    }

})

app.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/login");
})



app.listen(3000, (err) => {
    console.log("server started at 3000");
})