/* global _ */

var App = App || {};
App.Collections = App.Collections || {};
App.Views = App.Views || {};

(function() {
  'use strict';

  App.Views.ChartView = Backbone.View.extend({

    el: $('section.chart'),

    initialize: function(options) {
      _(this).extend(options);

      this.dataSeriesIndexes = {}; // keys are the collection name, values is index

      // Initalize SubViews
      this.infoModalView = new App.Views.InfoModalView();
    },

    render: function() {
      var self = this;
      console.log('Rendering the Chart View...');

      var numVisible = this.exchangeCollection.countVisible();

      if(this.chartOptions.series.length === 0) {
        this.exchangeCollection.each(function(exchange, index) {

          var chartColor = self.chartColors[index % self.chartColors.length];

          var thisSeries = {
            name : exchange.get('site') + ' ' + exchange.get('currency') + ' Bidding Price',
            data : exchange.get('prices').data,
            visible: exchange.get('isVisible'),
            color: chartColor,
            type : 'spline',
            threshold : null,
            yAxis: 0
          };

          // Only set color gradient for BTCChina
          if(exchange.get('site') === 'BTCChina') {
            thisSeries.fillColor = {
              linearGradient : {
                x1: 0,
                y1: 0,
                x2: 0,
                y2: 1
              },
              stops : [[0, chartColor], [1, 'rgba(0,0,0,0)']]
            };
            thisSeries.type = 'areaspline';
          }

          self.chartOptions.series.push(thisSeries);
          self.dataSeriesIndexes[exchange.get('site')] = self.chartOptions.series.length - 1;
        });

        var tweetSeries = {
          name : 'Twitter Sentiment',
          color: '#2980b9',
          data : this.tweetCollection.data,
          dataGrouping: {
            units: this.groupingUnits
          },
          cursor: 'pointer',
          type : 'spline',
          visible: this.tweetCollection.isVisible,
          tooltip: {
            valuePrefix: null,
            valueSuffix: null
          },
          point: {
            events: {
              // Click on a Twitter Sentiment point to show the individual tweets
              click: function() {
                var pointClicked = this;
                self.trigger('showSentimentModal', pointClicked);
              }
            }
          },
          yAxis: 1
        };
        self.chartOptions.series.push(tweetSeries);
        self.dataSeriesIndexes['Twitter'] = self.chartOptions.series.length - 1;
      }

      this.$el.highcharts('StockChart', this.chartOptions);
      this.trigger('showSideBar');
    },

    toggleSeriesVisibility: function(options) {
      var chart = $('.chart').highcharts();

      // locate the correct series
      var seriesIndex = this.dataSeriesIndexes[options.name],
          series = chart.series[seriesIndex],
          isVisible = series.visible;

      series.setVisible(!isVisible, true); // true indicates that chart *should* be redrawn by invoking this function
      this.setChartTitle();
    },

    setChartTitle: function() {
      var self = this,
          chart = $('.chart').highcharts(),
          visibleExchangesArray = [],
          title = '',
          subTitle = '';

      this.exchangeCollection.each(function(exchange) {
        if(exchange.get('isVisible') === true) {
          // locate the correct series
          var seriesIndex = self.dataSeriesIndexes[exchange.get('site')],
              series = chart.series[seriesIndex],
              seriesColor = series.color;

          var html = '<span style="color:' + seriesColor +'">' + exchange.get('site') + ' (' + exchange.get('currency') + ')</span>';

          visibleExchangesArray.push(html);
        }
      });

      if(this.tweetCollection.isVisible === true) {
        subTitle = '<span style="color: #2980b9;">Twitter Sentiment(BTC)</span>';
      }

      if(visibleExchangesArray.length) {
        title = visibleExchangesArray.join(', ') + ' Buy Price';
        if(subTitle.length){
          subTitle = '<span style="text-transform: lowercase">vs</span> ' + subTitle;
        }
      } else if(subTitle.length){
        title = subTitle;
        subTitle = '';
      }

      $('.chart').highcharts().setTitle({text: title}, {text: subTitle});
    },

    groupingUnits: [
      [
        'minute',
        [5, 10, 30]
      ], [
        'hour',
        [1, 3, 6, 12]
      ], [
        'day',
        [1, 3, 7]
      ]
    ],

    chartColors: ['#555', '#16a085', '#d35400', '#555', '#2980b9'],

    chartOptions: {
      series: [],
      title: {
        floating: true,
        text: '<span style="color: #d35400;">BTC China (BTC)</span> Buy Price',
        style: {
          color: '#333',
          font: 'bold 16px "Trebuchet MS", Verdana, sans-serif',
          'font-weight': 'bold',
          'letter-spacing': '0.1em',
          'text-transform': 'uppercase',
          'text-shadow': '0 1px 0 #fff'
        }
      },
      subtitle: {
        floating: true,
        text: '<span style="text-transform: lowercase">vs</span> <span style="color: #2980b9;">Twitter Sentiment (BTC)</span>',
        style: {
          color: '#333',
          font: 'bold 12px "Trebuchet MS", Verdana, sans-serif',
          'font-size': '1.2em',
          'font-weight': 'bold',
          'letter-spacing': '0.1em',
          'text-transform': 'uppercase',
          'text-shadow': '0 1px 0 #fff'
        }
      },
      yAxis: [{ // Primary Axis
        labels: {
          format: '${value}',
          style: {
            color: '#333',
            'font-size': '1.5em'
          }
        },
        lineColor: '#000',
        lineWidth: 1,
        minorTickInterval: 'auto',
        tickColor: '#000',
        tickWidth: 1,
        title: {
          text: 'Buy Price ($USD)',
          style: {
            color: '#222',
            fontFamily: 'Trebuchet MS, Verdana, sans-serif',
            'font-size': '1.3em',
            'font-weight': 'normal',
            'letter-spacing': '0.1em',
            'text-transform': 'uppercase'
          }
        }
      }, {  // Secondary Axis
        labels: {
          style: {
            color: '#333',
            'font-size': '1.5em'
          }
        },
        lineColor: '#000',
        lineWidth: 1,
        minorTickInterval: 'auto',
        opposite: true,
        tickWidth: 1,
        tickColor: '#000',
        title: {
          text: 'Sentiment',
          style: {
            color: '#222',
            font: '11px Trebuchet MS, Verdana, sans-serif',
            'font-size': '1.3em',
            'font-weight': 'normal',
            'letter-spacing': '0.1em',
            'text-transform': 'uppercase'
          }
        }
      }]
    }
  });
})();