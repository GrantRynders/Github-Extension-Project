
var destinationDiv = document.getElementById("partial-discussion-sidebar");
//var timerDiv = document.createElement(div);
var startButton = document.createElement('button');
startButton.textContent = "<";
var pauseButton = document.createElement('button');
pauseButton.textContent = "||"
var stopButton = document.createElement('button');
stopButton.textContent = "X";
var timerDisplay = document.createElement('h1');
timerDisplay.textContent = "DD:HH:MM:SS";
var sec = 0;
var min = 0;
var hour = 0;
var day = 0;
var secString;
var minString;
var hourString;
var dayString;
var timer;
var isTimerActive = 0;
function startTimer(){
    isTimerActive = 1;
    //hh:MM:SS
    timer = setInterval(function(){
        sec +=1;
        console.log('Second: ' + sec);
        
        if (sec >= 60)
        {
            min += 1;
            sec -= 60;
        }
        secString = sec;
        if (sec < 10)
        {
            secString = "0" +sec;
        }
        if (min >= 60)
        {
            hour += 1;
            min -= 60;
        }
        minString = min
        if (min < 10)
        {
            minString = "0" + min;
        }
        hourString = hour;
        if (hour < 10)
        {
            hourString = "0" + hour;
        }
        if (hour >= 24)
        {
            day += 1;
            hour -= 24;
        }
        if (day >= 99)
        {
            StopTimer()
            timerDisplay.textContent("Max Value Reached");
        }
        timerDisplay.textContent = hourString + ':' + minString + ':' + secString;
    }, 1000);
}
function StopTimer()
{
    isTimerActive = 0;
    clearInterval(timer);
}
startButton.addEventListener('click',function ()
{
    console.log("Start Butt on Clicked")
    if (isTimerActive == 0)
    {
        startTimer()
    }
    
}); 
pauseButton.addEventListener('click',function ()
{
    console.log("PAUSE Button Clicked");
    StopTimer();
}); 
stopButton.addEventListener('click',function ()
{
    console.log("STOP Button Clicked");
    sec = 0;
    min = 0;
    hour = 0;
    StopTimer();
});
destinationDiv.appendChild(timerDisplay);
destinationDiv.appendChild(startButton);
destinationDiv.appendChild(pauseButton);
destinationDiv.appendChild(stopButton);
destinationDiv.appendChild(timerDiv);
console.Log('Child appended');