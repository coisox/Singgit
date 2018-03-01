$('.scriptVersion').text('20180301');

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
			years: [2017, 2018],
			search: '',
			activeTab: 'new',
			activeMonth: 'ALL',
			activeYear: moment().format('YYYY'),
			accounts: ['Wallet', 'Credit Card', 'BIS', 'MBB', 'RHB', 'Loan'],
			categories: ['Food', 'Other', 'Big', 'Transport', 'Vehicle Service', 'Fixed', 'Adjustment', 'Income', 'Transfer'],
			transactions: [],
			statistic: {},
			balance: {},
			clipboard: false
		},
		methods: {
			deleteTransaction: function(id) {
				db.doc('transactions').collection('transactions').doc(id).delete().catch(function(error) {
					singgitF7.alert("Error deleting transaction: ", error);
				});
			},
			newTransaction: function() {
				$('form')[0].reset();
				$('#date').val(moment().format('D MMM YYYY'));
				$('#account').parents('li').find('.item-after').text($('#account').val());
				$('#category').parents('li').find('.item-after').text($('#category').val());
				$('#transfer').parents('li').find('.item-after').text('');
				
				singgit.activeTab = 'new';
			},
			editTransaction: function(id) {
				scrollTop = $('.page-content').scrollTop();
				edittedId = id;

				for(x=0; x<singgit.transactions.length; x++) {
					if(singgit.transactions[x].id==id) {
						var displayedAmount = singgit.transactions[x].amount;
						if(singgit.transactions[x].account[1]=='') displayedAmount *= -1;
							
						$('#amount').val(displayedAmount);
						$('#description').val(singgit.transactions[x].description);
						$('#date').val(moment(singgit.transactions[x].date).format('D MMM YYYY'));
						
						created = singgit.transactions[x].created;
						
						$('#account').val(singgit.transactions[x].account[0]);
						$('#account').parents('li').find('.item-after').text(singgit.transactions[x].account[0]);
						
						$('#category').val(singgit.transactions[x].category);
						$('#category').parents('li').find('.item-after').text(singgit.transactions[x].category);
						
						$('#transfer').val(singgit.transactions[x].account[1]);
						$('#transfer').parents('li').find('.item-after').text(singgit.transactions[x].account[1]);

						$('#tabTransactions, .tabbar [href="#tabTransactions"], #tabForm, .tabbar [href="#tabForm"]').toggleClass('active');
						
						previous = {};
						previous.amount = singgit.transactions[x].amount;
						previous.account = singgit.transactions[x].account[0];
						previous.transfer = singgit.transactions[x].account[1];
				
						singgit.activeTab = 'edit';
						break;
					}
				}
			},
			cancelTransaction: function() {
				$('#tabTransactions, .tabbar [href="#tabTransactions"], #tabForm, .tabbar [href="#tabForm"]').toggleClass('active');
				singgit.activeTab = 'transactions';
				$('.page-content').scrollTop(scrollTop);
			},
			saveTransaction: function() {
				try { eval($('#amount').val()); }
				catch(err) { $('#amount').addClass('error'); return false; }
				if($('#amount').val().trim()=='') { $('#amount').addClass('error'); return false; }

				if($('#amount').val()=='0' || $('#description').val()=='Reconcile') {
					$('#amount').val('0');
					$('#description').val('Reconcile');
					$('#account').val('Wallet');
					$('#account').parents('li').find('.item-after').text($('#account').val());
					$('#category').val('Other');
					$('#categories').parents('li').find('.item-after').text('Food');
					$('#transfer').val('');
					$('#transfer').parents('li').find('.item-after').text('');
				}
				else if($('#description').val()=='' && $('#transfer').val()=='') {
					$('#description').val('Food');
					$('#account').val('Wallet');
					$('#account').parents('li').find('.item-after').text($('#account').val());
					$('#category').val('Food');
					$('#category').parents('li').find('.item-after').text('Food');
					$('#transfer').val('');
					$('#transfer').parents('li').find('.item-after').text('');
				}
				else if($('#description').val()=='p') {
					$('#description').val('Petrol');
					$('#account').val('Credit Card');
					$('#account').parents('li').find('.item-after').text($('#account').val());
					$('#category').val(['Transport']);
					$('#category').parents('li').find('.item-after').text('Transport');
					$('#transfer').val('');
					$('#transfer').parents('li').find('.item-after').text('');
				}
				else if($('#transfer').val()!='') {
					$('#description').val('Transfer');
					$('#category').val('Transfer');
					$('#category').parents('li').find('.item-after').text('Transfer');
				}

				var alteredAmount = eval($('#amount').val());
				if($('#transfer').val()=='') alteredAmount *= -1;

				for(r=0; r<1; r++) {
					if(singgit.activeTab=='edit' && r==0) {
						
						//delete previous item
						db.doc('transactions').collection('transactions').doc(edittedId).delete().catch(function(error) {
							singgitF7.alert("Error deleting transaction: ", error);
						});
						
						//add firestore data
						var date = moment($('#date').val(), 'D MMM YYYY').add(r, 'months').format('YYYYMMDD')+'_'+created;
						db.doc('transactions').collection('transactions').doc(date).set({
							amount: alteredAmount,
							description: $('#description').val(),
							date: date,
							account: [$('#account').val(), $('#transfer').val()],
							category: $('#category').val()
						});

						//update transaction in memory to avoid refetching firestore
						for(x=0; x<singgit.transactions.length; x++) {
							if(singgit.transactions[x].id==edittedId) {
								singgit.transactions[x] = {
									id: date,
									amount: alteredAmount,
									description: $('#description').val(),
									date: moment($('#date').val(), 'D MMM YYYY').add(r, 'months').format('YYYYMMDD'),
									created: created,
									formatteddate: moment($('#date').val(), 'D MMM YYYY').format('DD MMM').toUpperCase(),
									account: [$('#account').val(), $('#transfer').val()],
									category: $('#category').val()
								};
								break;
							}
						}
					}
					else {
						//add firestore data
						var date = moment($('#date').val(), 'D MMM YYYY').add(r, 'months').format('YYYYMMDD')+'_'+moment().valueOf();
						db.doc('transactions').collection('transactions').doc(date).set({
							amount: alteredAmount,
							description: $('#description').val(),
							date: date,
							account: [$('#account').val(), $('#transfer').val()],
							category: $('#category').val()
						});
					}
				}

				if(singgit.activeTab=='new') {
					singgitF7.modal({
						title: 'Transaction Saved',
						buttons: [
							{ text: 'Keep' },
							{ text: 'Dismiss', onClick: function() { singgit.newTransaction() } }
						]
					});
				}
				else {
					singgit.cancelTransaction();
				}
			},
			copyTransaction: function(id) {
				for(x=0; x<singgit.transactions.length; x++) {
					if(singgit.transactions[x].id==id) {
						
						//add firestore data
						var date = moment(singgit.transactions[x].date).add(1, 'months').format('YYYYMMDD')+'_'+moment().valueOf();
						db.doc('transactions').collection('transactions').doc(date).set({
							amount: singgit.transactions[x].amount,
							description: singgit.transactions[x].description,
							date: date,
							account: singgit.transactions[x].account,
							category: singgit.transactions[x].category
						});
						
						//update transaction in memory to avoid refetching firestore
						singgit.transactions.unshift({
							id: date,
							amount: singgit.transactions[x].amount,
							description: singgit.transactions[x].description,
							date: date.split('_')[0],
							created: date.split('_')[1],
							formatteddate: moment(date.split('_')[0]).format('DD MMM').toUpperCase(),
							account: singgit.transactions[x].account,
							category: singgit.transactions[x].category
						});

						singgitF7.modal({
							title: 'Copied To Next Month',
							buttons: [
								{ text: 'Ok', onClick: function(){ singgitF7.swipeoutClose($('.swipeout-opened')) } }
							]
						});
						
						break;
					}
				}
			},
			showTransactions: function() {
				$('.progressbar-infinite').show();
				singgit.transactions = [];
				db.doc("transactions").collection('transactions').orderBy("date", "desc").get().then(function(querySnapshot) {
					querySnapshot.forEach(function(doc) {
						var temp = doc.data().date.split('_');
						var transaction = doc.data();
						transaction.date = temp[0];
						transaction.created = temp[1];
						transaction.formatteddate = moment(transaction.date).format('DD MMM').toUpperCase();
						transaction.id = doc.id;
						singgit.transactions.push(transaction);
					});
					$('.progressbar-infinite').hide();
				})
				.catch(function(error) {
					singgitF7.alert('Error getting documents: ' + error);
				});
				
				singgit.activeTab = 'transactions';
			},
			showStatistic: function() {
				$('.tabs').hide();
				$('.progressbar-infinite').show();
				if(this.activeMonth=='ALL') this.activeMonth = moment().format('MM');
				
				//fetch balance from firestore
				//======================================================================================================================
				db.where('doctype', '==', 'opening').get().then(function(querySnapshot) {
					querySnapshot.forEach(function(doc) {
						singgit.balance = doc.data();
						singgit.balance['doctype'] = 'balance';
						
						
						//after fetch balance, fetch transaction from firestore then count balance based on transactions
						//======================================================================================================================
						singgit.transactions = [];
						db.doc("transactions").collection('transactions').orderBy("date", "desc").get().then(function(querySnapshot) {
							querySnapshot.forEach(function(doc) {
								var temp = doc.data().date.split('_');
								var transaction = doc.data();
								transaction.date = temp[0];
								transaction.created = temp[1];
								transaction.formatteddate = moment(transaction.date).format('DD MMM').toUpperCase();
								transaction.id = doc.id;
								singgit.transactions.push(transaction);
																	
								if(transaction.account[1]=='') {
									singgit.balance[transaction.account[0]] += transaction.amount;
									singgit.balance[transaction.account[0]] = Number(singgit.balance[transaction.account[0]].toFixed(2));
								}
								else {
									singgit.balance[transaction.account[0]] -= transaction.amount;
									singgit.balance[transaction.account[0]] = Number(singgit.balance[transaction.account[0]].toFixed(2));
									singgit.balance[transaction.account[1]] += transaction.amount;
									singgit.balance[transaction.account[1]] = Number(singgit.balance[transaction.account[1]].toFixed(2));
								}
								
								singgit.balance['Total'] = singgit.totalBalance();
								
								
								//after fetch transactions, count monthly statistic
								//======================================================================================================================
								singgit.statistic.totalIncome = 0;
								singgit.statistic.totalExpenses = 0;
								singgit.statistic.totalSaving = 0;
								singgit.statistic.totalByCategory = {};
								for(x=0; x<singgit.categories.length; x++) singgit.statistic.totalByCategory[singgit.categories[x]] = 0;
								
								var query = JSLINQ(singgit.transactions)
									.Where(function(item){ return item.date.substring(0,6) == singgit.activeYear+singgit.activeMonth; })
									.OrderBy(function(item) { return item.date; })
									.Select(function(item){ return item; });
									
								for(x=0; x<query.items.length; x++) {
									if(query.items[x].account[1]=='') { //excluding transfer
										if(query.items[x].amount>0) singgit.statistic.totalIncome += query.items[x].amount;
										else singgit.statistic.totalExpenses += query.items[x].amount;
										singgit.statistic.totalSaving += query.items[x].amount;
									}
									
									//count expenses by category
									singgit.statistic.totalByCategory[query.items[x].category] += query.items[x].amount;
								}
								
				
								$('.progressbar-infinite').hide();
								$('.tabs').show();
							});
						});

					});
				});

				singgit.activeTab = 'statistic';
			},
			toCurrency: function(n) {
				return new Intl.NumberFormat('en-US', {
					minimumFractionDigits: 2
				}).format(Math.abs(n));
			},
			totalBalance: function() {
				var result = 0;
				for(x=0; x<singgit.accounts.length; x++) {
					result += singgit.balance[singgit.accounts[x]];
				}
				return Number(result.toFixed(2));
			},
			onInputAmount: function() {
				$('#amount').val($('#amount').val().replace(' ', '').replace(',', ''));
				$('#amount').removeClass('error');
			},
			onChangeAccount: function() {
				this.$nextTick(function(){
					$('#account').parents('li').find('.item-after').text($('#account').val())
				});
			},
			onChangeCategory: function() {
				this.$nextTick(function(){
					$('#category').parents('li').find('.item-after').text($('#category').val());
					$('#category').removeClass('error');
				});
			},
			onChangeTransfer: function() {
				this.$nextTick(function(){
					$('#transfer').parents('li').find('.item-after').text($('#transfer').val());
					$('#transfer').removeClass('error');
				});
			}
			// calibrate: function() {
				// $('.progressbar-infinite').show();
				// var delayCalibrate;
				
				// db.where('doctype', '==', 'opening').get().then(function(querySnapshot) {
					// querySnapshot.forEach(function(doc) {
						
						// singgit.balance = doc.data();
						// singgit.balance['doctype'] = 'balance';

						// for(y=2017; y<2021; y++) {
							// for(m=1; m<13; m++) {
								// var collection = y+(m<10?'0':'')+m;
								// db.doc("transactions").collection(collection).get().then(function(querySnapshot) {
									// querySnapshot.forEach(function(doc) {
										
										// var transaction = doc.data();
										
										// if(transaction.account[1]=='') {
											// singgit.balance[transaction.account[0]] += transaction.amount;
											// singgit.balance[transaction.account[0]] = Number(singgit.balance[transaction.account[0]].toFixed(2));
										// }
										// else {
											// singgit.balance[transaction.account[0]] -= transaction.amount;
											// singgit.balance[transaction.account[0]] = Number(singgit.balance[transaction.account[0]].toFixed(2));
											// singgit.balance[transaction.account[1]] += transaction.amount;
											// singgit.balance[transaction.account[1]] = Number(singgit.balance[transaction.account[1]].toFixed(2));
										// }
										
										// clearTimeout(delayCalibrate);
										// delayCalibrate = setTimeout(function(){
											// singgit.balance['Total'] = singgit.totalBalance();
											// db.doc('balance').set(singgit.balance);
											// $('.progressbar-infinite').hide();
										// }, 1000);
										
									// });
								// });
							// }
						// }
						
					// });
				// });
			// }
		},
		mounted: function() {
			singgitF7 = new Framework7();
			$$ = Dom7;
			mainView = singgitF7.addView('.view-main', { dynamicNavbar: true });
			
			datepicker = singgitF7.calendar({
				input: '#date',
				dateFormat: 'd M yyyy'
			});

			$('#date').val(moment().format('D MMM YYYY'));
			
			//get firestore balance into memory
			// db.where('doctype', '==', 'balance').get().then(function(querySnapshot) {
				// querySnapshot.forEach(function(doc) {
					// singgit.balance = doc.data();
					// singgit.balance['Total'] = singgit.totalBalance();
				// });
			// });
		}
	});
})
.catch(function(err) {
	if (err.code == 'failed-precondition') {
		singgitF7.alert('Multiple tabs open, persistence can only be enabled in one tab at a a time');
	} else if (err.code == 'unimplemented') {
		singgitF7.alert('The current browser does not support all of the features required to enable persistence');
	}
});

function install() {
	location = $('#version').val();
}