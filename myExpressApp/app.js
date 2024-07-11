var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const cors = require('cors');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use('/favicon.ico', express.static('./favicon.ico'));
app.use('/style.css', express.static('./views/style.css'));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors({ origin: '*' }));
app.get("/awake", async (req, res) => {
  res.json({
    awake: "true",
  });
});
app.get("/views/usermodel/user/:id", async (req, res) => {
  const user = await prisma.user.findFirst({
    where: {
      id: Number(req.params.id),
    },
  });
  const timeElapsedResponse = await fetch("http://localhost:5220/usermodel/" + req.params.id + "/timespent");
  const timeElapsedJson = await timeElapsedResponse.json();
  const timeElapsed = timeElapsedJson.totaltimespent;
  const issuesResponse = await fetch("http://localhost:5220/usermodel/" + req.params.id + "/issues");
  const issues = await issuesResponse.json();
  const formattedTimes = await ConvertSeconds(timeElapsed);
  if (user != null)
  {
    res.render('user', { title: "User Record: " + req.params.id, id: req.params.id, username: user.UserName , TotalTimeElapsed: timeElapsed, issues: issues, formattedTimes: formattedTimes});
  }
});
app.get("/views/timermodel/timer/:id", async (req, res) => {
  const timer = await prisma.timer.findFirst({
    where: {
      id: Number(req.params.id),
    },
  });
  const timerPeriodsResponse = await fetch("http://localhost:5220/timermodel/" + req.params.id + "/timerperiods")
  const timerPeriods = await timerPeriodsResponse.json();
  const totalTimeResponse = await fetch("http://localhost:5220/timermodel/" + req.params.id + "/timespent");
  const totalTimeJson = await totalTimeResponse.json();
  const totalTime = totalTimeJson.totaltimespent;
  const formattedTimes = await ConvertSeconds(totalTime);
  res.render('timer', { title: "Timer Record: " + req.params.id, id: req.params.id, issueId: timer.issueId, userId: timer.userId, timerperiods: timerPeriods, totalTimeElapsed: totalTime, formattedTimes: formattedTimes });
});
app.get("/views/timerperiodmodel/timerperiod/:id", async (req, res) => {
  const timerperiod = await prisma.timerPeriod.findFirst({
    where: {
      id: Number(req.params.id),
    },
  });
  const timerPeriodsResponse = await fetch("http://localhost:5220/timermodel/" + timerperiod.timerId + "/timerperiods")
  const timerPeriods = await timerPeriodsResponse.json();
  const timeElapsed = timerperiod.totalTimeElapsed
  const formattedTimes = await ConvertSeconds(timeElapsed);
  res.render('timerperiod', { title: "Period Record: " + req.params.id, id: req.params.id, startDate: timerperiod.startDate, endDate: timerperiod.endDate, timerId: timerperiod.timerId, TotalTimeElapsed: timeElapsed, timerperiods: timerPeriods, formattedTimes: formattedTimes });
});
app.get("/views/search", async (req, res) => {
  res.render('search', { title: "Search" });
});
app.get("/views/issuemodel/issue/:id", async (req, res) => {
  const issue = await prisma.issue.findFirst({
    where: {
      id: Number(req.params.id),
    },
  });
  const usersResponse = await fetch("http://localhost:5220/issuemodel/" + req.params.id + "/users");
  const users = await usersResponse.json();
  const timeElapsedResponse = await fetch("http://localhost:5220/issuemodel/" + req.params.id + "/timespent");
  const timeElapsedJson = await timeElapsedResponse.json();
  const timeElapsed = timeElapsedJson.totaltimespent;
  const formattedTimes = await ConvertSeconds(timeElapsed);
  res.render('issue', { title: "Issue Record: " + req.params.id, id: req.params.id, issueUrl: issue.url, issueName: issue.issueName, users: users, TotalTimeElapsed: timeElapsed, formattedTimes: formattedTimes });
});
app.get("/views/teammodel/team/:id", async (req, res) => {
  const team = await prisma.team.findFirst({
    where: {
      id: Number(req.params.id),
    },
  });
  console.log(team);
  var teamName;
  var usersCount;
  if (team != null)
  {
    const usersResponse = await fetch("http://localhost:5220/teammodel/" + team.id + "/users");
    const users = await usersResponse.json();
    usersCount = users.length;
    teamName = team.teamName
  }
  res.render('team', { title: "Team Record: " + req.params.id, teamId: req.params.id, teamName: teamName, usersCount: usersCount });
});

app.get("/views/projectmodel/project/:id", async (req, res) => {
  const project = await prisma.project.findFirst({
    where: {
      id: Number(req.params.id),
    },
  });
  var projectName;
  var issueCount;
  if (project != null)
  {
    const issuesResponse = await fetch("http://localhost:5220/projectmodel/" + project.id + "/issues");
    const issues = await issuesResponse.json();
    issueCount = issues.length;
    projectName = project.projectName;
  }
  res.render('project', { title: "Project Record: " + req.params.id, projectId: req.params.id, projectName: projectName, issueCount: issueCount });
});

app.post("/user/:username", async (req, res) => {
  if (await prisma.user.findFirst({
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
  else
  {
    console.log("User already exists")
  }
});
app.post("/issue/:url/:issuename", async (req, res) => {
  if (await prisma.issue.findFirst({
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
  else
  {
    console.log("Issue already exists");
  }
});
app.post("/timer/:username/:issueUrl/:issueName", async (req, res) => {
  const user = await prisma.user.findFirst({
    where: {
      UserName: req.params.username,
    },
  });
  if (user != null)
  {
    const issue = await prisma.issue.findFirst({
    where: {
      url: req.params.issueUrl,
    },
    });
    if (issue != null)
    {
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
      else
      {
        console.log("Timer already exists when creating timer.")
      }
    }
    else
    {
      console.log("Issue was found null when creating timer.")
    }
  }
  else
  {
    console.log("User was found null when creating timer.")
  }
});
app.post("/timerPeriod/:username/:issueUrl/:issueName/:startdate/:enddate/:time", async (req, res) => {
  console.log("POST TIMER PERIOD");
  const user = await prisma.user.findFirst({
    where: {
      UserName: req.params.username,
    },
  });
  if (user != null)
  {
    const issue = await prisma.issue.findFirst({
    where: {
      url: req.params.issueUrl,
    },
    });
    console.log(issue);
    if (issue != null)
    {
      const timer = await prisma.timer.findFirst({
      where: {
        userId: user.id,
        issueId: issue.id,
      },
      });
      if (timer != null)
      {
        const newTimerPeriod = await prisma.timerPeriod.create({
          data: {
            timerId: timer.id,
            startDate: req.params.startdate,
            endDate: req.params.enddate,
            totalTimeElapsed: Number(req.params.time),
          }, 
        });
      }
      else
      {
        console.log("Timer was found null when creating timer period");
      }
    }
    else
    {
      console.log("Issue was found null when creating timer period");
    }
  }
  else
  {
    console.log("User was found null when creating timer period")
  }
});
app.post("/usersTeams/:userId/:teamId", async (req, res) => {
  if (await prisma.usersTeams.findFirst({
    where: {
      userId: Number(req.params.userId),
      teamId: Number(req.params.teamId),
    },
  }) == null)
  {
    const userTeam = await prisma.usersTeams.create({
    data: 
    {
      userId: Number(req.params.userId),
      teamId: Number(req.params.teamId),
    },
    });
  }
  else
  {
    console.log("User already is part of team with id: " + req.params.teamId);
  }
});
app.post("/team/:teamName", async (req, res) => {
  const team = await prisma.team.create({
    data: 
    {
      teamName: req.params.teamName
    },
  });
});
app.post("/issuesProjects/:issueId/:projectId", async (req, res) => {
  if (await prisma.issuesProjects.findFirst({
    where: {
      issueId: Number(req.params.issueId),
      projectId: Number(req.params.projectId),
    },
  }) == null)
  {
    const issueProject = await prisma.issuesProjects.create({
    data: 
    {
      issueId: Number(req.params.issueId),
      projectId: Number(req.params.projectId),
    },
    });
  }
  else
  {
    console.log("Issue already is part of project with id: " + req.params.projectId);
  }
});
app.post("/teamsProjects/:teamId/:projectId", async (req, res) => {
  if (await prisma.teamsProjects.findFirst({
    where: {
      teamId: Number(req.params.teamId),
      projectId: Number(req.params.projectId),
    },
  }) == null)
  {
    const teamProject = await prisma.teamsProjects.create({
    data: 
    {
      teamId: Number(req.params.teamId),
      projectId: Number(req.params.projectId),
    },
    });
  }
  else
  {
    console.log("Team already is part of project with id: " + req.params.projectId);
  }
});
app.post("/project/:projectName", async (req, res) => {
  const project = await prisma.project.create({
    data: 
    {
      projectName: req.params.projectName
    },
  });
});
//GENERAL ENDPOINTS
app.get("/user", async (req, res) => {
  const returnedUsers = await prisma.user.findMany();
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
app.get("/team", async (req, res) => {
  const returnedTeams = await prisma.team.findMany();
  res.json(returnedTeams);
});
app.get("/usersTeams", async (req, res) => {
  const returnedUsersTeams = await prisma.usersTeams.findMany();
  res.json(returnedUsersTeams);
});
app.get("/project", async (req, res) => {
  const returnedProjects = await prisma.project.findMany();
  res.json(returnedProjects);
});
app.get("/issuesProjects", async (req, res) => {
  const returnedIssuesProjects = await prisma.issuesProjects.findMany();
  res.json(returnedIssuesProjects);
});
//SPECIFIC ENDPOINTS
app.get("/user/:username", async (req, res) => {
  try
  {
    const user = await prisma.user.findUnique({
      where: {
        UserName: req.params.username,
      },
    })
    res.json(user);
  }
  catch (error) 
  {
    console.log("Error getting user " + error);
  }
});
app.get("/user/id/:id", async (req, res) => {
  try
  {
    const user = await prisma.user.findFirst({
      where: {
        id: Number(req.params.id),
      },
    })
    res.json(user);
  }
  catch (error) 
  {
    console.log("Error getting user " + error);
  }
});
app.get("/issue/:issueId", async (req, res) => {
  try
  {
    const returnissue = await prisma.issue.findFirst({
      where: {
        id: Number(req.params.issueId),
      },
    })
    res.json(returnissue);
  }
  catch (error) 
  {
    console.log("Error getting issue " + error);
  }
});
app.get("/issueGet/:issueUrl/:issueName", async (req, res) => {
  try
  {
    const issue = await prisma.issue.findUnique({
      where: {
        url: req.params.issueUrl,
        issueName: req.params.issueName,
      },
    })
    res.json(issue);
  }
  catch (error) 
  {
    console.log("Error getting issue " + error);
  }
});
app.get("/issue/url/:issueUrl", async (req, res) => {
  try
  {
    const issue = await prisma.issue.findUnique({
      where: {
        url: req.params.issueUrl,
        issueName: req.params.issueName,
      },
    })
    res.json(issue);
  }
  catch (error) 
  {
    console.log("Error getting issue " + error);
  }
});
app.get("/timer/:userName/:issueUrl/:issueName", async (req, res) => {
  try
  {
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
  }
  catch (error) 
  {
    console.log("Error getting timer " + error);
  }
});
app.get("/timer/:id", async (req, res) => {
  try
  {
    const timer = await prisma.timer.findFirst({
      where: {
        id: Number(req.params.id),
      },
    })
    res.json(timer);
  }
  catch (error) 
  {
    console.log("Error getting timer " + error);
  }
});
app.get("/timer/user/:username", async (req, res) => {
  try
  {
    const user = await prisma.user.findUnique({
      where: {
        UserName: req.params.username,
      },
      include: {
        timers: true,
      },
    })
    res.json(user);
  }
  catch (error) 
  {
    console.log("Error getting users with timers " + error);
  }
});
app.get("/timer/:username/:url/:issuename", async (req, res) => {
  try
  {
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
  }
  catch (error) 
  {
    console.log("Error getting user " + error);
  }
});
app.get("/timerPeriod/:id", async (req, res) => {
  try
  {
    const timerPeriod = await prisma.timerPeriod.findFirst({
      where: {
        id: Number(req.params.id),
      },
    });
    res.json(timerPeriod);
  }
  catch (error) 
  {
    console.log("Error getting user " + error);
  }
});
app.get("/team/:id", async (req, res) => {
  try
  {
    const team = await prisma.team.findFirst({
      where: {
        id: req.params.id,
      },
    });
    res.json(team);
  }
  catch (error) 
  {
    console.log("Error getting team " + error);
  }
});
app.get("/usersTeams/:userId/:teamId/", async (req, res) => {
  try
  {
    const usersTeam = await prisma.usersTeams.findFirst({
      where: {
        userId: Number(req.params.userId),
        teamId: Number(req.params.teamId),
      },
    });
    res.json(usersTeam);
  }
  catch (error) 
  {
    console.log("Error getting usersTeams " + error);
  }
});
app.get("/timermodel/timerperiod", async (req, res) => {
  var timersWithPeriods = await prisma.$queryRaw`SELECT TimerPeriod.id, TimerPeriod.totalTimeElapsed, TimerPeriod.timerId FROM Timer INNER JOIN TimerPeriod ON Timer.id = TimerPeriod.timerId;`;
  res.json(timersWithPeriods);
});

app.get("/timermodel/:id/timespent", async (req, res) => {//Net amount of time spent for a timer
  
  var TimeSpentArray = await prisma.$queryRaw`SELECT TimerPeriod.totalTimeElapsed FROM TimerPeriod INNER JOIN Timer ON TimerPeriod.timerId = Timer.id WHERE Timer.id = ${req.params.id};`;
  var TimeSpent = 0;
  for (var j = 0; j < TimeSpentArray.length; j++)
  {
    TimeSpent += Number(TimeSpentArray[j].totalTimeElapsed);
  }
  res.json({
    'totaltimespent': TimeSpent,
  });
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
  res.json(userIssues);
});
app.get("/issuemodel/:id/timespent", async (req, res) => { //total amount of time spent on an issue by all users
  var issueTimeSpentArray = await prisma.$queryRaw`SELECT TimerPeriod.id, TimerPeriod.totalTimeElapsed, Issue.Id, Issue.url FROM ((Timer INNER JOIN Issue ON Timer.issueId = Issue.id) INNER JOIN TimerPeriod ON Timer.id = TimerPeriod.timerId) WHERE Issue.id = ${req.params.id};`;
  var issueTimeSpent = 0;
  for (var j = 0; j < issueTimeSpentArray.length; j++) 
  {
    issueTimeSpent += Number(issueTimeSpentArray[j].totalTimeElapsed);
  }
  res.json({
    'totaltimespent': issueTimeSpent,
  });
});
app.get("/timermodel/:id/timer", async (req, res) => { //get timer by ID
  var timer = await prisma.$queryRaw`SELECT Timer.id, Timer.userId, Timer.issueId FROM Timer WHERE Timer.id = ${Number(req.params.id)};`;
  res.json(timer);
});
app.get("/timermodel/:id/userandtimer", async (req, res) => { //get user and issue names for a timer
  var userAndIssue = await prisma.$queryRaw`SELECT User.UserName, Timer.id AS TimerId FROM ((Timer INNER JOIN User ON Timer.userId = User.id) INNER JOIN ISSUE ON Timer.issueId = Issue.id) WHERE Timer.id = ${Number(req.params.id)};`;
  res.json(userAndIssue);
});
app.get("/timerperiodmodel/average", async (req, res) => { //Average time spent on all timer periods
  var TimeSpentArray = await prisma.$queryRaw`SELECT TimerPeriod.totalTimeElapsed FROM TimerPeriod`;
  var TimeSpent = 0;
  for (var j = 0; j < TimeSpentArray.length; j++)
  {
    TimeSpent += Number(TimeSpentArray[j].totalTimeElapsed);
  }
  var average = Number(TimeSpent / TimeSpentArray.length);
  var roundedAverage = Math.round((average + Number.EPSILON) * 100) / 100
  res.json({
    'average': roundedAverage,
  });
});
app.get("/teammodel/:id/users", async (req, res) => { //Get all the users for a team
  var users = await prisma.$queryRaw`SELECT User.UserName, User.id AS userId, Team.Id AS teamId FROM ((Team INNER JOIN UsersTeams ON UsersTeams.teamId = Team.id) INNER JOIN User ON UsersTeams.userId = User.id) WHERE Team.id = ${req.params.id};`;
  res.json(users);
});
app.get("/projectmodel/:id/issues", async (req, res) => { //Get all the issues for a project
  var issues = await prisma.$queryRaw`SELECT Issue.issueName, Issue.url, Issue.id AS issueId, Project.Id AS projectId FROM ((Project INNER JOIN IssuesProjects ON IssuesProjects.projectId = Project.id) INNER JOIN Issue ON IssuesProjects.issueId = Issue.id) WHERE Project.id = ${req.params.id};`;
  res.json(issues);
});
app.get("/timerperiodmodel/users", async (req, res) => { //All timer periods with associated users
  var periodsWithUsers = await prisma.$queryRaw`SELECT User.UserName, TimerPeriod.totalTimeElapsed, TimerPeriod.endDate FROM ((TimerPeriod INNER JOIN Timer ON TimerPeriod.timerId = Timer.id) INNER JOIN User ON Timer.userId = User.id);`;
  res.json(periodsWithUsers);
});
app.get("/issuemodel/:issueId/users", async (req, res) => { //users related to an issue
  var usersForIssue = await prisma.$queryRaw`SELECT User.id, User.UserName FROM ((Timer INNER JOIN Issue ON Timer.issueId = Issue.id) INNER JOIN User ON Timer.userId = User.id) WHERE Issue.id = ${req.params.issueId};`;
  res.json(usersForIssue);
});
app.get("/issuemodel/:issueId/:userId/timespentbyuser", async (req, res) => { //Timer Periods from an issue by a user
  var issueTimeSpentArray = await prisma.$queryRaw`SELECT TimerPeriod.id, TimerPeriod.totalTimeElapsed, Issue.issueName, User.UserName FROM (((Timer INNER JOIN Issue ON Timer.issueId = Issue.id) INNER JOIN TimerPeriod ON Timer.id = TimerPeriod.timerId) INNER JOIN User ON Timer.userId = User.id) WHERE Issue.id = ${req.params.issueId} AND User.id = ${req.params.userId};`;
  res.json(issueTimeSpentArray);
});
app.get("/timermodel/:id/timerperiods", async (req, res) => { //returns all timerperiods for a given timer
  var timerPeriods = await prisma.$queryRaw`SELECT TimerPeriod.id, TimerPeriod.totalTimeElapsed, TimerPeriod.startDate, TimerPeriod.endDate, TimerPeriod.TimerId FROM Timer INNER JOIN TimerPeriod ON Timer.id = TimerPeriod.timerId WHERE Timer.id = ${req.params.id};`;
  res.json(timerPeriods);
});
app.get("/timermodel/:id/adjacenttimerperiods", async (req, res) => { //returns all timerperiods for a certain date based on one timer period's enddate
  var targetTimerPeriod = await prisma.$queryRaw`SELECT TimerPeriod.id, TimerPeriod.totalTimeElapsed, TimerPeriod.startDate, TimerPeriod.endDate, TimerPeriod.TimerId FROM TimerPeriod WHERE TimerPeriod.id = ${req.params.id};`;
  var targetDateObject = new Date(targetTimerPeriod[0].endDate);
  var targetDate = targetDateObject.getDate();
  var targetMonth = targetDateObject.getMonth();
  var targetYear = targetDateObject.getFullYear();
  console.log("Target: " + targetMonth + "-" + targetDate + "-" + targetYear);
  var allPeriods = await prisma.$queryRaw`SELECT TimerPeriod.id, TimerPeriod.totalTimeElapsed, TimerPeriod.startDate, TimerPeriod.endDate, TimerPeriod.TimerId FROM TimerPeriod;`;
  var adjacentPeriods = await Promise.all(allPeriods.map(async function(index){
    if (index.id != req.params.id)
    {
      var indexDateObject = new Date(index.endDate);
      var indexDate = indexDateObject.getDate();
      var indexMonth = indexDateObject.getMonth();
      var indexYear = indexDateObject.getFullYear();
      
      if ((indexDate == targetDate) && (indexMonth == targetMonth) && (indexYear == targetYear))
      {
        console.log("IndexDate: " + indexMonth + "-" + indexDate + "-" + indexYear);
        const data = {
          timerPeriodId: index.id,
          startDate: index.startDate,
          endDate: index.endDate,
          totalTimeElapsed: index.totalTimeElapsed
        }
        return data;
      }
    }
    else
    {
      console.log("RATS");
      return null;
    }
  }));
  adjacentPeriods = adjacentPeriods.filter(function (element) {
    if (element !== null)
    {
      return element;
    }
  }); 
  res.json(adjacentPeriods);
});
app.get("/timerperiodmodel/endtimes", async (req, res) => { //returns the end dates in milliseconds of all time periods
  var timerPeriods = await prisma.$queryRaw`SELECT TimerPeriod.endDate AS stopTime, TimerPeriod.TimerId, User.UserName, TimerPeriod.totalTimeElapsed FROM ((Timer INNER JOIN TimerPeriod ON Timer.id = TimerPeriod.timerId) INNER JOIN User ON Timer.UserId = User.id)`;
  timerPeriods.stopTime = new Date(timerPeriods.stopTime).getTime();
  res.json(timerPeriods);
});
app.get("/timermodel/:id/user", async (req, res) => { //returns the user for a timer
  const user = await prisma.$queryRaw`SELECT User.id, User.UserName FROM Timer INNER JOIN User ON Timer.userId = User.id WHERE Timer.id = ${req.params.id};`;
  res.json(user);
});
app.get("/timermodel/:id/issue", async (req, res) => { //returns the issue for a timer
  const issue = await prisma.$queryRaw`SELECT Issue.id, Issue.issueName, Issue.url FROM Timer INNER JOIN Issue ON Timer.issueId = Issue.id WHERE Timer.id = ${req.params.id};`;
  res.json(issue);
});
app.get("/teamModel/:teamId/projects", async (req, res) => { //returns the projects for a team
  const projects = await prisma.$queryRaw`SELECT Project.id AS projectId, Team.id AS teamId, Project.projectName ((FROM Team INNER JOIN TeamsProjects ON Team.id = TeamsProjects.teamId) INNER JOIN Project ON TeamsProjects.projectId = Project.id) WHERE Team.id = ${req.params.id};`;
  res.json(projects);
});
app.get("/projectModel/:projectId/teams", async (req, res) => { //returns the teams for a project
  const teams = await prisma.$queryRaw`SELECT Project.id AS projectId, Team.id AS teamId, Team.teamName ((FROM Project INNER JOIN TeamsProjects ON Project.id = TeamsProjects.projectId) INNER JOIN Team ON TeamsProjects.teamId = Team.id) WHERE Project.id = ${req.params.id};`;
  res.json(teams);
});
app.get("/team/teamname/:teamName", async (req, res) => { //returns team with given name
  const team = await prisma.$queryRaw`SELECT Team.id, Team.teamName FROM Team WHERE Team.teamName = ${req.params.teamName};`;
  res.json(team);
});
app.get("/project/projectname/:projectName", async (req, res) => { //returns the project with given name
  const project = await prisma.$queryRaw`SELECT Project.id, Project.projectName FROM Project WHERE Project.projectName = ${req.params.projectName};`;
  res.json(project);
});
//MODEL MAIN PAGES

app.get("/views/users", async (req, res) => {
  res.render('users', {title: "Users"});
});
app.get("/views/issues", async (req, res) => {
  res.render('issues', {title: "Issues"});
});
app.get("/views/timers", async (req, res) => {
  res.render('timers', {title: "Timers"});
});
app.get("/views/timerperiods", async (req, res) => {
  res.render('timerperiods', {title: "Timer Periods"});
});
app.get("/views/teams", async (req, res) => {
  res.render('teams', {title: "Teams"});
});
app.get("/views/projects", async (req, res) => {
  res.render('projects', {title: "Projects"});
});
app.get("/views/records", async (req, res) => {
  res.render('records', {title: "Records"});
});
app.get("/views/main", async (req, res) => {
  res.render('main', {title: "ITSC GitHub Timer"});
});
app.get("/", async (req, res) => {
  res.render('main', {title: "ITSC GitHub Timer"});
});
app.listen(5220, () => console.log('Server running on port ${5220}'));
async function main() 
{
  console.log("Starting GitHub Issues Timer Server. . .")
}

async function ConvertSeconds(seconds)
{
  var minutes = 0;
  var hours = 0;   
  var days = 0;
  if (seconds == NaN)
  {
      console.log("Seconds is null, resetting");
      seconds = 0;
  }
  Number(seconds); //Input number of seconds to be converted
  days = Math.floor(Number(seconds) / (3600*24)); //Convert seconds to days
  hours = Math.floor(Number(seconds) % (3600*24) / 3600);//convert seconds to hours
  minutes = Math.floor(Number(seconds) % 3600 / 60);//convert seconds to minutes
  seconds = Math.floor(Number(seconds) % 60);//get the remaining seconds
  const data = {
    seconds,
    minutes,
    hours,
    days,
  }
  console.log(data);
  return data;
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
  //res.render('userFriendlyError', { title: "Page Missing" });
  res.render('error', { title: "Page Missing"});
});

module.exports = app;


//npx prisma studio