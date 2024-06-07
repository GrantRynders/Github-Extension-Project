
//SCRIPT TO BE INJECTED INTO https://github.com/*/*/issues/*

console.log("Script Injected");
//CREATE BUTTONS and set their attributes
var startButton = document.createElement('button');
startButton.textContent = "\u25B6"; //Unicode play button
startButton.id = "startButton";
//var startIcon = document.createElement("img");
//startIcon.src = "Images/play-button.png";
var pauseButton = document.createElement('button');
pauseButton.textContent = "| |";
pauseButton.id = "pauseButton";
var stopButton = document.createElement('button');
stopButton.textContent = "X";
stopButton.id = "stopButton";
var timerDisplay = document.createElement('h1');
timerDisplay.textContent = "DD:HH:MM:SS";
timerDisplay.id = "timerDisplay";
var credits = document.createElement('p');
credits.textContent = "Timer Extension for Github issues as part of ITSC Summer Internship 2024";
credits.id = "credits";
//Find the destination for our new content
var destinationDiv = document.getElementById("js-repo-pjax-container");
var textArea = document.getElementById("new_comment_field");
var commentParent = document.getElementById("partial-new-comment-form-actions");//The parent element for the comment submit button, we use it to narrow our search for the button itself
var commentButton = commentParent.getElementsByClassName("btn-primary btn")[0];//Finds all elements of this button class which is just gonna be the button we are looking for. Despite the list only having one, you still must specify the index
var closeIssueButton = commentParent.getElementsByClassName("js-comment-and-button js-quick-submit-alternative btn BtnGroup-item flex-1")[0]; //same song and dance as the comment button, but this time for the close issue button



//var descriptionDropdown = document.getElementsByClassName("dropdown-menu dropdown-menu-sw show-more-popover color-fg-default");
//var descriptionEditBtn = descriptionDocument.getElementsByClassName("dropdown-item btn-link js-comment-edit-button");
var titleBar = "js-issue-title markdown-title"

//append instances of our new buttons to the page
AppendAdditions();
//find those instances we just created
var startButtonInstance = document.getElementById("startButton");
var pauseButtonInstance = document.getElementById("pauseButton");
var stopButtonInstance = document.getElementById("stopButton");
var timerDisplayInstance = document.getElementById("timerDisplay");
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
InitializeTimer();
//On initialize
function InitializeTimer()
{
    var userName = document.getElementsByClassName("AppHeader-context-compact-parentItem")[0].textContent;
    results = FindUserTimerLog(userName);
    if (results == 0)
    {
        console.log("crippling failure");
        CreateUserTimerLog(userName);
    }
    if (results == 1)
    {
        console.log("SUCCESS");
    }





    startButtonInstance.scrollIntoView({behavior: 'instant'});
    console.log("Initialize timer called")
    GetLocalStorage() //Get our local storage values if there are any, making sure nothing is null
    if (sec == null)
    {
        sec = 0;//Make sure seconds is valid
    }
    ConvertTimeToFormat(Number(sec)); //converts the seconds to a formatted string
    timerDisplayInstance.textContent = totalTimeString; //sets the timer display
    if (isTimerActive == 1) //If the timer was still going when the page was reloaded then restart it
    {
        console.log("Timer was active before reset");
        if (lastDate != null)
        {
            currentDate = Date();//gets current date
            console.log("Seconds before date difference: " + Number(sec).toString());
            console.log(typeof sec);
            console.log("Current Date: " + currentDate);
            console.log("Last date: " + lastDate);
            var difference = new Date(currentDate).getTime() - new Date(lastDate).getTime();
            sec = Number(sec) + Number(Math.round(difference /1000)); //We need to find how long this timer has been on for between when the user closed/reloaded the browser and now and add it to the timer
            console.log("New seconds after date difference: " + Number(sec).toString());
            if (Number(sec) < 0 || Number(sec) == null) //make sure the seconds variable is good
            {
                sec = 0;
            }
        }
        else
        {
            console.log("Last logged timer for continuing timer is null")
        }
        startTimer()
    }
}

function startTimer(){ //Starts the set interval function if timer is not already started
    isTimerActive = 1;
    isTimerPaused = 0;
    localStorage.setItem("isTimerPaused", isTimerPaused);
    start = Date();
    //DD:HH:MM:SS
    timer = setInterval(function(){
        sec = Number(sec) + 1;
        console.log('Second: ' + sec);
        //start.setSeconds(start.getSeconds() + 1)
        totalSeconds += parseInt(1);
        localStorage.setItem("LastDate", Date());
        localStorage.setItem("CurrentTime", sec);
        localStorage.setItem("isTimerActive", 1);
        ConvertTimeToFormat(Number(sec));//Converts our time variables into a formatted string
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
    console.log("seconds: " + Number(seconds));
    day = Math.floor(Number(seconds) / (3600*24)); //Convert seconds to days
    console.log("Days: " + day)
    hour = Math.floor(Number(seconds) % (3600*24) / 3600);//convert seconds to hours
    console.log("Hours: " + hour);
    min = Math.floor(Number(seconds) % 3600 / 60);//convert seconds to minutes
    console.log("minutes: " + min)
    seconds = Math.floor(Number(seconds) % 60);
    console.log("Last date: " + lastDate);
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
        StopTimer()
        timerDisplayInstance.textContent("Max Value Reached");
    }
    dayString = day;
    if (Number(day) < 10)
    {
        dayString = "0" + day;
    }
    //totalTimeString stores the formatted time for use all over the app
    totalTimeString = dayString + ":" + hourString + ':' + minString + ':' + secString;
}
function StopTimer() //Stops the interval func
{
    isTimerActive = 0;
    localStorage.setItem("isTimerActive", 0);
    clearInterval(timer);
}
startButtonInstance.addEventListener('click',function ()
{
    console.log("Start Button Clicked");
    if (isTimerActive == 0) //Can't start a timer that is already started
    {
        localStorage.setItem("isTimerActive", 1);
        startTimer();
    }
    LogTime();
});
pauseButtonInstance.addEventListener('click',function ()
{
    console.log("PAUSE Button Clicked");
    if (isTimerActive == 1 && isTimerPaused == 0) //You should not be able to pause when it is already paused
    {
        isTimerPaused = 1;
        localStorage.setItem("isTimerPaused", 1);
        StopTimer();
        LogEndOfTimer();
        localStorage.setItem("LastDate", null);//Timer did not previously exist
    }
});
stopButtonInstance.addEventListener('click',function ()
{
    console.log("STOP Button Clicked");
    LogEndOfTimer(); //Create a comment detailing end timer stats
    StopTimer();
    ResetTimerValues();//Reset the timer
});
if (closeIssueButton != null)
{
    closeIssueButton.addEventListener('click',function () //Potentially overrides original functionality, needs testing
    {
        console.log("CLOSE ISSUE button Clicked");
        LogEndOfTimer();
        StopTimer();
        ResetTimerValues();
    });
}
else
{
    console.log("CloseIssue button is null"); //error handling
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
function LogTime()
{
    var commentBlockId = localStorage.getItem("TimerLogDestId");
    var commentBlock = document.getElementById(commentBlockId);
    var commentTextArea = commentBlock.getElementsByTagName("textarea")[0];
    var submitEditButton = commentBlock.getElementsByClassName("Button--primary Button--medium Button")[0];
    commentTextArea.textContent += "\nStart Date: " + new Date() + "\nTimer Start Value: " + totalTimeString;
    submitEditButton.click();
    window.location.reload();//reload the page to submit the comment
    startButtonInstance.scrollIntoView({behavior: 'instant'});//Manually move the user back to the timer to give the illusion that this app isn't coded like crap









    
    if (commentButton != null) //Make sure comment button is not null
    {
        textArea.textContent = "Start Date: " + new Date() + "\nTimer Start Value: " + totalTimeString; //Set the comment's text value
        console.log(totalTimeString);
        commentButton.disabled = false; //The button is naturally disabled for input, we need to change that
        console.log("Disabled");
        commentButton.click(); //Click the button programmatically
        console.log("Clicked");
        window.location.reload();//reload the page to submit the comment
        startButtonInstance.scrollIntoView({behavior: 'instant'});//Manually move the user back to the timer to give the illusion that this app isn't coded like crap
    }
    else 
    {
        console.log("Comment Button is null");//uh oh where'd our button go
    }
    //
}
function LogEndOfTimer()
{
    //see LogTimer()
    console.log(commentParent.tagName);
    console.log(commentParent.querySelectorAll(".btn-primary btn").tagName);
    if (commentButton != null)
    {
        textArea.textContent = "End Date: " + new Date() + "\nTimer End Value: " + totalTimeString;
        console.log(totalTimeString);
        commentButton.disabled = false;
        console.log("Disabled");
        commentButton.click();
        console.log("Clicked");
        window.location.reload();
        startButtonInstance.scrollIntoView({behavior: 'instant'});
    }
    else
    {
        console.log("Comment Button is null when attempting to end timer");
    }
}
function ResetTimerValues()
{
    //Resets everything to nothing
    totalSeconds +=1;
    sec = 0;
    min = 0;
    hour = 0;
    secString = "00";
    minString = "00";
    hourString = "00";
    dayString = "00";
    timerDisplayInstance.textContent = "00:00:00:00";
    ResetLocalStorage();
}
function GetLocalStorage() //checks records if they are null, sets their respective values in the code
{
    console.log("Set Local Storage");
    if (localStorage.getItem("CurrentTime") != null)//Checks the record
    {
        sec = localStorage.getItem("CurrentTime"); //Set the seconds to the total seconds elapsed before the stop
        console.log("Local CurrentTime: " + sec);
    }
    else
    {
        localStorage.setItem("CurrentTime", 0); //Should always be a nonnullvalue
        sec = 0;
        console.log("Current time equals null, uh oh, reseting");
    }
    if (localStorage.getItem("isTimerPaused") != null)
    {
        isTimerPaused = localStorage.getItem("isTimerPaused");
        console.log("Local IsTimerPaused: " + isTimerPaused);
    }
    else
    {
        isTimerPaused = localStorage.setItem("isTimerPaused", 0);
        isTimerPaused = 0;
    }
    if (localStorage.getItem("isTimerActive") != null)
    {
        isTimerActive = localStorage.getItem("isTimerActive");
        console.log("Local IsTimerActive: " + isTimerActive);
    }
    else
    {
        isTimerActive = localStorage.setItem("isTimerActive", 0);
        isTimerActive = 0;
    }
    if (localStorage.getItem("LastDate") != null)
    {
        lastDate = localStorage.getItem("LastDate");
    }
    else
    {
        lastDate = Date();//just set the last date as right now
        console.log("Last date does not exist");
    }

}
function ResetLocalStorage()
{
    localStorage.setItem("CurrentTime", 0);//seconds
    localStorage.setItem("isTimerPaused", 0);//unpaused
    localStorage.setItem("isTimerActive", 0);//not active
    localStorage.setItem("LastDate", null);//Timer did not previously exist
}
function FindUserTimerLog(user)
{
    var isLogFound = 0;
    var commentNum = 0;
    var comments = document.getElementsByClassName("TimelineItem js-comment-container");
    for (const comment of comments)
    {
        var commentHeaderElement = comment.getElementsByClassName("author Link--primary text-bold css-overflow-wrap-anywhere ")[0]
        var commentHeader = commentHeaderElement.textContent;
        if (commentHeader == user)
        {
            commentText = comment.getElementsByClassName("d-block comment-body markdown-body  js-comment-body")[0].getElementsByTagName("p")[0];
            if (commentText.textContent.includes("Ralph"))
            {
                console.log("Commentnum: " + commentNum);
                console.log("WE GOT EEEEEM");
                isLogFound = 1;
                commentId = document.getElementsByClassName("js-comment-update")[commentNum].id;
                console.log(commentId);
                localStorage.setItem("TimerLogDestId", commentId);
            }
        }
        commentNum = Number(commentNum) + 1;
    }
    return isLogFound;
}
function CreateUserTimerLog(user)
{
    if (commentButton != null) //Make sure comment button is not null
    {
        console.log("CREATEUSERTIMERLOG");
        textArea.textContent = "Ralph";
        console.log("Creating new time log for user: " + user);
        commentButton.disabled = false; //The button is naturally disabled for input, we need to change that
        console.log("Disabled");
        commentButton.click(); //Click the button programmatically
        console.log("Clicked");
        window.location.reload();//reload the page to submit the comment
        startButtonInstance.scrollIntoView({behavior: 'instant'});//Manually move the user back to the timer to give the illusion that this app isn't coded like crap
        FindUserTimerLog(user);
    }
    else
    {
        console.log("Comment button does not exist. Logging failed");
    }
}
//beforeunload
