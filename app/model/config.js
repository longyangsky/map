

module.exports = app => {
    const mongoose = app.mongoose;
    const Schema = mongoose.Schema; 
    const configSchema = new Schema({   //数据同步时间
        type:{type:String,required:true},
        update_at:{type:Date,required:true} //资源最后同步时间
    });  
     
    return mongoose.model('task', configSchema);
  }