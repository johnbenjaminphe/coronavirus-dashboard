// @flow

import React from 'react';
import type { ComponentType } from 'react';
import { Line } from 'react-chartjs-2';

import type { Props } from './LineChart.types';
import * as Styles from './LineChart.styles';

const LineChart: ComponentType<Props> = ({ header, tooltipText, data }: Props) => {

  return (
    <Styles.Container>
      <span className="govuk-heading-s">{header}</span>
      <Styles.Chart>
        <Line
          data={{
            labels: data.map(d => d.date),
            datasets: [{
              borderWidth: 2,
              borderColor: '#249184',
              pointBorderColor: '#249184',
              pointBackgroundColor: '#fff',
              pointBorderWidth: 3,
              pointHoverRadius: 5,
              pointHoverBackgroundColor: '#249184',
              pointHoverBorderColor: '#249184',
              pointHoverBorderWidth: 5,
              pointRadius: 1,
              pointHitRadius: 10,
              data: data.map(d => d.value),
            }]
          }}
          legend={{ display: false }}
          options={{
            maintainAspectRatio: false,
            scales: {
              xAxes: [{
                type: 'time',
                time: {
                  displayFormats: {
                    quarter: 'MMM YYYY'
                  },
                },
                gridLines: {
                  display: false,
                },
                ticks: {
                  autoSkip: true,
                  maxTicksLimit: 15
                },
              }],
              yAxes: [{
                gridLines: {
                  drawBorder: false,
                },
              }],
            },
            tooltips: {
              // Disable the on-canvas tooltip
              enabled: false,

              custom: function (tooltipModel) {
                // Tooltip Element
                var tooltipEl = document.getElementById('chartjs-tooltip');

                // Create element on first render
                if (!tooltipEl) {
                  tooltipEl = document.createElement('div');
                  tooltipEl.id = 'chartjs-tooltip';
                  tooltipEl.innerHTML = '<table style="background-color: #000; color: #fff; border-radius: 5px; padding: 2px; opacity: 0.8"></table>';
                  document.body.appendChild(tooltipEl);
                }

                // Hide if no tooltip
                if (tooltipModel.opacity === 0) {
                  tooltipEl.style.opacity = 0;
                  return;
                }

                // Set caret Position
                tooltipEl.classList.remove('above', 'below', 'no-transform');
                if (tooltipModel.yAlign) {
                  tooltipEl.classList.add(tooltipModel.yAlign);
                } else {
                  tooltipEl.classList.add('no-transform');
                }

                function getBody(bodyItem) {
                  return bodyItem.lines;
                }

                // Set Text
                if (tooltipModel.body) {
                  var titleLines = tooltipModel.title || [];
                  var bodyLines = tooltipModel.body.map(getBody);

                  var innerHtml = '<thead>';

                  titleLines.forEach(function (title) {
                    innerHtml += '<tr><th style="text-align: left;">' + title + '</th></tr>';
                  });
                  innerHtml += '</thead><tbody>';

                  bodyLines.forEach(function (body, i) {
                    const val = parseInt(body).toLocaleString();
                    var colors = tooltipModel.labelColors[i];
                    var style = 'background:' + colors.backgroundColor;
                    style += '; border-color:' + colors.borderColor;
                    style += '; border-width: 2px';
                    var span = '<span style="' + style + '"></span>';
                    innerHtml += '<tr><td>' + span + val + ' ' + [tooltipText] + '</td></tr>';
                  });
                  innerHtml += '</tbody>';

                  var tableRoot = tooltipEl.querySelector('table');
                  tableRoot.innerHTML = innerHtml;
                }

                // `this` will be the overall tooltip
                var position = this._chart.canvas.getBoundingClientRect();

                // Display, position, and set styles for font
                tooltipEl.style.opacity = 1;
                tooltipEl.style.position = 'absolute';
                tooltipEl.style.left = position.left + window.pageXOffset + tooltipModel.caretX + 'px';
                tooltipEl.style.top = position.top + window.pageYOffset + tooltipModel.caretY + 'px';
                tooltipEl.style.fontFamily = tooltipModel._bodyFontFamily;
                tooltipEl.style.fontSize = tooltipModel.bodyFontSize + 'px';
                tooltipEl.style.fontStyle = tooltipModel._bodyFontStyle;
                tooltipEl.style.padding = tooltipModel.yPadding + 'px ' + tooltipModel.xPadding + 'px';
                tooltipEl.style.pointerEvents = 'none';
              }
            }
          }}
        />
      </Styles.Chart>
    </Styles.Container>
  );
};

export default LineChart;
