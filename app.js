const express = require('express');
const app = express();
const path = require('path');
const port = 3000;
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/task');

const connectDB = require('./models/db');
connectDB();

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));



app.use('/auth', authRoutes);

app.use('/tasks', taskRoutes);


app.listen(port, ()=>{
    console.log(`Server is running on port ${port}`);
})
