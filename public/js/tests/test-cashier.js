describe('cashier', function () {

    beforeEach(module('cashier'));

    describe('CashierService', function () {
        var storage = {
            gains: '[{"today":"200"}]',
            monthMoney: '222',
            spendingItems: '[{"date":"20.01.2001"}]'
        };
        var CashierService;
        beforeEach(inject(function (_CashierService_) {
            CashierService = _CashierService_;
            spyOn(localStorage, 'getItem').and.callFake(function (key) {
                return storage[key];
            });
            spyOn(localStorage, 'setItem').and.callFake(function (key, value) {
                storage[key] = value;
            })
        }));

        it('fetches all gains', function () {
            expect(CashierService.getGains()).toEqual([{ "today": "200" }]);
        });

        it('fetches all spendingItems', function () {
            expect(CashierService.getSpendingItems()).toEqual([{ "date": "20.01.2001" }]);
        });

        it('fetches monthMoney', function () {
            expect(CashierService.getMonthMoney()).toEqual(222);
        });
    });

    describe('CashierController', function () {
        var storage = {
            gains: '[{"today":"200"}]',
            monthMoney: '222',
            spendingItems: '[{"date":"20.01.2001"}]'
        };
        var CashierController, CashierService, date;

        beforeEach(inject(function (_CashierService_, $controller) {
            CashierService = _CashierService_;
            CashierController = $controller('CashierController', { CashierService: CashierService });
            CashierController.addMoney = 88;

            spyOn(localStorage, 'getItem').and.callFake(function (key) {
                return storage[key];
            });
            spyOn(localStorage, 'setItem').and.callFake(function (key, value) {
                storage[key] = value;
            })
            spyOn(CashierService, 'getGains').and.returnValue([{ "today": "200" }]);
            //spyOn(CashierService, 'getSpendingItems').and.returnValue([{ "date": "20.01.2001" }]);
            spyOn(CashierService, 'getMonthMoney').and.returnValue(222);
            date = new Date(2001, 01, 20);
        }));

        it('checks how addMonthMoney works', function () {
            CashierController.addMonthMoney();
            expect(CashierController.monthMoney).toBe(88);
        })
        
    })
});