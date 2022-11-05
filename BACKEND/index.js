require('dotenv').config();
const Koa = require('koa');
const KoaRouter = require('koa-router');
const bodyparser = require('koa-bodyparser')
const views = require('koa-views');
const nunjucks = require('nunjucks');
const mongoose = require('mongoose');
const override = require('koa-methodoverride');



nunjucks.configure('./views', {autoescape: true});

const port = 3200;
const app = new Koa();
const router = new KoaRouter();

// router.get('/',(ctx, next)=>{
//     return ctx.render('./index.html',{
//         name: process.env.name
//     })
// })

// router.get('/:name',(ctx, next)=>{
//     return ctx.render('./index.html',{
//         name: ctx.params.name
//     })
// })

const URL = process.env.URL;

mongoose.connect(URL, {
    useCreateIndex:true,
    useNewUrlParser:true,
    useUnifiedTopology:true,
    useFindAndModify:false
})

const connection = mongoose.connection;
connection.once("open",() =>{
    console.log("Mongodb Connection Success!");
})

const Blog = require('./model/blog.js');
const bodyParser = require('koa-bodyparser');

//get all records
router.get('/',(ctx,next) => {
    console.log("connected to root router");
    return Blog.find({},(error, results) => {
        console.log(results)
        ctx.render('index.html', {
            posts: results
        });
    });
});

//go to show page pasing id
router.get('/view/:id',(ctx,next) => {
    console.log("connected to root router");
    return Blog.findById(ctx.params.id,(error, results) => {
        console.log(results)
        ctx.render('Show.html', {
            post: results
        });
    });
});

//create route
router.get('/create',(ctx, next)=>{
    console.log('connected to create route');
    return ctx.render('create.html')
})
router.post('/create', (ctx, next) => {
    console.log('creating a post');
    console.log(ctx.request.body)
    if(ctx.request.body.pw === process.env.pw){
        Blog.create(ctx.request.body, (err,result)=>{
            console.log(result);
        })
    }else{
        console.log('wrong password');
    }
    return ctx.render('complete.html')
})

//admin page
router.get('/admin',(ctx,next) => {
    console.log("connected to root router");
    return Blog.find({},(error, results) => {
        console.log(results)
        ctx.render('admin.html', {
            posts: results
        });
    });
});

//edit route
router.get('/edit/:id',(ctx,next) => {
    console.log("connected to edit router");
    return Blog.findById(ctx.params.id,(error, results) => {
        console.log(results)
        ctx.render('edit.html', {
            post: results
        });
    });
});

router.put('/edit/:id',(ctx,next) => {
    console.log("edithing a post");
    console.log(ctx.request.body)
    if(ctx.request.body.pw === process.env.pw){
        Blog.findByIdAndUpdate(ctx.params.id, ctx.request.body,ctx.request.author, (err, results)=>{
            console.log(results);
        })
    }else{
        console.log('wrong password')
    }
    return ctx.render('complete.html')
});


//delete function
router.delete('/delete/:id',(ctx,next) => {
    console.log("connected to delete router");
    console.log(ctx.request.body)
    if(ctx.request.body.pw === process.env.pw){
        Blog.findByIdAndRemove(ctx.params.id,(err, result)=>{
        })
    }else{
        console.log('wrong password')
    }
    return ctx.render('complete.html')
});


// router.get('',ctx => ctx.body="Welcome to Koa");

app.use(override('_method'));

app.use(bodyParser());

app.use(views('./views', {map : {html: 'nunjucks'}}));

app.use(router.routes()).use(router.allowedMethods());

app.listen(port,()=> console.log("Server Running"));

