//SCRIPT TO BE INJECTED INTO https://github.com/*/*/issues/*

console.log("Script Injected");
var startButton;
var pauseButton;
var stopButton;
var timerDisplay;
var credits;
var destinationDiv = document.getElementById("js-repo-pjax-container");
var textArea;
var commentParent;
var commentButton;
var titleBar;
var startButtonInstance;
var pauseButtonInstance;
var stopButtonInstance;
var timerDisplayInstance;
var userName = document.getElementsByName("user-login")[0].content; //ADD CHECK FOR NULL
var createTimerButton = document.createElement('button');
createTimerButton.textContent = "Track This Issue";
createTimerButton.id = "createTimerButton";
//Numbers for our time variables
var sec = 0;
var totalSeconds = 0;//deprecated
var start;
//The formatted strings for our numbers
var secString = "00";
var minString = "00";
var hourString = "00";
var dayString = "00";
var totalTimeString = "00:00:00:00";
//Our interval timer for the app
var timer;
var isTimerActive = 0; //Essentially a bool for if the timer is running
var isTimerPaused = 0;//a bool for if the timer is paused (different than it not being active)
//Dates to save
var lastDate;
var currentDate;
var commentNum = 0;
var commentId = "";
var timerCount = 0;
var startDate;
var endDate;
timerCount++;
CheckIfInitialized();
async function CheckIfInitialized()
{
    results = await FindUserTimerLog(userName);
    if (results == 0)
    {
        destinationDiv.append(createTimerButton);
        var createTimerButtonInstance = document.getElementById("createTimerButton");
        createTimerButtonInstance.addEventListener('click', async function ()
        {
            console.log("CREATE TIMER Button Clicked");
            await CreateTimerDisplay();
            createTimerButtonInstance.remove();
            InitializeTimer();
        });
    }
    if (results == 1)
    {
        await CreateTimerDisplay();
        InitializeTimer();
    }
}

async function CreateTimerDisplay()
{
    startButton = document.createElement('button');
    startButton.textContent = "\u25B6"; //Unicode play button
    startButton.id = "startButton";
    pauseButton = document.createElement('button');
    pauseButton.textContent = "| |";
    pauseButton.id = "pauseButton";
    stopButton = document.createElement('button');
    stopButton.textContent = "X";
    stopButton.id = "stopButton";
    timerDisplay = document.createElement('h1');
    timerDisplay.textContent = "DD:HH:MM:SS";
    timerDisplay.id = "timerDisplay";
    credits = document.createElement('p');
    credits.textContent = "Timer Extension for Github issues as part of ITSC Summer Internship 2024\n https://github.com/GrantRynders/Github-Extension-Project";
    credits.id = "credits";
    //Find the destination for our new content
    textArea = document.getElementById("new_comment_field");
    commentParent = document.getElementById("partial-new-comment-form-actions");//The parent element for the comment submit button, we use it to narrow our search for the button itself
    commentButton = commentParent.getElementsByClassName("btn-primary btn")[0];//Finds all elements of this button class which is just gonna be the button we are looking for. Despite the list only having one, you still must specify the index
    titleBar = "js-issue-title markdown-title";
    //append instances of our new buttons to the page
    AppendAdditions();
    //find those instances we just created
    createTimerButtonInstance = document.getElementById("createTimerButton");
    startButtonInstance = document.getElementById("startButton");
    pauseButtonInstance = document.getElementById("pauseButton");
    stopButtonInstance = document.getElementById("stopButton");
    timerDisplayInstance = document.getElementById("timerDisplay");
    startButtonInstance.addEventListener('click',async function ()
    {
        console.log("Start Button Clicked");
        if (isTimerActive == 0) //Can't start a timer that is already started
        {
            isTimerActive = 1;
            startDate = Date();
            startTimer();
            await LogTime();
        }
        
    });
    pauseButtonInstance.addEventListener('click',function ()
    {
        console.log("PAUSE Button Clicked");
        if (isTimerActive == 1 && isTimerPaused == 0) //You should not be able to pause when it is already paused
        {
            isTimerPaused = 1;
            StopTimer();
            SaveData();
            LogEndOfTimer();
        }
    });
    stopButtonInstance.addEventListener('click',async function ()
    {
        console.log("STOP Button Clicked");
        StopTimer();
        LogEndOfTimer(); //Create a comment detailing end timer stats
        ResetTimerValues();//Reset the timer
    });
}
//On initialize
async function InitializeTimer()
{
        var issueHeader = document.getElementsByClassName("js-issue-title markdown-title")[0];
        var serverStatus = await CheckServer();
        
        console.log(userName);
        if (localStorage.getItem(userName + window.location.href) == null)
        {
            SaveData();
        }
        LoadData(); //Get our local storage values if there are any, making sure nothing is null
        results = await FindUserTimerLog(userName);
        console.log(results);
        if (results == 0)
        {
            console.log("crippling failure");
            await CreateUserTimerLog(userName); //temporarily disabled
        }
        if (results == 1)
        {
            console.log("SUCCESS");
        }
        startButtonInstance.scrollIntoView({behavior: 'instant'});
        console.log("Initialize timer called");
        if (sec == null)
        {
            sec = 0;//Make sure seconds is valid
        }
        totalTimeString = ConvertTimeToFormat(Number(sec)); //converts the seconds to a formatted string
        timerDisplayInstance.textContent = totalTimeString; //sets the timer display
        if (isTimerActive == 1) //If the timer was still going when the page was reloaded then restart it
        {
            console.log("Timer was active before reset");
            if (lastDate != null)
            {
                currentDate = Date();//gets current date
                var difference = new Date(currentDate).getTime() - new Date(lastDate).getTime();
                console.log("Difference: " + (Number(difference) / 1000));
                sec = Number(sec) + Number(Math.round(difference /1000)); //We need to find how long this timer has been on for between when the user closed/reloaded the browser and now and add it to the timer
                console.log("New seconds after difference: " + sec)
                if (Number(sec) < 0 || Number(sec) == null) //make sure the seconds variable is good
                {
                    sec = 0;
                }
            }
            else
            {
                console.log("Last logged time for continuing timer is null")
            }
            startTimer();
        }
    //}
}

function startTimer(){ //Starts the set interval function if timer is not already started
    isTimerActive = 1;
    isTimerPaused = 0;
    start = Date();
    //DD:HH:MM:SS
    timer = setInterval(function(){
        sec = Number(sec) + 1;
        console.log('Second: ' + sec);
        totalSeconds += parseInt(1);
        lastDate = Date();
        SaveData();
        totalTimeString = ConvertTimeToFormat(Number(sec));//Converts our time variables into a formatted string
        timerDisplayInstance.textContent = totalTimeString; //Set the timer's display to our formatted time string
    }, 1000);
}
function ConvertTimeToFormat(seconds)
{
    var min = 0;
    var hour = 0;   
    var day = 0;
    if (seconds == NaN)
    {
        console.log("Seconds is null, resetting");
        seconds = 0;
    }
    Number(seconds); //Input number of seconds to be converted
    day = Math.floor(Number(seconds) / (3600*24)); //Convert seconds to days
    hour = Math.floor(Number(seconds) % (3600*24) / 3600);//convert seconds to hours
    min = Math.floor(Number(seconds) % 3600 / 60);//convert seconds to minutes
    seconds = Math.floor(Number(seconds) % 60);
    secString = seconds;
    if (Number(seconds) < 10) //Format the string if there would be a leading 0 on the display, e.g. "05:03"
    {
        secString = "0" + String(seconds);
    }
    minString = min
    if (Number(min) < 10)
    {
        minString = "0" + min;
    }
    hourString = hour;
    if (Number(hour) < 10)
    {
        hourString = "0" + hour;
    }
    if (Number(day) >= 99)
    {
        StopTimer();
        timerDisplayInstance.textContent("Max Value Reached");
    }
    dayString = day;
    if (Number(day) < 10)
    {
        dayString = "0" + day;
    }
    //totalTimeString stores the formatted time for use all over the app
    return dayString + ":" + hourString + ':' + minString + ':' + secString;
}
function StopTimer() //Stops the interval func
{
    isTimerActive = 0;
    clearInterval(timer);
    SaveData();
    timerCount = 0;
}
function AppendAdditions() //Append new elements to the destination for the extension
{
    if (destinationDiv != null)
    {
        destinationDiv.appendChild(timerDisplay);
        destinationDiv.appendChild(startButton);
        destinationDiv.appendChild(pauseButton);
        destinationDiv.appendChild(stopButton);
        destinationDiv.appendChild(credits);
    }
    else
    {
        console.log("Destination div is null");
    }
}
async function DoesLogContainIncompleteRecord(queryString)
{
        var optionBtn = document.getElementsByClassName("timeline-comment-action Link--secondary Button--link Button--medium Button")[commentNum - 1]; //the three dots
        if (optionBtn != null)
        {
            optionBtn.click();
            var optionsPanel = document.getElementsByClassName("dropdown-menu dropdown-menu-sw show-more-popover color-fg-default")[0];//popup menu with edit/hide/delete/etc.
        }
        else
        {
            console.log("Option panel was found null in incomplete record check")
        }
        setTimeout(() => {
        var editBtn = document.getElementsByClassName("dropdown-item btn-link js-comment-edit-button")[0];//the button that literally says "edit"
        if (editBtn != null)
        {
            editBtn.click();
            var commentBlock = document.getElementById(commentId);
            var commentTextArea = commentBlock.getElementsByClassName("js-comment-field js-paste-markdown js-task-list-field js-quick-submit js-size-to-fit js-session-resumable CommentBox-input FormControl-textarea js-saved-reply-shortcut-comment-field")[0];
            var submitEditButton = commentBlock.getElementsByClassName("Button--primary Button--medium Button")[0];
            var log = commentTextArea.textContent;
            var records = log.split("\n");
            var length = records.length;
            var finalRecord = records[length - 1];
            console.log("Final Record: " + finalRecord);
            if (finalRecord.includes(queryString))
            {
                submitEditButton.click();
                console.log("incompletecheck submit button click");
                //window.location.reload();//reload the page to submit the comment
                startButtonInstance.scrollIntoView({behavior: 'instant'});//Manually move the user back to the timer to give the illusion that this app isn't coded like crap
                console.log("record was found to be incomplete");
                return 1;
            }
            else
            {
                submitEditButton.click();
                //window.location.reload();//reload the page to submit the comment
                startButtonInstance.scrollIntoView({behavior: 'instant'});//Manually move the user back to the timer to give the illusion that this app isn't coded like crap
                console.log("Record was found to be complete");
                return 0;
            }
        }
        else
        {
            console.log("Edit button was found null in incomplete record check, whoops");
        }
    }, "1000");
   console.log("Func is over");
   return 0;
}
async function LogTime()
{
    
    FindUserTimerLog(userName);
    var isRecordIncomplete = await DoesLogContainIncompleteRecord("start");
    console.log("IsRecordIncomplete: " + isRecordIncomplete);
    if (isRecordIncomplete == 0)
    {
        var optionBtn = document.getElementsByClassName("timeline-comment-action Link--secondary Button--link Button--medium Button")[commentNum - 1]; //the three dots
        optionBtn.click();
        var optionsPanel = document.getElementsByClassName("dropdown-menu dropdown-menu-sw show-more-popover color-fg-default")[0];//popup menu with edit/hide/delete/etc.
        setTimeout(() => {
            EditComment( ". . . . \n", "start", "");
        }, "1000");
    }
    else
    {
        console.log("Timer contains incomplete log");
    }
}
function EditComment(value1, value2, value3)
{
    console.log("Edit Comment Func");
    var editBtn = document.getElementsByClassName("dropdown-item btn-link js-comment-edit-button")[0];//the button that literally says "edit"
    if (editBtn != null)
    {
        editBtn.click();
        var commentBlock = document.getElementById(commentId);
        var commentTextArea = commentBlock.getElementsByClassName("js-comment-field js-paste-markdown js-task-list-field js-quick-submit js-size-to-fit js-session-resumable CommentBox-input FormControl-textarea js-saved-reply-shortcut-comment-field")[0];
        var submitEditButton = commentBlock.getElementsByClassName("Button--primary Button--medium Button")[0];
        commentTextArea.textContent += "\n" + value1 + value2 + " date: " + new Date() + "\ntimer " + value2 + " value: " + totalTimeString + value3;
        if (value2 == "stop")
        {
            var secondsElapsed = CalculateTimeSpent(commentTextArea.textContent);
            var formattedTimeElapsed = ConvertTimeToFormat(secondsElapsed);
            commentTextArea.textContent += "\n. . . .\nTotal Time Spent So Far: " + formattedTimeElapsed;
        }
        setTimeout(() => {
            submitEditButton.click();
        }, "500");
        console.log("Edit comment button click");
        //window.location.reload();
        startButtonInstance.scrollIntoView({behavior: 'instant'});//Manually move the user back to the timer to give the illusion that this app isn't coded like crap
    }
    else
    {
        console.log("Edit button was found null in editcomment, whoops");
    }
}
async function LogEndOfTimer()
{
    FindUserTimerLog(userName);
    var optionBtn = document.getElementsByClassName("timeline-comment-action Link--secondary Button--link Button--medium Button")[commentNum - 1]; //the three dots
    optionBtn.click();
    var optionsPanel = document.getElementsByClassName("dropdown-menu dropdown-menu-sw show-more-popover color-fg-default")[0];//popup menu with edit/hide/delete/etc.
    endDate = Date();
    setTimeout(() => {
        EditComment(". . . .\n", "stop", "");
    }, "1000");
    var issueHeader = document.getElementsByClassName("js-issue-title markdown-title")[0];
    await LogDataToSQLite(userName, window.location.href, issueHeader.textContent, startDate, endDate);
}
function ResetTimerValues()
{
    //Resets everything to nothing
    sec = 0;
    min = 0;
    hour = 0;
    secString = "00";
    minString = "00";
    hourString = "00";
    dayString = "00";
    timerDisplayInstance.textContent = "00:00:00:00";
    startDate = null;
    endDate = null;
    ResetLocalStorage();
}
function ResetLocalStorage()
{
    sec = 0;
    isTimerActive = 0;
    isTimerPaused = 0;
    lastDate = null;
    startDate = null;
    SaveData();
}
async function FindUserTimerLog(user)
{
    var isLogFound = 0;
    commentNum = 0;
    var comments = document.getElementsByClassName("TimelineItem js-comment-container");
    for (const comment of comments)
    {
        var commentHeaderElement = comment.getElementsByClassName("author Link--primary text-bold css-overflow-wrap-anywhere ")[0]
        var commentHeader = commentHeaderElement.textContent;
        if (commentHeader == user)
        {
            commentText = comment.getElementsByClassName("d-block comment-body markdown-body  js-comment-body")[0].getElementsByTagName("p")[0];
            if (commentText.textContent.includes("###" + user + "TimeLog###"))
            {
                isLogFound = 1;
                var commentIdInstance = document.getElementsByClassName("js-comment-update")[commentNum].id;
                commentId = commentIdInstance;
                console.log("LOG FOUND AT COMMENT NUM: " + commentNum + " WITH ID: " + commentId);
                document.getElementsByClassName("js-comment-update")[commentNum].style.color = "#000000";
            }
        }
        commentNum = Number(commentNum) + 1;
    }
    return isLogFound;
}
async function CreateUserTimerLog(user)
{
    if (commentButton != null) //Make sure comment button is not null
    {
        console.log("CREATEUSERTIMERLOG");
        textArea.textContent = "###" + user + "TimeLog###";
        console.log("Creating new time log for user: " + user);
        commentButton.disabled = false; //The button is naturally disabled for input, we need to change that
        console.log("Disabled");
        commentButton.click(); //Click the button programmatically
        console.log("Clicked");
        window.location.reload();//reload the page to submit the comment
        startButtonInstance.scrollIntoView({behavior: 'instant'});//Manually move the user back to the timer to give the illusion that this app isn't coded like crap
        setTimeout(() => {
            results = FindUserTimerLog(user);
        });
    }
    else
    {
        console.log("Comment button does not exist. Logging failed");
    }
}
//beforeunload
function SaveData() {
    const state = {
      sec,
      isTimerActive,
      isTimerPaused,
      lastDate,
      commentNum,
      commentId,
      startDate
    };
    localStorage.setItem(userName + window.location.href, JSON.stringify(state));
  }
  // Function to load the timer state from local storage
function LoadData()
{
    console.log("Loading data from: " + userName + window.location.href);
    const state = JSON.parse(localStorage.getItem(userName + window.location.href));
    sec = state.sec;
    if (sec == null)
    {
        sec = 0;
    }
    console.log("Starting Seconds" + sec);
    isTimerActive = state.isTimerActive;
    if (isTimerActive == null)
    {
        isTimerActive = 0;
    }
    console.log("isTimerActive: " + isTimerActive);
    isTimerPaused = state.isTimerPaused;
    if (isTimerPaused == null)
    {
        isTimerPaused = 0;
    }
    console.log("isTimerPaused: " + isTimerPaused);
    lastDate = state.lastDate;
    console.log("Last saved Date: " + lastDate);
    commentNum = state.commentNum;
    commentId = state.commentId;
    startDate = state.startDate;
    console.log("Comment Number: " + commentNum);
    console.log("Comment Id: " + commentId);
    console.log("Start Date");
}



function CalculateTimeSpent(log)
{
    var records = log.split("\n");
    var startRecord;
    var stopRecord;
    for (var record of records)
    {
        if (record.includes("start date:"))
        {
            startRecord += record;
        }
        if (record.includes("stop date:"))
        {
            stopRecord += record;
        }
    }
    var startRecords = startRecord.split("start date: ");
    var stopRecords = stopRecord.split("stop date: ");
    var length = stopRecords.length;
    var totalTimeSpent = Number(0);
    for (let i = 1; i < length; i++)
    {
        var stop = new Date(stopRecords[i].replace("stop date: ", ""));
        var stopTime = stop.getTime();
        var start = new Date(startRecords[i].replace("start date: ", ""));
        var startTime = start.getTime();
        var difference = ((Number(stopTime) - Number(startTime)) / 1000);
        totalTimeSpent = Number(totalTimeSpent) + Number(difference);
    }
    return Number(totalTimeSpent);
}

async function CreateNewUser(inputUserName)
{
    console.log("USER POST");
    await fetch("http://localhost:5220/user/" + inputUserName, {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, *cors, same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, *same-origin, omit
        headers: {
            "Content-Type": "application/json",
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: "follow", // manual, *follow, error
        referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    }).then(function ()
    {
        console.log(Response.name);
    }).catch( function() 
    {
        console.log("User was unable to save due to error");
    });
}
async function CreateNewIssue(inputUrl, inputIssueName)
{
    console.log("ISSUE POST");
    await fetch("http://localhost:5220/issue/" + inputUrl + "/" + inputIssueName, {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, *cors, same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, *same-origin, omit
        headers: {
            "Content-Type": "application/json",
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: "follow", // manual, *follow, error
        referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    })
    .then(function (){
        console.log(Response);
    })
    .catch( function() {
        console.log("New issue was unable to save");
    });
}
async function CreateNewTimer(inputUserName, inputIssueUrl, inputIssueName)
{
    console.log("TIMER POST");
    await fetch("http://localhost:5220/timer/" + inputUserName + "/" + inputIssueUrl + "/" + inputIssueName, {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, *cors, same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, *same-origin, omit
        headers: {
            "Content-Type": "application/json",
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: "follow", // manual, *follow, error
        referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    })
    .then(function (){
        console.log(Response);
    })
    .catch( function() {
        console.log("New timer was unable to save");
    });
}
async function CreateNewTimerPeriod(inputUserName, inputUrl, inputIssueName, inputStartDate, inputEndDate, time)
{
    console.log("TIMER PERIOD POST");
    await fetch("http://localhost:5220/timerPeriod/" + inputUserName + "/" + inputUrl + "/" + inputIssueName + "/" + inputStartDate + "/" + inputEndDate + "/" + time, {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, *cors, same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, *same-origin, omit
        headers: {
            "Content-Type": "application/json",
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: "follow", // manual, *follow, error
        referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    })
    .then(function (){
        console.log(Response);
    })
    .catch( function() {
        console.log("New Timer Period was unable to save");
    });
}
async function CheckServer()
{
    var returnedResponse;
    const response = await fetch("http://localhost:5220/awake");
    returnedResponse = response.status;
    console.log(returnedResponse);
    return returnedResponse;
}
async function LogDataToSQLite(username, url, issuename, startdate, stopdate)
{
    var serverStatus = await CheckServer();
    if (serverStatus <= 304)
    {
        console.log(startdate);
        console.log(stopdate);
        console.log("SAVING DATA TO DATABASE");
        var difference = new Date(stopdate).getTime() - new Date(startdate).getTime();
        var time = Number(Math.round(difference /1000));
        await CreateNewUser(username.toLowerCase());
        await CreateNewIssue(encodeURIComponent(url), issuename.toLowerCase().replace("?", ""));
        await CreateNewTimer(username, encodeURIComponent(url), issuename);
        await CreateNewTimerPeriod(username, encodeURIComponent(url), issuename, startdate, stopdate, Number(time));
    }
    else
    {
        console.log("Uh oh server isn't awake");
    }
}





