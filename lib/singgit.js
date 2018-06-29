$('[id=version_js]').text('0631');

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
			accounts: ['Wallet', 'Credit Card', 'BIS', 'MBB', 'RHB', 'THJ', 'Loan'],
			accounts_balance: {},
			accounts_balance_all: 0,
			categories: ['Food', 'Other', 'Big', 'Transport', 'Vehicle Service', 'Fixed', 'Adjustment', 'Income', 'Transfer', 'Exclude Stat'],
			categories_expenses: {},
			income: 0,
			expenses: 0,
			transactions: [],
			editItem: null,
			clusterize: null,
			autoComplete: [],
			statFilter: moment().format('YYYYMM'),
			statFilterDesc: moment().format('MMM YYYY'),
			isFavourite: false,
			isExpenses: true,
			filter_description: '',
			filter_account: '',
			filter_category: '',
			filter_from: '',
			filter_to: '',
			filter_type: '',
			counted: 0
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
			},
			quickFilter: function(category) {
				var statDate = moment(this.statFilter, 'YYYYMM');
				this.filter_description = '';
				this.filter_account = '';
				this.filter_category = '';
				this.filter_from = statDate.format("YYYY-MM-01");
				this.filter_to = statDate.format("YYYY-MM-") + statDate.daysInMonth();
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
				
				this.clusterize.update(this.populateData());
				$('.tab-pane, .nav-link').removeClass('active');
				$('#transaction, [href="#transaction"]').addClass('active');
			},
			populateData: function() {
				var filter_operand = this.filter_description.indexOf('||')>-1?'OR':'AND';
				var filter_items = this.filter_description.toLowerCase().replace(/&&/g,'||').split('||');
				
				var data = [];
				var firstReconcile = false;
				for(i=0; i<this.transactions.length; i++) {
					var item = this.transactions[i];
					
					var filter_pass = filter_operand=='OR'?false:true;
					var combine_desc = (item.formatteddate+','+item.description+','+item.category+','+item.account+','+item.amount.toFixed(2)).toLowerCase();
					for(f=0; f<filter_items.length; f++) {
						if(filter_operand=='OR') {
							if(combine_desc.indexOf(filter_items[f])>-1) {
								filter_pass = true;
								break;
							}
						}
						else {
							if(combine_desc.indexOf(filter_items[f])<0) {
								filter_pass = false;
								break;
							}
						}
					}

					if(
						(item.description=='Reconcile' && !firstReconcile) ||
						(
							filter_pass &&
							(item.account.indexOf(this.filter_account)>-1 || this.filter_account=='') &&
							(item.category==this.filter_category || this.filter_category=='') &&
							((item.date>=this.filter_from.replace(/-/g,'') || this.filter_from=='') && (item.date<=this.filter_to.replace(/-/g,'') || this.filter_to=='')) &&
							((item.amount>=0 && this.filter_type=='income' && item.account[1]=='') || (item.amount<0 && this.filter_type=='expenses') || this.filter_type=='')
						)
					){
						if(item.description=='Reconcile' && !firstReconcile) firstReconcile = true;
						
						data.push(
							'<li class="list-group-item d-flex align-items-center">'+
								'<div class="transactionDate">'+item.formatteddate+'</div>'+
								(
									item.description=='Reconcile'?
									'<div class="reconcile" onclick="singgit.editTransaction('+i+')"></div>'
									:
									'<div class="transactionDescription" onclick="singgit.editTransaction('+i+')">'+
										item.description+'<br>'+
										item.account[0]+(item.account[1]==''?': <span class="transactionCategory">'+item.category+'</span>':' <span>to '+item.account[1]+'</span>')+
									'</div>'+
									'<div class="'+(item.amount>=0 && item.account[1]!='Loan'?'positive':'negative')+(item.category=='Exclude Stat'?' strikethrough':'')+'" onclick="singgit.count(this)">'+
										this.toCurrency(item.amount)+
									'</div>'
								)+
							'</li>'
						)
					}
				}
				return data;
			},
			count: function(e) {
				$(e).closest('li').toggleClass('counted');
				var s = 0;
				$('.counted .negative').each(function(){
					s -= Number($(this).text().replace(/,/gi,''));
				});
				$('.counted .positive').each(function(){
					s += Number($(this).text().replace(/,/gi,''));
				});
				this.counted = s;
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
						
						if(item.account[1]=='' && item.category!='Exclude Stat') {
							//===================================== calculate in/out
							if(item.amount>0) _this.income += item.amount;
							else _this.expenses += item.amount;
						}
						
						if(item.category!='Exclude Stat') {
							_this.categories_expenses[item.category] += item.amount;
						}
					}
				});
			},
			newTransaction: function() {
				this.editItem = null;
				$('#form .card-header').text('New Transaction');
				$('#formTransaction')[0].reset();
				$('#date').val(moment().format('YYYY-MM-DD'));
				this.isExpenses = true;
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
					
					//each transaction will trigger onSnapshot(). To avoid flickering when updating data, we have to group delete and set transaction into single batch
					/*
					Before:
						//delete firestore data
						db.doc('transactions').collection('transactions').doc(_this.transactions[this.editItem].id).delete();

						//add firestore data
						db.doc('transactions').collection('transactions').doc(id).set(fsData);
					
					After:
					*/
					var batch = firebase.firestore().batch();
					batch.delete(db.doc('transactions').collection('transactions').doc(_this.transactions[this.editItem].id));
					batch.set(db.doc('transactions').collection('transactions').doc(id), fsData);
					batch.commit();

					//update internal data to avoid refetching firestore
					//_this.transactions[this.editItem] = inData;
				}
				//save for new transaction
				//=======================================================================================
				else {
					//add firestore data
					db.doc('transactions').collection('transactions').doc(id).set(fsData);
					
					//update internal data to avoid refetching firestore
					//_this.transactions.unshift(inData);
				}
				
				
				if(_this.isFavourite) _this.addAutocomplete();
				if(_this.editItem!=null) {
					$('.tab-pane, .nav-link').removeClass('active');
					$('#transaction, [href="#transaction"]').addClass('active');
				}
				else {
					$('#modalGeneral .modal-body').text('Done');
					$('#modalGeneral').modal('show');
				}
				
				//_this.clusterize.update(_this.populateData());
				//_this.populateStat();
				_this.newTransaction();
			},
			saveAsTransaction: function() {
				this.editItem = null;
				this.saveTransaction();
				this.newTransaction();
			},
			deleteTransaction: function() {
				//delete firestore data
				db.doc('transactions').collection('transactions').doc(this.transactions[this.editItem].id).delete();
				
				//update internal data to avoid refetching firestore
				this.transactions.splice(this.editItem, 1);
				
				//this.clusterize.update(this.populateData());
				//this.populateStat();
				this.newTransaction();
				
				$('.tab-pane, .nav-link').removeClass('active');
				$('#transaction, [href="#transaction"]').addClass('active');
			},
			addAutocomplete: function() {
				this.autoComplete.push({
					"value": $('#description').val(),
					"account": $('#account').val(),
					"category": $('#category').val(),
					"transfer": $('#transfer').val()
				});
				
				//========================================================================================================== save autocomplete to localstorage
				localStorage.setItem('SINGGIT_AutoComplete', JSON.stringify(this.autoComplete));
				$('#description').autocomplete('setOptions', { lookup: this.autoComplete });
			},
			syncAutocomplete: function() {
				loading = true;
				
				animate();
				function animate() {
					$('.icon-refresh-ccw:visible').removeClass('rotate');
					setTimeout(function(){
						$('.icon-refresh-ccw:visible').addClass('rotate');
					}, 0);
					setTimeout(function(){
						if(loading) animate();
					}, 2000);
				}

				var _this = this;
				db.doc("autocomplete").get().then(function(querySnapshot) {
					
					//=============================================================================== merge localstorage and firestore
					var merge = _this.autoComplete.concat(querySnapshot.data()['data']);
					for(var i=0; i<merge.length; i++) merge[i] = JSON.stringify(merge[i]);
					merge = [... new Set(merge)];
					for(var i=0; i<merge.length; i++) merge[i] = JSON.parse(merge[i]);
					
					//=============================================================================== update autocomplete
					$('#description').autocomplete('setOptions', { lookup: merge });
					
					//=============================================================================== save to localstorage
					localStorage.setItem('SINGGIT_AutoComplete', JSON.stringify(merge));
	
					//=============================================================================== save to firestore
					db.doc('autocomplete').set({ data: merge }).then(function(){
						loading = false;
					});
				});
			},
			exportAutocomplete: function() {
				db.doc('autocomplete').set({data:this.autoComplete}).then(function(){
					$('#modalGeneral .modal-body').text('Done');
					$('#modalGeneral').modal('show');
				});
			},
			importAutocomplete: function() {
				var _this = this;
				db.doc("autocomplete").get().then(function(querySnapshot) {
					_this.autoComplete = querySnapshot.data()['data'];
					$('#modalGeneral .modal-body').text('Done');
					$('#modalGeneral').modal('show');
					
					//====================================================================================================== save autocomplete to localstorage
					localStorage.setItem('SINGGIT_AutoComplete', JSON.stringify(_this.autoComplete));
					$('#description').autocomplete('setOptions', { lookup: _this.autoComplete });
				});
			},
			checkForUpdate: function() {
				registration.update();
				$('#modalGeneral .modal-body').text('Apps updated. Please restart.');
				$('#modalGeneral').modal('show');
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
			}
		},
		mounted: function() {
			var _this = this;
			
			//============================================================================================================== fetch transactions
			db.doc("transactions").collection('transactions').orderBy("date", "desc").onSnapshot(function(querySnapshot) {
				_this.transactions = [];
				querySnapshot.forEach(function(doc) {
					var item = doc.data();
					item.affix = item.date.split('_')[1];
					item.date = item.date.split('_')[0];
					item.formatteddate = moment(item.date).format('DD MMM').toUpperCase();
					item.id = doc.id;
					_this.transactions.push(item);
				});
				
				//========================================================================================================== clusterize
				_this.clusterize = new Clusterize({
					rows: _this.populateData(),
					scrollId: 'scrollArea',
					contentId: 'contentArea',
					blocks_in_cluster: 2,
					rows_in_block: 15
				});
				
				//========================================================================================================== populate statistic
				_this.populateStat();
			});

			
			//============================================================================================================== fetch autocomplete
			_this.autoComplete = JSON.parse(localStorage.getItem('SINGGIT_AutoComplete'));
			if(!_this.autoComplete) _this.autoComplete = [];
			$('#description').autocomplete({
				lookup: _this.autoComplete,
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
			$('#modalFilter').on('hidden.bs.modal', function (e) {
				_this.clusterize.update(_this.populateData());
			});
			$('#filter_from').change(function(){
				_this.filter_to = $(this).val().slice(0,-2) + moment($(this).val(), 'YYYY-MM-DD').daysInMonth();
			});
			
			
			//============================================================================================================== monitoring clipboard
			$(document).bind('copy', function(event) {
				var html = _this.getHTMLOfSelection();
				if(html) {
					var virtual = html.substring(0, 3)=='<li'?$('<div>'+html+'</div>'):$('<div><li>'+html+'</li></div>');
					var scrapHTML = '';
					virtual.find('li').each(function(i){
						scrapHTML += '\n' + $(this).find('.transactionDate').text()+'	';
						if($(this).find('.reconcile').length==0) {
							scrapHTML += $($(this).find('.transactionDescription').prop('outerHTML').replace('<br>', '	')).text()+'	';
							scrapHTML += ($(this).find('.negative').length?'-':'') + $(this).find('.negative, .positive').text();
						}
						else {
							scrapHTML += 'Reconcile';
						}
					});
					$('#clipboard').val(scrapHTML.replace('\n', ''));
					$('#clipboard')[0].select();
				}
			});
			
			
			//============================================================================================================== zingtouch start
			/*
			kat html element, ontouchstart="javascript:singgit.zingActiveChild=this;" 
			var zingActiveRegion = ZingTouch.Region($('#scrollArea.clusterize-scroll')[0]);
			zingActiveRegion.bind($('#contentArea.clusterize-content')[0], 'swipe', function(e){
				if(e.detail.data[0].currentDirection<200 && e.detail.data[0].currentDirection>160) {
					$(_this.zingActiveChild).addClass('swipeout-actions-opened');
				}
			});
			*/
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