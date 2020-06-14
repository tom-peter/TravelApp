const serverapp = require('./serverapp');
const app = serverapp.app;

// Setup Server
const port = 9090;
app.listen(port, () => {
   console.log(`Server is running on port ${port}`);
});

