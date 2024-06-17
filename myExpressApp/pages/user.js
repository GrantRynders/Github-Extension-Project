import Chart from 'chart.js/auto';
import { getRelativePosition } from 'chart.js/helpers';

// const chart = new Chart(ctx, {
//   type: 'line',
//   data: data,
//   options: {
//     onClick: (e) => {
//       const canvasPosition = getRelativePosition(e, chart);

//       // Substitute the appropriate scale IDs
//       const dataX = chart.scales.x.getValueForPixel(canvasPosition.x);
//       const dataY = chart.scales.y.getValueForPixel(canvasPosition.y);
//     }
//   }
// });

async function ModelData()
{
    const data = await GetData();
    var destinationDiv = document.getElementsByTagName("body")[0];
    for (const key in data)
    {
        var objectLink = document.createElement("a");
        objectLink.textContent(key + ": " + obj[key]);
        objectLink.href("")
        destinationDiv.appendChild
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
            console.log("New timer was unable to save");
    });
    return returnData;
}
