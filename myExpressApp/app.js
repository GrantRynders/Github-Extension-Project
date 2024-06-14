var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const cors = require('cors');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors({ origin: '*' }));
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.post("/user/:username", (req, res) => {
  const user = prisma.user.create({
    data: 
    {
      UserName: req.params.username,
    },
    })
    //res = "User with username: " + req.params.username + " created";
});
app.post("/issue/:url/:issuename", (req, res) => {
  const issue = prisma.issue.create({
    data: 
    {
      url: req.params.url,
      issueName: req.params.issuename,
    },
    })
});
app.post("/timer/:username/:issueUrl", (req, res) => {
  const user = prisma.user.findUnique({
    where: {
      UserName: req.params.username,
    },
  })
  const issue = prisma.user.findUnique({
    where: {
      url: req.params.issueUrl,
    },
  })
  const timer = prisma.timer.create({
    data: 
    {
      userId: user.id,
      issueId: issue.id,
    },
    })
});
app.post("/timerPeriod/:startdate/:enddate", async (req, res) => {
  const timerPeriod = prisma.timerPeriod.create({
    data: 
    {
      startDate: req.params.stardate,
      endDate: req.params.enddate,
    },
    })
});
app.put("/timerPeriod/:username/:issueUrl/:startdate/:enddate", (req, res) => {
  const user = prisma.user.findUnique({
    where: {
      UserName: req.params.username,
    },
  })
  const issue = prisma.user.findUnique({
    where: {
      url: req.params.issueUrl,
    },
  })
  const timer = prisma.timer.findUnique({
    where: {
      userId: user.id,
      issueId: issue.id,
    },
  })
  const newTimerPeriod = prisma.timerPeriod.create({
    data: {
      timerId: timer.id,
      startDate: startdate,
      endDate: enddate,
    },
  })
});
//GENERAL ENDPOINTS
app.get("/user", (req, res) => {
  //res.setHeader('content-type', 'application/json');
  const returnedUsers = prisma.user.findMany();
  console.log("it's happening");
  res.json(returnedUsers);
});
app.get("/issue", (req, res) => {
  const returnedIssues = prisma.issue.findMany();
  res.json(returnedIssues);
});
app.get("/timer", (req, res) => {
  const returnedTimers = prisma.timer.findMany();
  res.json(returnedTimers);
});
app.get("/timerPeriod", (req, res) => {
  const returnedTimerPeriods = prisma.timerPeriod.findMany();
  res.json(returnedTimerPeriods);
});
//SPECIFIC ENDPOINTS
app.get("/user/:username", (req, res) => {
  const user = prisma.user.findUnique({
    where: {
      UserName: req.params.username,
    },
  })
  res.json(user);
});
app.get("/timer/user/:username", (req, res) => {
  const user = prisma.user.findUnique({
    where: {
      UserName: req.params.username,
    },
    include: {
      timers: true,
    },
  })
  res.json(user);
});
app.get("/timer/:username/:url", (req, res) => {
  const user = prisma.user.findUnique({
    where: {
      UserName: req.params.username,
    },
  })
  const issue = prisma.user.findUnique({
    where: {
      url: req.params.issueUrl,
    },
  })
  const timer = prisma.timer.findUnique({
    where: {
      userId: user.id,
      issueId: issue.id,
    },
  })
  res.json(timer);
});






app.listen(5220, () => console.log('Server running on port ${5220}'));



async function main() {
  const allUsers = await prisma.user.findMany()
  console.log(allUsers)
}


main().then(async () => {
    await prisma.$disconnect()
  }).catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  });


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;


