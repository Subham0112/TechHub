const mongoose=require('mongoose');
const Schema=mongoose.Schema;

const productSchema=new Schema({
    name:{
        type:String,
        required:true,
    },
    price:{
        type:Number,
        required:true,
        min:0,
    },
    description:{
        type:String,
        required:true,
    },
    slug:{
        type:String,
        index:true,
        required:true,
    },
    image:{
        type:String,
        default:""
    },
    category:{
        type:String,
        required:true,
        enum:['mobile-accessories','gadgets'],
        default:'mobile-accessories'
    },
    type:{
        type:String,
        required:true,
    },
    stock:{
        type:Number,
        required:true,
        min:0,
    }
},{timestamps:true});

module.exports=mongoose.model('Product',productSchema);