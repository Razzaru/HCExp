var app = angular.module('cashier', ['chart.js', 'ui.router', 'ui-notification']);

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
};

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
};

app.directive('statistics', Statistics);

function Statistics() {
    return {
        restrict: 'E',
        templateUrl: '/templates/statistics.html',
        priority: 1001,
        scope: false,
        controller: CashierController,
        controllerAs: 'cashier'
    };
};


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
};

app.directive('loading', Loading);

function Loading() {
    return {
        restrict: 'E',
        templateUrl: '/templates/loading.html',
        priority: 1002,
        scope: false,
        controller: CashierController,
        controllerAs: 'cashier'
    };
};

app.directive('login', Login);

function Login() {
    return {
        restrict: 'E',
        templateUrl: '/templates/login.html',
        priority: 1002,
        controller: CashierController,
        controllerAs: 'cashier'
    };
};

app.filter('reverse', function () {
    return function (items) {
        return items.slice().reverse();
    };
});


app.controller('CashierController', CashierController);

function CashierController($http, CashierService, Notification) {

    var self = this;
    this.isShowed = false;
    this.now = new Date();
    this.date = this.now;
    this.showFirst = true;
    this.filteredItems;
    this.gains = CashierService.getGains();
    this.spendingItems = CashierService.getSpendingItems();
    this.monthMoney = CashierService.getMonthMoney();
    this.categories = [
        { name: "Еда" },
        { name: "Проезды" },
        { name: "Алкоголь" },
        { name: "Электроника" },
        { name: "Мебель" },
        { name: "Посуда" },
        { name: "Другое" }
    ];

    CashierService.reset();

    this.getItems = function (date) {
        var items = [];
        for (var i = 0; i < this.spendingItems.length; i++) {
            if (new Date(Date.parse(this.spendingItems[i].date)).getDate() === date.getDate()) {
                if (new Date(Date.parse(this.spendingItems[i].date)).getMonth() === date.getMonth()) {
                    items.push(this.spendingItems[i]);
                }
            }
        }
        return items;
    };

    this.addMonthMoney = function () {
        this.monthMoney += parseInt(this.addMoney);
        localStorage.setItem('monthMoney', this.monthMoney);
    };

    this.addGain = function () {
        if (this.addMoney !== null && this.addMoney != '') {
            console.log(this.addMoney)
            var date = new Date();

            this.gains.push({
                id: (this.gains.length) + 1,
                name: self.addName,
                price: self.addMoney,
                date: date
            });

            var tmp = JSON.stringify(this.gains);
            localStorage.removeItem('gains');
            localStorage.setItem('gains', tmp);
            Notification.success({message: 'Запись успешно добавлена', delay: 1500});
        }
    };

    this.dayCount = function () {
        var count = 0;
        for (var i = 0; i < this.getItems(this.date).length; i++) {
            count += parseInt(this.getItems(this.date)[i].price);
        }
        return count;
    };

    this.dayCountParam = function (date) {
        var count = 0;
        for (var i = 0; i < this.getItems(date).length; i++) {
            count += parseInt(this.getItems(date)[i].price);
        }
        return count;
    }

    this.setActive = function (date) {
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

    this.clearAll = function () {
        localStorage.clear();
        window.location.reload(false);
    };

    this.refreshMonthMoney = function () {
        localStorage.setItem('monthMoney', this.monthMoney);
        window.location.reload(false);
    };

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
        for (var i = 0; i <= 5; i++) {
            var date = new Date();
            var dd = date.getDate();
            date.setDate(dd - i);
            dates.push(date);
        }
        return dates;
    };

    this.setNewActiveDates = function (int) {
        if (localStorage.getItem('offset') != null) {
            int += parseInt(localStorage.getItem('offset'))
        }
        var dates = [];
        for (var i = int; i <= int + 5; i++) {
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

        return this.totalPrice() / percent;
    }

    var p = this.percentage();

    this.percents = p;

    this.addItem = function () {
        if (this.price !== undefined && this.price != '') {
            var date = new Date();

            this.spendingItems.push({
                id: (this.spendingItems.length) + 1,
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
            Notification.success({message: 'Запись успешно добавлена', delay: 1500});
        } else {
            return;
        }
    };

    this.deleteItem = function (item, isGain) {
        if (isGain === true) {
            this.monthMoney -= parseInt(item.price);
            localStorage.setItem('monthMoney', this.monthMoney);
            this.gains = this.gains.filter(function (obj) {
                return obj.id != item.id;
            });
            var tmp = JSON.stringify(this.gains);
            localStorage.setItem('gains', tmp);
        } else {
            this.spendingItems = this.spendingItems.filter(function (obj) {
                return obj.id != item.id;
            });
            var tmp = JSON.stringify(this.spendingItems);
            localStorage.setItem('spendingItems', tmp);
        }
        Notification.warning({message: 'Запись успешно удалена', delay: 1500});
    }

    this.labels = this.strDates.reverse();
    this.series = ['Потрачено денег'];
    this.data = [this.counts().reverse()];
    this.datasetOverride = [{ yAxisID: 'y-axis-1' }];
    this.options = {
        scales: {
            yAxes: [{
                id: 'y-axis-1',
                type: 'linear',
                display: true,
                position: 'left'
            }]
        }
    };

    this.getLastMonth = function () {
        var arr = [];
        for (var i = 1; i <= 31; i++) {
            var date = new Date();
            var dd = date.getDate();
            date.setDate(dd - i);
            arr.push(date.toLocaleDateString());
        }
        return arr;
    };

    this.checkAuth = function() {
        if(this.username != 'razzaru' && this.password !== 'D234znL50C') {
            Notification.error({message: 'Неверный пользователь или пароль', delay: 2000});
        } else {
            sessionStorage.setItem('auth', 'on');
            CashierService.checkAuth = true;
        }    
    }

    this.getError = function() {
        return CashierService.flashError;
    }

    window.onunload = function () {
        localStorage.removeItem('offset');
        return '';
    };
}

app.service('CashierService', CashierService);

function CashierService() {

    //this.checkAuth = sessionStorage.getItem('auth') == 'on' ? true : false;

    this.getGains = function () {
        if (localStorage.getItem('gains') != null) {
            return JSON.parse(localStorage.getItem('gains'));
        } else {
            return [];
        }
    }

    this.getSpendingItems = function () {
        if (localStorage.getItem('spendingItems') != null) {
            return JSON.parse(localStorage.getItem('spendingItems'));
        } else {
            return [];
        }
    }

    this.getMonthMoney = function () {
        if (localStorage.getItem('monthMoney') != null) {
            return parseInt(localStorage.getItem('monthMoney'));
        } else {
            return 0;
        }
    }

    this.reset = function () {
        var now = new Date();
        if (now.getDate() === 1) {
            if (localStorage.getItem('isReseted') == null) {
                localStorage.clear();
                localStorage.setItem('isReseted', 'true');
            }
        }

        if (now.getDate() === 2) {
            localStorage.removeItem('isReseted');
        }
    }
}