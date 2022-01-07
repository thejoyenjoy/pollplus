import React, {useEffect, useState} from 'react';
import { HorizontalBar } from 'react-chartjs-2';

const BarChart = ({ optionLabels, optionVotes, title }) => {
  const [chartData, setChartData] = useState({});

  useEffect(() => {
    const backgroundColors = () => {
      if(optionLabels){
        const purple = 'rgba(155, 89, 182,1.0)';
        const yellow = 'rgba(241, 196, 15,1.0)';
        let op = [];
        for (let index = 0; index < optionLabels.length; index++) {
          (index % 2)
            ? op.push(yellow)
            : op.push(purple)
        }
        return op;
      }
    }
    const borderColors = () => {
      if(optionLabels){
        const blackColor = 'rgba(44, 62, 80,1.0)';
        let op =[];
        for (let index = 0; index < optionLabels.length; index++) {
          op.push(blackColor);
        }
        return op;
      }
    }
    const chart = () => {
      setChartData({
        labels: optionLabels,
        datasets: [{
          data: optionVotes,
          borderWidth: 2,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
        }]
      })
    }
    chart();
  }, [optionLabels, optionVotes]);

  return(
    <HorizontalBar 
      data={ chartData }
      height={ 350 }
      options={{
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 1,
        legend: false,
        title: {
          display: true,
          text: (title) ? title : ''
        },
        scales: {
          xAxes: [{
              ticks: {
                  beginAtZero: true,
              }
          }]
        }   
      }}
    />
  )
}

export default BarChart;
