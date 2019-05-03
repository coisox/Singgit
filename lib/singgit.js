firebase.initializeApp({
	apiKey: 'AIzaSyBzoSF9md52wOwJ6oTuLj_KFDrOSAoAuhE',
	authDomain: 'singgitfirestore.firebaseapp.com',
	projectId: 'singgitfirestore'
});

firebase.firestore().enablePersistence().then(function() {
	db = firebase.firestore().collection("coisox");

	app = new Vue({
		el: '#singgit',
		data: {
			version_js: 'v190503',
			formTitle: 'New Transaction',
			timelapse: moment().valueOf(),
			loading: true,
			months: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
			accounts: [
				{desc: 'Wallet', adjustorShow: false, adjustorValue: 0},
				{desc: 'Credit Card', adjustorShow: false, adjustorValue: 0},
				{desc: 'BIS', adjustorShow: false, adjustorValue: 0},
				{desc: 'MBB', adjustorShow: false, adjustorValue: 0},
				{desc: 'RHB', adjustorShow: false, adjustorValue: 0},
				{desc: 'THJ', adjustorShow: false, adjustorValue: 0},
				{desc: 'Loan', adjustorShow: false, adjustorValue: 0},
			],
			accounts_balance: {},
			accounts_balance_all: 0,
			categories: ['Food', 'Other', 'Big', 'Transport', 'Vehicle Service', 'Fixed', 'Adjustment', 'Income', 'Transfer', 'Exclude Stat'],
			categories_expenses: {},
			income: 0,
			expenses: 0,
			transactions: [],
			editItem: null,
			favourite: [],
			favouriteLoading: false,
			isFavourite: false,
			isExpenses: true,
			filter_description: '',
			filter_account: '',
			filter_category: '',
			filter_from: '',
			filter_to: '',
			filter_type: '',
			filteredData: [],
			countedCart: [],
			counted: 0,
			limit: 50,
			statFilter: [moment()],
			walletCalculator: {
				actual: 0,
				show: false
			}
		},
		methods: {
			logTimelapse: function(msg) {
				var n = moment().valueOf();
				console.log(msg+': ', n-this.timelapse);
				this.timelapse = n;
			},
			toCurrency: function(n) {
				return new Intl.NumberFormat('en-US', {
					minimumFractionDigits: 2
				}).format(Math.abs(n));
			},
			resetFilter: function() {
				this.filter_description = '';
				this.filter_account = '';
				this.filter_category = '';
				this.filter_from = '';
				this.filter_to = '';
				this.filter_type = '';
			},
			quickFilter: function(category) {
				this.filter_description = '';
				this.filter_account = '';
				this.filter_category = '';
				this.filter_from = this.statFilter[0].format("YYYYMM01");
				this.filter_to = this.statFilter[0].format("YYYYMM31");
				this.filter_type = '';
				
				if(category=='income') {
					this.filter_type = 'income';
				}
				else if(category=='expenses') {
					this.filter_type = 'expenses';
				}
				else {
					this.filter_category = category;
				}
				
				$('.tab-pane, .nav-link').removeClass('active');
				$('#transaction, [href="#transaction"]').addClass('active');
			},
			newTransaction: function() {
				this.editItem = null;
				this.formTitle = 'New Transaction';
				$('#formTransaction')[0].reset();
				$('#date').val(moment().format('YYYY-MM-DD'));
				this.isExpenses = true;
			},
			editTransaction: function(id) {
				var i = 0
				for (i=0; i<this.transactions.length; i++) {
					if(this.transactions[i].id==id) {
						this.editItem = i;
						break;
					}
				}

				this.formTitle = 'New Transaction';

				$('#amount').val(this.transactions[i].amount);
				$('#description').val(this.transactions[i].description);
				$('#account').val(this.transactions[i].account[0]);
				$('#category').val(this.transactions[i].category);
				$('#transfer').val(this.transactions[i].account[1]);
				$('#date').val(moment(this.transactions[i].date).format('YYYY-MM-DD'));
				
				if(this.transactions[i].amount<0) {
					$('#amount').val($('#amount').val() * -1);
					this.isExpenses = true;
				}
				else {
					this.isExpenses = false;
				}
				
				$('.tab-pane, .nav-link').removeClass('active');
				$('#form, [href="#form"]').addClass('active');
			},
			saveTransaction: function() {
				var _this = this;
				
				$('#amount').val($('#amount').val().replace(/,/gi,''));
				try { eval($('#amount').val()) }
				catch(err) { $('#amount').addClass('error'); return false; }
				$('#amount').val(eval($('#amount').val()));
				
				
				//============================================================================= intelligent start
					//transfer
					if($('#transfer').val()!='') { _this.isExpenses = false; $('#amount').val(Math.abs(eval($('#amount').val()))); }
					//reconcile
					else if($('#amount').val()=='') $('#description').val('Reconcile');
					//food
					else if($('#description').val()=='') $('#description').val('Food');
				//============================================================================= intelligent end

				
				var id = moment($('#date').val(), 'YYYY-MM-DD').format('YYYYMMDD')+'_'+(_this.editItem?_this.transactions[_this.editItem].affix:moment().valueOf());
				
				if(_this.isExpenses) $('#amount').val($('#amount').val() * -1);
				
				var fsData = {
					amount: Number($('#amount').val()),
					description: $('#description').val(),
					date: id,
					account: [$('#account').val(), $('#transfer').val()],
					category: $('#category').val()
				};
				
				var inData = {
					account: [$('#account').val(), $('#transfer').val()],
					amount: Number($('#amount').val()),
					category: $('#category').val(),
					date: id.split('_')[0],
					description: $('#description').val(),
					formatteddate: moment($('#date').val(), 'YYYY-MM-DD').format('DD MMM').toUpperCase(),
					id: id
				};
				
				
				//save for editing transaction
				//=======================================================================================
				if(_this.editItem!=null) {
					
					//==================================================== save to firestore
					var batch = firebase.firestore().batch();
					batch.delete(db.doc('transactions').collection('transactions').doc(_this.transactions[_this.editItem].id));
					batch.set(db.doc('transactions').collection('transactions').doc(id), fsData);
					batch.commit();
					
					//==================================================== save to in memory
					console.log(_this.transactions[_this.editItem]);
					console.log(inData);
					Vue.set(_this.transactions, _this.editItem, inData);
					// _this.transactions[_this.editItem] = inData;
				}
				
				//save for new transaction
				//=======================================================================================
				else {
					
					//==================================================== save to firestore
					db.doc('transactions').collection('transactions').doc(id).set(fsData);
					
					//==================================================== save to in memory
					_this.transactions.push(inData);
				}
				
				if(_this.isFavourite) _this.addFavourite();
				if(_this.editItem!=null) {
					$('.tab-pane, .nav-link').removeClass('active');
					$('#transaction, [href="#transaction"]').addClass('active');
				}
				else {
					$('#modalGeneral .modal-body').text('Done');
					$('#modalGeneral').modal('show');
				}
				
				_this.newTransaction();
			},
			saveAsTransaction: function() {
				this.editItem = null;
				this.saveTransaction();
				this.newTransaction();
			},
			deleteTransaction: function() {
				//==================================================== delete at firestore
				db.doc('transactions').collection('transactions').doc(this.transactions[this.editItem].id).delete();
				
				//==================================================== delete in memory
				this.transactions.splice(this.editItem,1);  
				
				//==================================================== clear form after delete
				this.newTransaction();
				
				$('.tab-pane, .nav-link').removeClass('active');
				$('#transaction, [href="#transaction"]').addClass('active');
			},
			addFavourite: function() {
				this.favourite.push({
					"value": $('#description').val(),
					"account": $('#account').val(),
					"category": $('#category').val(),
					"transfer": $('#transfer').val()
				});

				this.saveFavouriteToLocalstorage();
			},
			uploadFavourite: function() {
				var _this = this;
				db.doc('favourite').set({data:_this.favourite}).then(function(){
					$('#modalGeneral .modal-body').text('Done');
					$('#modalGeneral').modal('show');
				});
			},
			mergeFavourite: function() {
				var _this = this;
				_this.favouriteLoading = true;

				db.doc("favourite").get().then(function(querySnapshot) {
					_this.favourite = _this.favourite.concat(querySnapshot.data()['data']);
					for(var i=0; i<_this.favourite.length; i++) _this.favourite[i] = JSON.stringify(_this.favourite[i]);
					_this.favourite = [... new Set(_this.favourite)];
					for(var i=0; i<_this.favourite.length; i++) _this.favourite[i] = JSON.parse(_this.favourite[i]);
					
					_this.saveFavouriteToLocalstorage();
					_this.favouriteLoading = false;
				});
			},
			saveFavouriteToLocalstorage: function() {
				this.favourite.sort(function(a, b){
					if(a.value<b.value) return -1;
					else if(a.value>b.value) return 1;
					else return 0;
				});
				
				localStorage.setItem('SINGGIT_Favourite', JSON.stringify(this.favourite));
				$('#description').autocomplete('setOptions', { lookup: this.favourite });
			},
			deleteFavourite: function(index) {
				this.favourite.splice(index, 1);
				this.saveFavouriteToLocalstorage();
			},
			getHTMLOfSelection: function() {
				var range;
				if(document.selection && document.selection.createRange) {
					range = document.selection.createRange();
					return range.htmlText;
				}
				else if(window.getSelection) {
					var selection = window.getSelection();
					if (selection.rangeCount > 0) {
						range = selection.getRangeAt(0);
						var clonedSelection = range.cloneContents();
						var div = document.createElement('div');
						div.appendChild(clonedSelection);
						return div.innerHTML;
					}
					else {
						return '';
					}
				}
				else {
					return '';
				}
			},
			copyToClipboard: function() {
				this.limit = 999999;
				$('#clipboard').val(
					'DATE	DESCRIPTION	ACC1	ACC2	CATEGORY	AMOUNT\n'+
					this.filteredTransactions.reduce(function(total, item) {
						return total + '\n'+
							item.formatteddate+'	'+
							item.description+'	'+
							item.account[0]+'	'+
							item.account[1]+'	'+
							item.category+'	'+
							item.amount
					}, '')
				);
				$('#clipboard')[0].select();
				document.execCommand('copy');
				this.limit = 50;
				
				$('#modalGeneral .modal-body').text('Copied to clipboard');
				$('#modalGeneral').modal('show');
			},
			fetchTransactions: function() {
				this.loading = true;
				var _this = this;
				if(_this.transactions.length==0) {
					_this.logTimelapse("Firestore query start");
					db.doc("transactions").collection('transactions').orderBy("date", "desc").get().then(querySnapshot => {
						_this.logTimelapse("Firestore query end");
						_this.transactions = [];
						_this.logTimelapse("Transactions loop start");
						querySnapshot.forEach(function(doc) {
							var item = doc.data();
							item.affix = item.date.split('_')[1];
							item.date = item.date.split('_')[0];
							item.formatteddate = moment(item.date).format('DD MMM').toUpperCase();
							item.id = doc.id;
							_this.transactions.push(item);
						});
						_this.loading = false;
						_this.logTimelapse("Transactions loop end");
					});
				}
			},
		},
		computed: {
			filteredTransactions: function() {
				this.logTimelapse("filteredTransactions() start");
				var _this = this;
				var foundReconcile = false;
				
				//================================================= reinitialize
				_this.accounts.forEach(function(item) { _this.accounts_balance[item.desc] = 0; });
				_this.categories.forEach(function(item) { _this.categories_expenses[item] = 0; });
				_this.accounts_balance_all = 0;
				_this.income = 0;
				_this.expenses = 0;

				
				var filtered =  this.transactions.filter(function(item) {
					
					//============================================= overall balance
					if(item.account[1]=='') {
						_this.accounts_balance[item.account[0]] += item.amount;
						_this.accounts_balance_all += item.amount;
					}
					else {
						_this.accounts_balance[item.account[0]] -= item.amount;
						_this.accounts_balance[item.account[1]] += item.amount;
					}

					
					//============================================= monthly stat
					if(item.date.indexOf(_this.statFilter[0].format('YYYYMM'))>-1) {
						
						if(item.account[1]=='' && item.category!='Exclude Stat') {
							//===================================== calculate in/out
							if(item.amount>0) _this.income += item.amount;
							else _this.expenses += item.amount;
						}
						
						if(item.category!='Exclude Stat') {
							_this.categories_expenses[item.category] += item.amount;
						}
					}
					
					//================================================= return filtered transactions
					if(!foundReconcile && item.description == 'Reconcile') {
						foundReconcile = true;
						return true;
					}
					else if(
						(item.formatteddate+','+item.description+','+item.category+','+item.account+','+item.amount.toFixed(2)).toLowerCase().indexOf(_this.filter_description)>-1 &&
						(item.account.indexOf(_this.filter_account)>-1 || _this.filter_account=='') &&
						(item.category==_this.filter_category || _this.filter_category=='') &&
						((item.date>=_this.filter_from || _this.filter_from=='') && (item.date<=_this.filter_to || _this.filter_to=='')) &&
						((item.amount>=0 && _this.filter_type=='income' && item.account[1]=='') || (item.amount<0 && _this.filter_type=='expenses') || _this.filter_type=='')
					)	return true;
					return false;
				});
				
				this.logTimelapse("filteredTransactions() start");
				
				this.logTimelapse("filtered.sort() start");
				filtered.sort(function(a, b) {
					if(a.id == b.id) return 0;
					if(a.id < b.id) return 1;
					if(a.id > b.id) return -1;
				});
				this.logTimelapse("filtered.sort() end");

				return filtered.splice(0, _this.limit);
				
				return [{"account":["Wallet",""],"amount":-111,"category":"Food","date":"20190406","description":"Food","affix":"1554537545394","formatteddate":"06 APR","id":"20190406_1554537545394"}]
			},
		},
		mounted: function() {
			var _this = this;
			_this.logTimelapse("Mounted");
			
			//============================================================================================================== auto fetch transactions for big device
			_this.fetchTransactions();

			//============================================================================================================== fetch favourite
			_this.favourite = JSON.parse(localStorage.getItem('SINGGIT_Favourite')?localStorage.getItem('SINGGIT_Favourite'):'[]');
			$('#description').autocomplete({
				lookup: _this.favourite,
				lookupFilter: function (suggestion, query, queryLowerCase) {
					return suggestion.value.toLowerCase().indexOf(queryLowerCase) === 0;
				},
				onSelect: function (suggestion) {
					$('#description').val(suggestion.value);
					$('#account').val(suggestion.account);
					$('#category').val(suggestion.category);
					$('#transfer').val(suggestion.transfer);
					
					if($('#transfer').val()!='') _this.isExpenses = false;
				},
				formatResult: function(suggestion) {
					return '<div class="mb-2 pb-2 border-bottom">'+suggestion.value+'<br>'+(suggestion.transfer?suggestion.account+' to '+suggestion.transfer:suggestion.account+': <span class="transactionCategory">'+suggestion.category+'</span>')+'</div>';
				}
			});

			
			//============================================================================================================== assign date start
			$('#date').val(moment().format('YYYY-MM-DD'));

			
			//============================================================================================================== modal filter start
			$('#filter_from').change(function(){
				_this.filter_to = $(this).val().slice(0,-2) + moment($(this).val(), 'YYYY-MM-DD').daysInMonth();
			});
			
			
			//============================================================================================================== monitoring clipboard
			$(document).on('input', '#amount', function(event) {
				$(this).val($(this).val().replace(/,| /g, ''));
			});
			
			
			//============================================================================================================== bootstrap tooltip
			$('[data-toggle="tooltip"]').tooltip()
		}
	});
})
.catch(function(err) {
	if (err.code == 'failed-precondition') {
		$('#modalGeneral .modal-body').text('Multiple tabs open, persistence can only be enabled in one tab at a a time');
		$('#modalGeneral').modal('show');
	} else if (err.code == 'unimplemented') {
		$('#modalGeneral .modal-body').text('The current browser does not support all of the features required to enable persistence');
		$('#modalGeneral').modal('show');
	}
});