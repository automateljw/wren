'use strict';

var App = App || {};
App.Views = App.Views || {};

App.Views.AppView = Backbone.View.extend({
  el: $('body'),

  initialize: function() {
    var self = this;

    // Initialize Collections
    this.exchangeCollection = new App.Collections.Exchanges();

    this.exchangeCollection.fetch()
      .done(function() {
        self.exchangeCollection.each(function(exchange) {
          console.log(exchange.toJSON());
        });
        self.toggleLoadingSpinner();
        self.$el.find('section.main .container').append(self.chartView.render().el);
      })
      .error(function(err) {
        self.showErrorView(err);
      });

    // Initialize SubViews
    this.navBarView = new App.Views.NavBarView();
    this.sideBarView = new App.Views.SideBarView();
    this.footerView = new App.Views.FooterView();
    this.chartView = new App.Views.ChartView({exchangeCollection: this.exchangeCollection});
    this.loadingSpinnerView = new App.Views.LoadingSpinnerView();
    this.errorView = new App.Views.ErrorView();

    this.render();

    // Event Listeners
    this.chartView.on('fetchError', this.showErrorView, this);
  },

  render: function() {
    this.$el.find('section.main').prepend(this.navBarView.render().el);
    this.$el.find('section.main').append(this.sideBarView.render().el);
    this.$el.find('section.main').append(this.footerView.render().el);
    this.$el.find('section.main .container').append(this.loadingSpinnerView.render().el);

    // Move header up (out of window)
    $('.topbar').css({top: '-1000px'});
    $('footer.pageFooter').css({bottom: '-1000px'});
    $('.topbar').animate({top: '0px'}, 1000);
    $('footer.pageFooter').animate({bottom: '0px'}, 1000);
  },

  toggleLoadingSpinner: function() {
    $(this.loadingSpinnerView.el).toggleClass('hidden');
  },

  showErrorView: function() {
    $(this.sideBarView.el).hide();
    $(this.chartView.el).hide();
    $(this.loadingSpinnerView.el).hide();

    this.$el.find('section.main .container').append(this.errorView.render().el);
  }
});