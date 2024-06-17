import Chart from 'chart.js/auto';
import { getRelativePosition } from 'chart.js/helpers';

async function ModelData()
{
    const data = await GetData();
    var destinationDiv = document.getElementsByTagName("body")[0];
    for (const key in data)
    {
        var objectLink = document.createElement("a");
        objectLink.textContent(key + ": " + obj[key]);
        if (key = "id")
        {
            objectLink.href("http://localhost:5220/usermodel/" + obj[key]);
        }
        destinationDiv.appendChild(objectLink);
    }
}
async function GetData()
{
    const returnData = await fetch("http://localhost:5220/user", {
        method: "GET", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, *cors, same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, *same-origin, omit
        headers: {
            "Content-Type": "application/json",
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: "follow", // manual, *follow, error
        referrerPolicy: "no-referrer",
    })
    .catch( function() {
            console.log("Unable to fetch users");
    });
    return returnData;
}

async function DrawUserTimeSpentGraph() 
{
  const chartData = await fetch("http://localhost:5220/usermodel/" + userId + "/timespent", {
    method: "GET", // *GET, POST, PUT, DELETE, etc.
    mode: "cors", // no-cors, *cors, same-origin
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    credentials: "same-origin", // include, *same-origin, omit
    headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: "follow", // manual, *follow, error
    referrerPolicy: "no-referrer",
})
  .catch( function() {
        console.log("Unable to fetch user graph data");
  });

  new Chart(
    document.getElementById('acquisitions'),
    {
      type: 'bar',
      data: {
        labels: data.map(row => row.year),
        datasets: [
          {
            label: 'Time spent by user by period',
            data: data.map(row => row.count)
          }
        ]
      }
    }
  );
}
