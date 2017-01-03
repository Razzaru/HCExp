var app = angular.module('cashier', ['chart.js']);

app.directive('mainApp', MainApp);

function MainApp() {
    return {
        restrict: 'E',
        templateUrl: '/templates/main-app.html',
        priority: 9999,
        scope: {},
        controller: CashierController,
        controllerAs: 'cashier'
    };
}
;

app.directive('spendingItem', SpendingItem);

function SpendingItem() {
    return {
        restrict: 'E',
        templateUrl: '/templates/spending-item.html',
        priority: 1001,
        scope: {},
        controller: CashierController,
        controllerAs: 'cashier'
    };
}
;

app.directive('statistics', Statistics);

function Statistics() {
    return {
        restrict: 'E',
        templateUrl: '/templates/statistics.html',
        priority: 1001,
        scope: true,
        controller: CashierController,
        controllerAs: 'cashier'
    };
}
;


app.directive('dateSum', DateSum);

function DateSum() {
    return {
        restrict: 'E',
        templateUrl: '/templates/date-sum.html',
        priority: 1002,
        scope: false,
        controller: CashierController,
        controllerAs: 'cashier'
    };
}
;

app.filter('reverse', function() {
    return function(items) {
        return items.slice().reverse();
    };
});


app.controller('CashierController', CashierController);

function CashierController($http) {

    var self = this;

    this.categories = [
        {name: "Еда"},
        {name: "Проезды"}, 
        {name: "Алкоголь"},
        {name: "Электроника"},
        {name: "Мебель"},
        {name: "Посуда"},
        {name: "Другое"}
    ];

    this.isShowed = false;

    this.now = new Date();

    this.date = this.now;

    this.active = this.now;

    this.showFirst = true;

    this.log = function () {
        console.log(this.date);
    }

    this.filteredItems;

    if (localStorage.getItem('gains') != null) {
        this.gains = JSON.parse(localStorage.getItem('gains'));
    } else {
        this.gains = [];
    }

    if (localStorage.getItem('spendingItems') != null) {
        this.spendingItems = JSON.parse(localStorage.getItem('spendingItems'));
    } else {
        this.spendingItems = [];
    }

    if (localStorage.getItem('monthMoney') != null) {
        this.monthMoney = parseInt(localStorage.getItem('monthMoney'));
    } else {
        this.monthMoney = 0;
    }

    if (this.now.getDate() === 1) {
        if (localStorage.getItem('isReseted') == null) {
            localStorage.clear();
            localStorage.setItem('isReseted', 'true');
        }
    }

    if (this.now.getDate() === 2) {
        localStorage.removeItem('isReseted');
    }

    this.getItems = function (date) {
        var items = [];
        for(var i = 0; i<this.spendingItems.length;i++) {
            if(new Date(Date.parse(this.spendingItems[i].date)).getDate() === date.getDate()) {
                if(new Date(Date.parse(this.spendingItems[i].date)).getMonth() === date.getMonth()) {
                    items.push(this.spendingItems[i]);
                }
            }
        }
        return items;
    };
    
    this.addMonthMoney = function () {
        this.monthMoney += parseInt(this.addMoney);
        localStorage.setItem('monthMoney', this.monthMoney);
    }

    this.addGain = function () {
        var date = new Date();

        this.gains.push({
            name: self.addName,
            price: self.addMoney,
            date: date
        });

        var tmp = JSON.stringify(this.gains);
        localStorage.removeItem('gains');
        localStorage.setItem('gains', tmp);
    }

    this.dayCount = function () {
        var count = 0;
        for(var i = 0; i<this.getItems(this.date).length;i++) {
            count += parseInt(this.getItems(this.date)[i].price);
        }
        return count;
    }

    this.dayCountParam = function (date) {
        var count = 0;
        for(var i = 0; i<this.getItems(date).length;i++) {
            count += parseInt(this.getItems(date)[i].price);
        }
        return count;
    }

    this.setActive = function(date) {
        this.active = date;
        this.filteredItems = this.getItems(date);
    }

    this.totalPrice = function () {
        var total = 0;
        for (var i = 0; i < this.spendingItems.length; i++) {
            total += parseInt(this.spendingItems[i].price);
        }
        return total;
    };
    var i = this.totalPrice();

    this.total = i;

    this.clearAll = function () {
        localStorage.clear();
        window.location.reload(false);
    }

    this.refreshMonthMoney = function () {
        localStorage.setItem('monthMoney', this.monthMoney);
        window.location.reload(false);
    }

    this.countCat = function (cat) {
        var total = 0;
        for (var i = 0; i < this.spendingItems.length; i++) {
            if (this.spendingItems[i].category == cat) {
                total += parseInt(this.spendingItems[i].price);
            }
        }
        return total;
    };

    this.lastSixDays = function () {
        var dates = [];
        for(var i = 0; i<=5; i++) {
            var date = new Date();
            var dd = date.getDate();
            date.setDate(dd - i);
            dates.push(date);
        }
        return dates;
    };

    this.setNewActiveDates = function (int) {
        if(localStorage.getItem('offset') != null) {
            int += parseInt(localStorage.getItem('offset'))
        }
        var dates = [];
        for(var i = int; i<=int+5; i++) {
            var date = new Date();
            var dd = date.getDate();
            date.setDate(dd - i);
            dates.push(date);
        }
        if (int !== 0) {
            localStorage.setItem('offset', int);
        } else {
            localStorage.removeItem('offset');
        }
        this.offset = localStorage.getItem('offset');
        this.dates = dates;
    };

    window.onunload = function() {
        localStorage.removeItem('offset');
        return '';
    };


    this.dates = this.lastSixDays();
    
    this.strDates = this.dates.map(function (item) {
        return item.toLocaleDateString();
    })
    
    this.counts = function () {
        var dates = this.dates.slice(0);
        var data = dates.map(function (item) {
            return self.dayCountParam(item);
        })
        return data;
    }

    this.percentage = function () {
        var percent = this.monthMoney / 100;

        return this.totalPrice()/percent;
    }

    var p = this.percentage();

    this.percents = p;

    this.addItem = function () {

        var date = new Date();

        this.spendingItems.push({
            name: self.name,
            price: self.price,
            category: self.category,
            date: date
        });
        this.isShowed = true;

        this.totalPrice();

        var tmp = JSON.stringify(this.spendingItems);

        localStorage.removeItem('spendingItems');
        localStorage.setItem('spendingItems', tmp);
    }

    this.labels = this.strDates.reverse();
    this.series = ['Потрачено денег'];
    this.data = [this.counts().reverse()];
    this.datasetOverride = [{ yAxisID: 'y-axis-1' }];
    this.options = {
        scales: {
            yAxes: [
                {
                    id: 'y-axis-1',
                    type: 'linear',
                    display: true,
                    position: 'left'
                }
            ]
        }
    };

    this.getLastMonth = function () {
        var arr = [];
        for (var i = 1; i<=31; i++) {
            var date = new Date();
            var dd = date.getDate();
            date.setDate(dd - i);
            arr.push(date.toLocaleDateString());
        }
        return arr;
    }
}
