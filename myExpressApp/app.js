var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const cors = require('cors');
var indexRouter = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views/scripts')));
app.use(express.static(path.join(__dirname, 'views/stylesheets')));
app.use(cors({ origin: '*' }));
app.use('/', indexRouter);

app.get("/views/usermodel/user/:id", async (req, res) => {
  const user = await prisma.user.findFirst({
    where: {
      id: Number(req.params.id),
    },
  });
  res.render('user', { id: req.params.id, username: user.UserName });
});
app.get("/views/timermodel/timer/:id", async (req, res) => {
  const timer = await prisma.timer.findFirst({
    where: {
      id: Number(req.params.id),
    },
  });
  res.render('timer', { id: req.params.id, issueId: timer.issueId, userId: timer.userId });
});
app.get("/views/timerperiodmodel/timerperiod/:id", async (req, res) => {
  const timerperiod = await prisma.timerperiod.findFirst({
    where: {
      id: Number(req.params.id),
    },
  });
  res.render('timerperiod', { id: req.params.id, startDate: timerperiod.startDate, endDate: timerperiod.endDate, timerId: timerperiod.timerId });
});
app.get("/views/issuemodel/issue/:id", async (req, res) => {
  const issue = await prisma.issue.findFirst({
    where: {
      id: Number(req.params.id),
    },
  });
  res.render('issue', { id: req.params.id, issueUrl: issue.url, issueName: issue.issueName });
});


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
      });
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
    });
  }
  
});
app.post("/timer/:username/:issueUrl/:issueName", async (req, res) => {
  const user = await prisma.user.findUnique({
    where: {
      UserName: req.params.username,
    },
  });
  const issue = await prisma.issue.findFirst({
    where: {
      url: req.params.issueUrl,
      issueName: req.params.issueName,
    },
  });
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
  });
  const issue = await prisma.issue.findFirst({
    where: {
      url: req.params.issueUrl,
      issueName: req.params.issueName,
    },
  });
  const timer = await prisma.timer.findFirst({
    where: {
      userId: user.id,
      issueId: issue.id,
    },
  });
  console.log(timer);
  const newTimerPeriod = await prisma.timerPeriod.create({
    data: {
      timerId: timer.id,
      startDate: req.params.startdate,
      endDate: req.params.enddate,
      totalTimeElapsed: Number(req.params.time),
    },
  });
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
app.get("/issue/:issueId", async (req, res) => {
  const returnissue = await prisma.issue.findFirst({
    where: {
      id: Number(req.params.issueId),
    },
  })
  res.json(returnissue);
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
  });
  const issue = await prisma.issue.findUnique({
    where: {
      url: req.params.issueUrl,
      issueName: req.params.issueName,
    },
  });
  const timer = await prisma.timer.findUnique({
    where: {
      userId: user.id,
      issueId: issue.id,
    },
  });
  res.json(timer);
  });
app.get("/timermodel/timerperiod", async (req, res) => {
  var timersWithPeriods = await prisma.$queryRaw`SELECT TimerPeriod.id, TimerPeriod.totalTimeElapsed, TimerPeriod.timerId FROM Timer INNER JOIN TimerPeriod ON Timer.id = TimerPeriod.timerId;`;
  res.json(timersWithPeriods);
});



app.get("/usermodel/:id/timespent", async (req, res) => {//Net amount of time spent by the user using our timer extension
  
  var userTimeSpentArray = await prisma.$queryRaw`SELECT TimerPeriod.id, TimerPeriod.totalTimeElapsed, TimerPeriod.timerId FROM ((Timer INNER JOIN User ON Timer.userId = User.id) INNER JOIN TimerPeriod ON Timer.id = TimerPeriod.timerId) WHERE User.id = ${req.params.id};`;
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
app.get("/usermodel/:id/issues", async (req, res) => { //Every tracked issue a user has worked on
  var userIssues = await prisma.$queryRaw`SELECT Issue.id, Issue.issueName, Issue.url FROM ((Timer INNER JOIN User ON Timer.userId = User.id) INNER JOIN Issue ON Timer.issueId = Issue.id) WHERE User.id = ${req.params.id};`;
  console.log(userIssues);
  res.json(userIssues);
});
app.get("/issuemodel/:id/timespent", async (req, res) => { //total amount of time spent on an issue by all users
  var issueTimeSpentArray = await prisma.$queryRaw`SELECT TimerPeriod.id, TimerPeriod.totalTimeElapsed, Issue.Id FROM ((Timer INNER JOIN Issue ON Timer.issueId = Issue.id) INNER JOIN TimerPeriod ON Timer.id = TimerPeriod.timerId) WHERE Issue.id = ${req.params.id};`;
  var issueTimeSpent = 0;
  for (var j = 0; j < issueTimeSpentArray.length; j++) 
  {
    console.log(issueTimeSpentArray[j]);
    issueTimeSpent += Number(issueTimeSpentArray[j].totalTimeElapsed);
  }
  res.json({
    'totaltimespent': issueTimeSpent,
  });
});
app.get("/issuemodel/:issueId/users", async (req, res) => { //users related to an issue
  var usersForIssue = await prisma.$queryRaw`SELECT User.id, User.UserName FROM ((Timer INNER JOIN Issue ON Timer.issueId = Issue.id) INNER JOIN User ON Timer.userId = User.id) WHERE Issue.id = ${req.params.issueId};`;
  res.json(usersForIssue);
});
app.get("/issuemodel/:issueId/:userId/timespentbyuser", async (req, res) => { //total amount of time spent on an issue by all users
  var issueTimeSpentArray = await prisma.$queryRaw`SELECT TimerPeriod.id, TimerPeriod.totalTimeElapsed, Issue.issueName, User.UserName FROM (((Timer INNER JOIN Issue ON Timer.issueId = Issue.id) INNER JOIN TimerPeriod ON Timer.id = TimerPeriod.timerId) INNER JOIN User ON Timer.userId = User.id) WHERE Issue.id = ${req.params.issueId} AND User.id = ${req.params.userId};`;
  res.json(issueTimeSpentArray);
});
app.get("/timermodel/:id/timerperiods", async (req, res) => { //returns all timerperiods for a given timer
  var timerPeriods = await prisma.$queryRaw`SELECT TimerPeriod.id, TimerPeriod.totalTimeElapsed, TimerPeriod.startDate, TimerPeriod.endDate, TimerPeriod.TimerId FROM Timer INNER JOIN TimerPeriod ON Timer.id = TimerPeriod.timerId WHERE Timer.id = ${req.params.id};`;
  res.json(timerPeriods);
});
app.get("/timerperiodmodel/endtimes", async (req, res) => { //returns the end dates in milliseconds of all time periods
  var timerPeriods = await prisma.$queryRaw`SELECT TimerPeriod.endDate AS stopTime, TimerPeriod.TimerId, User.UserName, TimerPeriod.totalTimeElapsed FROM ((Timer INNER JOIN TimerPeriod ON Timer.id = TimerPeriod.timerId) INNER JOIN User ON Timer.UserId = User.id)`;
  timerPeriods.stopTime = new Date(timerPeriods.stopTime).getTime();
  res.json(timerPeriods);
});

//MODEL MAIN PAGES
app.get('^/$|/test(.html)?', (req, res) => {
  //res.sendFile('./views/index.html', { root: __dirname });
  res.sendFile(path.join(__dirname, 'views', 'test.html'));
});
app.get('^/$|/main(.html)?', (req, res) => {
  //res.sendFile('./views/index.html', { root: __dirname });
  res.sendFile(path.join(__dirname, 'views', 'main.html'));
});
app.get('^/$|/views/users(.html)?', (req, res) => {
  //res.sendFile('./views/index.html', { root: __dirname });
  res.sendFile(path.join(__dirname, 'views', 'users.html'));
});
app.get('^/$|/views/issues(.html)?', (req, res) => {
  //res.sendFile('./views/index.html', { root: __dirname });
  res.sendFile(path.join(__dirname, 'views', 'issues.html'));
});
app.get('^/$|/views/timers(.html)?', (req, res) => {
  //res.sendFile('./views/index.html', { root: __dirname });
  res.sendFile(path.join(__dirname, 'views', 'timers.html'));
});
app.get('^/$|/views/timerperiods(.html)?', (req, res) => {
  //res.sendFile('./views/index.html', { root: __dirname });
  res.sendFile(path.join(__dirname, 'views', 'timerperiods.html'));
});
//MODEL INSTANCE PAGES
app.get('^/$|/timermodel(.html)?', (req, res) => {
  res.sendFile('./views/objectmodels/timer.html', { root: __dirname });
  //res.sendFile(path.join(__dirname, 'views', 'timerperiods.html'));
});
app.get('^/$|/usermodel(.html)?', (req, res) => {
  res.sendFile('./views/objectmodels/user.html', { root: __dirname });
  //res.sendFile(path.join(__dirname, 'views', 'timerperiods.html'));
});
app.get('^/$|/issuemodel(.html)?', (req, res) => {
  res.sendFile('./views/objectmodels/issue.html', { root: __dirname });
  //res.sendFile(path.join(__dirname, 'views', 'timerperiods.html'));
});
app.get('^/$|/timerperiodmodel(.html)?', (req, res) => {
  res.sendFile('./views/objectmodels/timerperiod.html', { root: __dirname });
  //res.sendFile(path.join(__dirname, 'views', 'timerperiods.html'));
});
app.get('^/$|/users(.js)?', (req, res) => {
  res.sendFile('./views/objectmodels/scripts/users.js', { root: __dirname });
  //res.sendFile(path.join(__dirname, 'views', 'timerperiods.html'));
});
app.get('^/$|/app(.css)?', (req, res) => {
  res.sendFile('app.css', { root: './views/stylesheet' });
  //res.sendFile(path.join(__dirname, 'views', 'timerperiods.html'));
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