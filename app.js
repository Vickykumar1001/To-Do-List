const express=require("express");
const bodyParser=require("body-parser");
const date=require(__dirname+"/date.js");
const _ = require("lodash");
const mongoose = require("mongoose");
mongoose.set('strictQuery',false);
mongoose.connect("mongodb://localhost:27017/todoDB" ,{useNewUrlParser: true,useUnifiedTopology: true,family: 4,});

const app=express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set("view engine","ejs");
day=date.getDate();

const itemsSchema = new mongoose.Schema({
    name : String
});
const Item = mongoose.model("Item" , itemsSchema);

const item1 = new Item ({
    name : "Welcome to your TodoList"
});
const item2 = new Item ({
    name : "Hit the + button to add a new item"
});
const item3 = new Item ({
    name : "<-- Hit this to delete an item"
});
const defaultItems = [item1 , item2 , item3];
const listSchema = new mongoose.Schema({
    name : String,
    items: [itemsSchema]
});
const List =  mongoose.model("List",listSchema);

app.get("/",function(req , res){
    Item.find({},function(err,items){
        if(items.length === 0){
            Item.insertMany(defaultItems , function(err){
                if(err){
                    console.log(err);
                } 
            });
            res.redirect("/");
        } else{
            List.find({},function(err,customLists){
                res.render("list",{ListTitle: day, newListItems: items, newCustomList:customLists});
            })
        
        }
    });
});

app.get("/:customListName", function(req,res){
    const customListName = _.capitalize(req.params.customListName);
    List.findOne({name : customListName}, function(err,foundList){
        if(!err){
            if(!foundList){
                //Creating new list
                const list = new List({
                    name : customListName,
                    items : defaultItems
                });
                list.save();
                res.redirect("/"+customListName);
            } else{
                // Reading new list
                List.find({},function(err,customLists){
                res.render("list",{ListTitle: foundList.name , newListItems: foundList.items , newCustomList:customLists});
                });
            }
        }
    });
});
app.post("/",function(req,res){
    const itemName = req.body.newItem;
    const listName = req.body.list;
    const item = new Item({
        name : itemName
    });
    if(listName === day){
         item.save();
         res.redirect("/");
    } else{
        List.findOne({name: listName},function(err, foundList){
            if(!err){
                foundList.items.push(item);
                foundList.save();
                res.redirect("/"+ listName)
            }
        });
    }
});
app.post("/delete",function(req,res){
    const id = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === day){
        Item.findByIdAndRemove(id, function(err){
            if(err){
                console.log(err);
            } 
            res.redirect("/");
        });
    } else{
        List.findOneAndUpdate({name: listName},{$pull:{items:{_id: id }}},function(err, foundList){
                if(err){
                    console.log(err);
                }
                res.redirect("/"+listName);
        });
    }
    
});
app.post("/addList",function(req,res){
    const customListName = _.capitalize(req.body.newList);
    List.findOne({name : customListName}, function(err,foundList){
        if(!err){
            if(!foundList){
                //Creating new list
                const list = new List({
                    name : customListName,
                    items : defaultItems
                });
                list.save();
                res.redirect("/"+customListName);
            }
        }
    });
});
app.post("/deleteList", function(req,res){
    const id=req.body.list_id;
    const name=req.body.list_name;
    List.findByIdAndRemove(id, function(err){
        if(err){
            console.log(err);
        }
        res.redirect("/");
    });
})
// const port = process.env.PORT || 3000;
app.listen(3000,function(){
    console.log("Server is running on port 3000");
})
