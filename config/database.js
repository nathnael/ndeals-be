const mongoose = require('mongoose');

const connectDatabase = () => {
    mongoose.connect(process.env.DB_LOCAL_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        autoIndex: true
    }).then(con => {
        console.log(`MongoDB database connected with HOST: ${con.connection.host}`)
    })
}

module.exports = connectDatabase;