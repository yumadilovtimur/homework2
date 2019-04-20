import 'babel-polyfill';
import Chart from 'chart.js';

const meteoURL = '/xml.meteoservice.ru/export/gismeteo/point/140.xml';

const getXml = url => {
  const parser = new DOMParser();

  return fetch(url, {
    method: 'GET',
    Accept: 'application/xml',
    headers: new Headers({
      'content-type': 'application/x-www-form-urlencoded',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT',
      'Access-Control-Allow-Headers': 'Content-Type'
    }),
    mode: 'no-cors'
  })
    .then(response => response.text())
    .then(response => parser.parseFromString(response, 'text/xml'));
};

const loadTemperature = async () => {
  const meteoXml = await getXml(meteoURL);

  const real = meteoXml.querySelectorAll('TEMPERATURE');
  const perceived = meteoXml.querySelectorAll('HEAT');

  const result = {
    realTemperature: {},
    perceivedTemperature: {}
  };

  const addData = (nodes, data) => {
    [...nodes].forEach(item => {
      const temp = item.getAttribute('max');
      const hour = `${item.parentNode.getAttribute('hour')}:00`;
      data[hour] = temp;
    });
  };

  addData(real, result.realTemperature);
  addData(perceived, result.perceivedTemperature);

  return result;
};

const buttonBuild = document.getElementById('btn');
const canvasCtx = document.getElementById('out').getContext('2d');

buttonBuild.addEventListener('click', async () => {
  const tempData = await loadTemperature();

  const timeKeys = Object.keys(tempData.realTemperature);
  const realTemp = timeKeys.map(key => tempData.realTemperature[key]);
  const perceivedTemp = timeKeys.map(key => tempData.perceivedTemperature[key]);

  const chartConfig = {
    type: 'line',
    data: {
      labels: timeKeys,
      datasets: [
        {
          label: 'Температура',
          backgroundColor: 'rgb(173, 243, 19)',
          borderColor: 'rgb(62, 90, 0)',
          pointBackgroundColor: 'rgb(241, 253, 215)',
          data: realTemp,
          borderJoinStyle: 'round',
          borderWidth: 2,
          pointHoverBorderWidth: 4,
          lineTension: 0.4,
          pointRadius: 6,
          pointHoverRadius: 7,
          pointStyle: 'rectRounded'
        },
        {
          label: 'Температура по ощущениям',
          backgroundColor: 'rgb(14, 176, 176)',
          borderColor: 'rgb(0, 57, 57)',
          pointBackgroundColor: 'rgb(205, 241, 241',
          data: perceivedTemp,
          borderDash: [10, 5],
          borderJoinStyle: 'round',
          borderWidth: 2,
          pointHoverBorderWidth: 4,
          lineTension: 0.4,
          pointRadius: 6,
          pointHoverRadius: 7,
          pointStyle: 'rectRounded'
        }
      ]
    },
    options: {
      legend: {
        position: 'right',
        labels: {
          fontSize: 14,
          fontColor: 'black',
          boxWidth: 30,
          padding: 30
        }
      },
      animation: {
        duration: 1500,
        easing: 'easeInOutElastic'
      },
      title: {
        display: true,
        text: 'График погоды в Уфе',
        fontSize: 16
      },
      scales: {
        yAxes: [
          {
            scaleLabel: {
              display: true,
              labelString: 'Температура, °C',
              fontColor: 'black',
              fontSize: 14
            }
          }
        ],
        xAxes: [
          {
            scaleLabel: {
              display: true,
              labelString: 'Местное время',
              fontColor: 'black',
              fontSize: 14
            }
          }
        ]
      }
    }
  };

  if (window.chart) {
    chart.data.labels = chartConfig.data.labels;
    chart.data.datasets[0].data = chartConfig.data.datasets[0].data;
    chart.update({
      duration: 800,
      easing: 'easeOutBounce'
    });
  } else {
    window.chart = new Chart(canvasCtx, chartConfig);
  }
});
