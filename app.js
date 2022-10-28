const express = require("express")
const bodyParser = require("body-parser");
const mongoose =require("mongoose")
const _ =require("lodash")


const app = new  express()
app.use(express.static("public"))
app.use(bodyParser.urlencoded({extended : true}));
app.set('view engine','ejs')

mongoose.connect("mongodb+srv://note-app-oct-2022:QJwOOuGzavU5OjPP@cluster0.fsiyxoa.mongodb.net/todolist")

const ItemSchema = {
    name:"String"
}
const ListSchema ={
    name : String,
    items : [ItemSchema]
}
const List = mongoose.model("List",ListSchema)

const Item =mongoose.model("Item",ItemSchema)

const item1 =new Item({
    name:"Welcome to to do list."
})
const item2 =new Item({
    name:"Hit the + to add new item."
})
const item3 =new Item({
    name:"<-- Hit this button to delete the item."
})
const items =[]
items.push(item1);
items.push(item2);
items.push(item3)

app.get("/",function (req,res) {
    Item.find({},(err,foundItems)=>{
        if(foundItems.length===0){
            Item.insertMany(items,(err)=>{
                if(err){
                    console.log(err);
                }else{
                    console.log("sucess");
                }
            });
            res.redirect("/");
        }else{
            res.render("list",{listTitle:"Today",newListItem:foundItems})
        }
    })
    
});
app.get("/:name",(req,res)=>{
    const customName=_.capitalize(req.params.name)
    List.findOne({name:customName},(err,foundItem)=>{
        if(!foundItem){
            const newList = new List({
                name:customName,
                items: items
            })
            newList.save();
            res.redirect("/"+customName)
        }
        else{
            res.render("list",{
                listTitle:foundItem.name,
                newListItem:foundItem.items
            })
        }
    })
})

app.get("about",(req,res)=>{
    res.render("about")
})
app.post("/",function(req,res){
    const itemName=req.body.listItem;
    const listName =req.body.list;
    const getItem = new Item({
        name: itemName
    })
    if(listName==="Today"){
        getItem.save();
        res.redirect("/");
    }else{
        List.findOne({name:listName},(err,foundList)=>{
            foundList.items.push(getItem)
            foundList.save();
            
        })
        res.redirect("/"+listName)
    }  
})


app.post("/delete",(req,res)=>{
    const del = req.body.checkBox
    const listName=req.body.listName

    if(listName==="Today"){
        Item.findByIdAndRemove(del,(err)=>{
            if(err){
                res.send(err);
            }else{
                res.redirect("/")
            }
        })
    }else{
        //first parameter is list name or or record in list table 
        //second parameter update the records with specified condition
        //here nesting occors due to normalization of items table in list
        List.findOneAndUpdate({name:listName},{$pull:{items :{_id:del}}},(err,foundList)=>{
            if(err){
                console.log(err)
            }else{
                res.redirect("/"+listName)
            }  
        })
    }
})


app.listen(process.env.PORT||3000,()=>{
    console.log("Hello rishav i am working")
})