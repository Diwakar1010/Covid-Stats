const express = require('express')
const app = express()
const bodyParser = require("body-parser");
const port = 8080 || process.env.PORT

// Parse JSON bodies (as sent by API clients)
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
const { connection } = require('./connector')

app.get("/totalRecovered", async (req,res)=>{
    const info = await connection.find()
    // console.log(info[0].recovered)
    let total = 0
    for(let i=0;i<info.length;i++){
        total = total + info[i].recovered 
    }
    console.log(total)
    res.json({
        data:{
            _id:"total",
            recovered:total
        }
    })
})

app.get("/totalActive", async (req,res)=>{

    const info = await connection.find()
    // console.log(info[0].recovered)
    let total = 0
    for(let i=0;i<info.length;i++){
        total = total + info[i].infected - info[i].recovered 
    }
    // console.log(total)
    res.json({
        data:{
            _id:"total",
            active:total
        }
    })
})

app.get("/totalDeath", async (req,res)=>{

    const info = await connection.find()
    // console.log(info[0].recovered)
    let total = 0
    for(let i=0;i<info.length;i++){
        total = total + info[i].death
    }
    console.log(total)
    res.json({
        data:{
            _id:"total",
            death:total
        }
    })
})

app.get("/hotspotStates", async (req,res)=>{
 
    const dat = await connection.aggregate([
        { $project: { state : "$state", rate: { $round: [ {$divide:[{$subtract:["$infected","$recovered"]},"$infected"]}, 5 ] } } }
    ])
    let data=[]
    for(let i=0;i<dat.length;i++){
        if(dat[i].rate > 0.1){
            data.push(dat[i])
        }
    }
    // console.log(data);
    res.json({
        data
    })
})
app.get("/healthyStates", async (req,res)=>{

    const dat = await connection.aggregate([
        { $project: { state : "$state", mortality: { $round: [ {$divide:["$death","$infected"]}, 5 ] } } }
    ])
    let data=[]
    for(let i=0;i<dat.length;i++){
        if(dat[i].mortality < 0.005){
            data.push(dat[i])
        }
    }
    // console.log(data);
    res.json({
        data
    })
})

app.listen(port, () => console.log(`App listening on port ${port}!`))

module.exports = app;