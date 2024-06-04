// This javascript will affect the index page
var startButton = document.getElementById("startButton");
var pauseButton = document.getElementById("pauseButton");
var stopButton = document.getElementById("stopButton");
var timerDisplay = document.getElementById("timerDisplay");
var sec = 55;
var min = 0;
var hour = 0;
var secString;
var minString;
var hourString;
var timer;
function startTimer(){
    //hh:MM:SS
    timer = setInterval(function(){
        sec +=1
        console.log('Second: ' + sec)
        
        if (sec >= 60)
        {
            min += 1
            sec -= 60
        }
        secString = sec
        if (sec < 10)
        {
            secString = "0" +sec
        }
        if (min >= 60)
        {
            hour += 1
            min -= 60
        }
        minString = min
        if (min < 10)
        {
            minString = "0" + min
        }
        hourString = hour
        if (hour < 10)
        {
            hourString = "0" + hour
        }
        
        timerDisplay.textContent = hourString + ':' + minString + ':' + secString;
    }, 1000);
}
function StopTimer()
{
    clearInterval(timer);
}
startButton.addEventListener('click',function ()
{
    console.log("Start Button Clicked")
    startTimer()
}); 
pauseButton.addEventListener('click',function ()
{
    console.log("Start Button Clicked");
    startTimer()
}); 
stopButton.addEventListener('click',function ()
{
    console.log("Start Button Clicked");
    StopTimer()
});
//startButton.onclick() = startTimer()