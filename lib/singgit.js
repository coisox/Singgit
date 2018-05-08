$('#version_js').text('0509E');

firebase.initializeApp({
	apiKey: 'AIzaSyBzoSF9md52wOwJ6oTuLj_KFDrOSAoAuhE',
	authDomain: 'singgitfirestore.firebaseapp.com',
	projectId: 'singgitfirestore'
});

firebase.firestore().enablePersistence().then(function() {
	db = firebase.firestore().collection("coisox");

	singgit = new Vue({
		el: '#singgit',
		data: {
			months: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
			accounts: ['Wallet', 'Credit Card', 'BIS', 'MBB', 'RHB', 'Loan'],
			accounts_balance: {},
			accounts_balance_all: 0,
			categories: ['Food', 'Other', 'Big', 'Transport', 'Vehicle Service', 'Fixed', 'Adjustment', 'Income', 'Transfer'],
			categories_expenses: {},
			income: 0,
			expenses: 0,
			transactions: [],
			editItem: null,
			clusterize: null,
			autoComplete: [],
			statFilter: moment().format('YYYYMM'),
			statFilterDesc: moment().format('MMM YYYY'),
			favourite: false,
			filter_description: '',
			filter_account: '',
			filter_category: '',
			filter_from: '',
			filter_to: '',
			filter_type: ''
		},
		methods: {
			toCurrency: function(n) {
				return new Intl.NumberFormat('en-US', {
					minimumFractionDigits: 2
				}).format(Math.abs(n));
			},
			navigateMonth: function(i) {
				this.statFilter = moment(this.statFilter, 'YYYYMM').add(i, 'months').format('YYYYMM');
				this.statFilterDesc = moment(this.statFilter, 'YYYYMM').format('MMM YYYY');
				this.populateStat();
			},
			resetFilter: function() {
				this.filter_description = '';
				this.filter_account = '';
				this.filter_category = '';
				this.filter_from = '';
				this.filter_to = '';
				this.filter_type = '';
				
				this.clusterize.update(this.populateData());
			},
			quickFilter: function(opt) {
				var statDate = moment(this.statFilter, 'YYYYMM');
				this.filter_description = '';
				this.filter_account = '';
				this.filter_category = '';
				this.filter_from = statDate.format("YYYY-MM-01");
				this.filter_to = statDate.format("YYYY-MM-") + statDate.daysInMonth();
				this.filter_type = '';
				
				if(opt=='income') {
					this.filter_type = 'income';
				}
				else if(opt=='expenses') {
					this.filter_type = 'expenses';
				}
				else {
					this.filter_category = opt;
				}
				
				this.clusterize.update(this.populateData());
				$('.tab-pane, .nav-link').removeClass('active');
				$('#transaction, [href="#transaction"]').addClass('active');
			},
			populateData: function() {
				var data = [];
				var firstReconcile = false;
				for(i=0; i<this.transactions.length; i++) {
					var item = this.transactions[i];

					if(
						(item.description=='Reconcile' && !firstReconcile) ||
						(
							item.description.toLowerCase().indexOf(this.filter_description.toLowerCase())>-1 &&
							(item.account.indexOf(this.filter_account)>-1 || this.filter_account=='') &&
							(item.category==this.filter_category || this.filter_category=='') &&
							((item.date>=this.filter_from.replace(/-/g,'') || this.filter_from=='') && (item.date<=this.filter_to.replace(/-/g,'') || this.filter_to=='')) &&
							((item.amount>=0 && this.filter_type=='income' && item.account[1]=='') || (item.amount<0 && this.filter_type=='expenses') || this.filter_type=='')
						)
					){
						if(item.description=='Reconcile' && !firstReconcile) firstReconcile = true;
						
						data.push(
							'<li class="list-group-item d-flex align-items-center" onclick="singgit.editTransaction('+i+')">'+
								'<div class="transactionDate">'+item.formatteddate+'</div>'+
								(
									item.description=='Reconcile'?
									'<div class="reconcile"></div>'
									:
									'<div class="transactionDescription">'+
										item.description+'<br>'+
										item.account[0]+(item.account[1]==''?': <span class="transactionCategory">'+item.category+'</span>':' <span>to '+item.account[1]+'</span>')+
									'</div>'+
									'<div class="'+(item.amount>=0 && item.account[1]!='Loan'?'positive':'negative')+'">'+
										this.toCurrency(item.amount)+
									'</div>'
								)+
							'</li>'
						)
					}
				}
				return data;
			},
			populateStat: function() {
				var _this = this;
				
				//================================================= reinitialize
				this.accounts.forEach(function(item) { _this.accounts_balance[item] = 0; });
				this.categories.forEach(function(item) { _this.categories_expenses[item] = 0; });
				this.accounts_balance_all = 0;
				this.income = 0;
				this.expenses = 0;
				
				
				this.transactions.forEach(function(item) {
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
					if(item.date.indexOf(_this.statFilter)>-1) {
						
						if(item.account[1]=='') {
							//===================================== calculate in/out
							if(item.amount>0) _this.income += item.amount;
							else _this.expenses += item.amount;
						}
						
						_this.categories_expenses[item.category] += item.amount;
					}
				});
			},
			newTransaction: function() {
				this.editItem = null;
				$('#form .card-header').text('New Transaction');
				$('#formTransaction')[0].reset();
				$('#date').val(moment().format('YYYY-MM-DD'));
			},
			editTransaction: function(i) {
				this.editItem = i;
				$('#form .card-header').text('Edit Transaction');
				
				$('#amount').val(this.transactions[i].amount);
				$('#description').val(this.transactions[i].description);
				$('#account').val(this.transactions[i].account[0]);
				$('#category').val(singgit.transactions[i].category);
				$('#transfer').val(singgit.transactions[i].account[1]);
				$('#date').val(moment(this.transactions[i].date).format('YYYY-MM-DD'));
				
				$('.tab-pane, .nav-link').removeClass('active');
				$('#form, [href="#form"]').addClass('active');
			},
			saveTransaction: function() {
				var _this = this;
				var id = moment($('#date').val(), 'YYYY-MM-DD').format('YYYYMMDD')+'_'+moment().valueOf();
				
				//============================================================= intelligent preset start
				if($('#description').val()=='') $('#description').val('Food');
				//============================================================= intelligent preset end
				
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
					//delete firestore data
					db.doc('transactions').collection('transactions').doc(_this.transactions[this.editItem].id).delete().catch(function(error) {});

					//add firestore data
					db.doc('transactions').collection('transactions').doc(id).set(fsData);

					//update internal data to avoid refetching firestore
					_this.transactions[this.editItem] = inData;
				}
				//save for new transaction
				//=======================================================================================
				else {
					//add firestore data
					db.doc('transactions').collection('transactions').doc(id).set(fsData);
					
					//add internal data
					_this.transactions.unshift(inData);
				}
				
				
				_this.clusterize.update(_this.populateData());
				_this.populateStat();
				if(_this.favourite) _this.updateAutocomplete();
				if(_this.editItem!=null) {
					_this.newTransaction();
					$('.tab-pane, .nav-link').removeClass('active');
					$('#transaction, [href="#transaction"]').addClass('active');
				}
				else {
					$('#modalGeneral').modal('show');
					_this.newTransaction();
				}
			},
			saveAsTransaction: function() {
				this.editItem = null;
				this.saveTransaction();
				this.newTransaction();
			},
			deleteTransaction: function() {
				//delete firestore data
				db.doc('transactions').collection('transactions').doc(this.transactions[this.editItem].id).delete().catch(function(error) {});
				
				//delete internal data
				this.transactions.splice(this.editItem, 1);
				
				this.clusterize.update(this.populateData());
				this.populateStat();
				this.newTransaction();
			},
			updateAutocomplete: function() {
				var _this = this;
				
				_this.autoComplete.push({
					"value": $('#description').val(),
					"account": $('#account').val(),
					"category": $('#category').val(),
					"transfer": $('#transfer').val()
				});
				
				localStorage.setItem('SINGGIT_AutoComplete', JSON.stringify(_this.autoComplete));
				
				$('#description').autocomplete('setOptions', {
					lookup: _this.autoComplete
				});
			}
		},
		mounted: function() {
			var _this = this;
			
			//============================================================================================================== fetch transactions start
			db.doc("transactions").collection('transactions').orderBy("date", "desc").get().then(function(querySnapshot) {
				querySnapshot.forEach(function(doc) {
					var item = doc.data();
					item.date = item.date.split('_')[0];
					item.formatteddate = moment(item.date).format('DD MMM').toUpperCase();
					item.id = doc.id;
					_this.transactions.push(item);
				});
				
				_this.clusterize = new Clusterize({
					rows: _this.populateData(),
					scrollId: 'scrollArea',
					contentId: 'contentArea',
					blocks_in_cluster: 2,
					rows_in_block: 15
				});
				
				//========================================================================================================== calculate statistic start
				_this.populateStat();
			})
			.catch(function(error) {
				alert('Error getting documents: ' + error);
			});
			//============================================================================================================== fetch transactions end
			
			//============================================================================================================== fetch autocomplete start
			_this.autoComplete = JSON.parse(localStorage.getItem('SINGGIT_AutoComplete'));
			if(!_this.autoComplete) _this.autoComplete = [{"value": "Food", "account": "Wallet", "category": "Food", "transfer": ""}];
			
			$('#description').autocomplete({
				lookup: _this.autoComplete,
				onSelect: function (suggestion) {
					$('#description').val(suggestion.value);
					$('#account').val(suggestion.account);
					$('#category').val(suggestion.category);
					$('#transfer').val(suggestion.transfer);
				},
				formatResult: function(suggestion) {
					return '<div class="mb-2 pb-2 border-bottom">'+suggestion.value+'<br>'+(suggestion.transfer?suggestion.account+' to '+suggestion.transfer:suggestion.account+': <span class="transactionCategory">'+suggestion.category+'</span>')+'</div>';
				}
			});
			//============================================================================================================== fetch autocomplete end
			
			//============================================================================================================== assign date start
			$('#date').val(moment().format('YYYY-MM-DD'));
			//============================================================================================================== assign date end
		}
	});
})
.catch(function(err) {
	if (err.code == 'failed-precondition') {
		alert('Multiple tabs open, persistence can only be enabled in one tab at a a time');
	} else if (err.code == 'unimplemented') {
		alert('The current browser does not support all of the features required to enable persistence');
	}
});