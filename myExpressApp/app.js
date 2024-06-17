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
app.post("/user/:username", async (req, res) => {
  if (await prisma.user.findUnique({
    where: {
      UserName: req.params.username,
    },
  }) == null)
  {
    const user = await prisma.user.create({
      data: 
      {
        UserName: req.params.username,
      },
      })
  }
});
app.post("/issue/:url/:issuename", async (req, res) => {
  if (await prisma.issue.findUnique({
    where: {
      url: req.params.url,
    },
  }) == null)
  {
    const issue = await prisma.issue.create({
    data: 
    {
      url: req.params.url,
      issueName: req.params.issuename,
    },
    })
  }
  
});
app.post("/timer/:username/:issueUrl/:issueName", async (req, res) => {
  const user = await prisma.user.findUnique({
    where: {
      UserName: req.params.username,
    },
  })
  const issue = await prisma.issue.findFirst({
    where: {
      url: req.params.issueUrl,
      issueName: req.params.issueName,
    },
  })
  if (await prisma.timer.findFirst({
    where: {
      userId: user.id,
      issueId: issue.id,
    },
  }) == null)
  {
    const timer = await prisma.timer.create({
      data: 
      {
        userId: user.id,
        issueId: issue.id,
      },
      })
      console.log(timer);
  }
});
app.post("/timerPeriod/:username/:issueUrl/:issueName/:startdate/:enddate/:time", async (req, res) => {
  const user = await prisma.user.findUnique({
    where: {
      UserName: req.params.username,
    },
  })
  const issue = await prisma.issue.findFirst({
    where: {
      url: req.params.issueUrl,
      issueName: req.params.issueName,
    },
  })
  const timer = await prisma.timer.findFirst({
    where: {
      userId: user.id,
      issueId: issue.id,
    },
  })
  console.log(timer);
  const newTimerPeriod = await prisma.timerPeriod.create({
    data: {
      timerId: timer.id,
      startDate: req.params.startdate,
      endDate: req.params.enddate,
      totalTimeElapsed: Number(req.params.time),
    },
  })
  console.log(newTimerPeriod);
});
//GENERAL ENDPOINTS
app.get("/user", async (req, res) => {
  const returnedUsers = await prisma.user.findMany();
  console.log(returnedUsers);
  res.json(returnedUsers);
});
app.get("/issue", async (req, res) => {
  const returnedIssues = await prisma.issue.findMany();
  res.json(returnedIssues);
});
app.get("/timer", async (req, res) => {
  const returnedTimers = await prisma.timer.findMany();
  res.json(returnedTimers);
});
app.get("/timerPeriod", async (req, res) => {
  const returnedTimerPeriods = await prisma.timerPeriod.findMany();
  res.json(returnedTimerPeriods);
});
//SPECIFIC ENDPOINTS
app.get("/user/:username", async (req, res) => {
  const user = await prisma.user.findUnique({
    where: {
      UserName: req.params.username,
    },
  })
  res.json(user);
});
app.get("/issueGet/:issueUrl/:issueName", async (req, res) => {
  const issue = await prisma.issue.findUnique({
    where: {
      url: req.params.issueUrl,
      issueName: req.params.issueName,
    },
  })
  res.json(issue);
});
app.get("/timer/:userName/:issueUrl/:issueName", async (req, res) => {
  const user = await prisma.user.findUnique({
    where: {
      UserName: req.params.userName,
    },
  })
  const issue = await prisma.issue.findUnique({
    where: {
      url: req.params.issueUrl,
      issueName: req.params.issueName,
    },
  })
  const timer = await prisma.timer.findFirst({
    where: {
      userId: user.id,
      issueId: issue.id,
    },
  })
  res.json(timer);
});
app.get("/timer/user/:username", async (req, res) => {
  const user = await prisma.user.findUnique({
    where: {
      UserName: req.params.username,
    },
    include: {
      timers: true,
    },
  })
  res.json(user);
});
app.get("/timer/:username/:url/:issuename", async (req, res) => {
  const user = await prisma.user.findUnique({
    where: {
      UserName: req.params.username,
    },
  })
  const issue = await prisma.issue.findUnique({
    where: {
      url: req.params.issueUrl,
      issueName: req.params.issueName,
    },
  })
  const timer = await prisma.timer.findUnique({
    where: {
      userId: user.id,
      issueId: issue.id,
    },
  })
  res.json(timer);
});
app.get("/usermodel/:id/timespent", async (req, res) => {
  
  var userTimeSpentArray = await prisma.$queryRaw`SELECT TimerPeriod.id, TimerPeriod.totalTimeElapsed, TimerPeriod.timerId FROM ((Timer INNER JOIN User ON Timer.id = User.id) INNER JOIN TimerPeriod ON Timer.id = TimerPeriod.timerId) WHERE User.id = ${req.params.id};`;
  var userTimeSpent = 0;
  for (var j = 0; j < userTimeSpentArray.length; j++) 
  {
    console.log(userTimeSpentArray[j]);
    userTimeSpent += Number(userTimeSpentArray[j].totalTimeElapsed);
  }
res.json({
  'totaltimespent': userTimeSpent,
});
});
app.get("/usermodel/:id/issues", async (req, res) => {
  var userIssues = await prisma.$queryRaw`SELECT Issue.id, Issue.issueName, Issue.url FROM ((Timer INNER JOIN User ON Timer.id = User.id) INNER JOIN Issue ON Timer.id = User.id) WHERE User.id = ${req.params.id};`;
  console.log(userIssues);
  res.json(userIssues);
});





app.listen(5220, () => console.log('Server running on port ${5220}'));



async function main() {
  const allUsers = await prisma.user.findMany();
  const allIssues = await prisma.issue.findMany();
  const allTimers = await prisma.timer.findMany();
  const allTimerPeriods = await prisma.timerPeriod.findMany();
  console.log(allUsers);
  console.log(allIssues);
  console.log(allTimers);
  console.log(allTimerPeriods);
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


//npx prisma studio