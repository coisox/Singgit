$('.scriptVersion').text('20180102');

firebase.initializeApp({
	apiKey: 'AIzaSyBzoSF9md52wOwJ6oTuLj_KFDrOSAoAuhE',
	authDomain: 'singgitfirestore.firebaseapp.com',
	projectId: 'singgitfirestore'
});

firebase.firestore().enablePersistence().then(function() {
	db = firebase.firestore().collection("coisox_Try001122");

	singgit = new Vue({
		el: '#singgit',
		data: {
			months: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
			years: [
				moment().add(2, 'years').format('YYYY'),
				moment().add(1, 'years').format('YYYY'),
				moment().format('YYYY'),
				moment().subtract(1, 'years').format('YYYY'),
				moment().subtract(2, 'years').format('YYYY')
			],
			search: '',
			activeTab: 'new',
			activeMonth: moment().format('MM'),
			activeYear: moment().format('YYYY'),
			accounts: ['Wallet', 'Credit Card', 'BIS', 'MBB', 'RHB'],
			categories: ['Food', 'Other', 'Big', 'Transport', 'Vehicle Service', 'Fixed', 'Loan', 'Adjustment', 'Income'],
			transactions: [],
			statistic: {},
			balance: {}
		},
		methods: {
			deleteTransaction: function(id) {
				db.doc('transactions').collection(singgit.activeYear+''+singgit.activeMonth).doc(id).delete().catch(function(error) {
					singgitF7.alert("Error deleting transaction: ", error);
				});
				
				for(x=0; x<singgit.transactions.length; x++) {
					if(singgit.transactions[x].id==id) {
						
						//update memory balance
						if(singgit.transactions[x].account[1]=='') {
							singgit.balance[singgit.transactions[x].account[0]] -= singgit.transactions[x].amount;
							singgit.balance[singgit.transactions[x].account[0]] = Number(singgit.balance[singgit.transactions[x].account[0]].toFixed(2));
						}
						else {
							singgit.balance[singgit.transactions[x].account[0]] += singgit.transactions[x].amount;
							singgit.balance[singgit.transactions[x].account[0]] = Number(singgit.balance[singgit.transactions[x].account[0]].toFixed(2));
							singgit.balance[singgit.transactions[x].account[1]] -= singgit.transactions[x].amount;
							singgit.balance[singgit.transactions[x].account[1]] = Number(singgit.balance[singgit.transactions[x].account[1]].toFixed(2));
						}

						//update firestore balance
						singgit.balance['Total'] = singgit.totalBalance();
						db.doc('balance').set(singgit.balance);
						
						break;
					}
				}
			},
			newTransaction: function() {
				$('form')[0].reset();
				$('#date').val(moment().format('D MMM YYYY'));
				$('#account').parents('li').find('.item-after').text($('#account').val());
				$('#categories').parents('li').find('.item-after').text('');
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
						$('#repeat').val(1);
						
						$('#account').val(singgit.transactions[x].account[0]);
						$('#account').parents('li').find('.item-after').text(singgit.transactions[x].account[0]);
						
						$('#categories').val(singgit.transactions[x].categories);
						$('#categories').parents('li').find('.item-after').text(singgit.transactions[x].categories.join(', '));
						
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
				var pass = false;
				
				try {
					if(eval($('#amount').val()) || $('#amount').val()=='0') pass = true;
				} catch (err) {}
				
				if(pass) {
					if($('#description').val()=='') {
						$('#description').val('Food');
						$('#account').val('Wallet');
						$('#account').parents('li').find('.item-after').text($('#account').val());
						$('#categories').val(['Food']);
						$('#categories').parents('li').find('.item-after').text('Food');
					}
					else if($('#description').val()=='p') {
						$('#description').val('Petrol');
						$('#account').val('Credit Card');
						$('#account').parents('li').find('.item-after').text($('#account').val());
						$('#categories').val(['Transport']);
						$('#categories').parents('li').find('.item-after').text('Transport');
					}
					
					var alteredAmount = eval($('#amount').val());
					if($('#transfer').val()=='') alteredAmount *= -1;

					for(r=0; r<$('#repeat').val(); r++) {
						if(singgit.activeTab=='edit' && r==0) {
							
							//update firestore data
							db.doc('transactions').collection(moment($('#date').val(), 'D MMM YYYY').add(r, 'months').format('YYYYMM')).doc(edittedId).set({
								amount: alteredAmount,
								description: $('#description').val(),
								date: moment($('#date').val(), 'D MMM YYYY').add(r, 'months').format('YYYYMMDD'),
								account: [$('#account').val(), $('#transfer').val()],
								categories: $('#categories').val()
							});
							
							//update memory balance for previous transaction
							if(previous.transfer=='') {
								singgit.balance[previous.account] -= previous.amount;
								singgit.balance[previous.account] = Number(singgit.balance[previous.account].toFixed(2));
							}
							else {
								singgit.balance[previous.account] += previous.amount;
								singgit.balance[previous.account] = Number(singgit.balance[previous.account].toFixed(2));
								singgit.balance[previous.transfer] -= previous.amount;
								singgit.balance[previous.transfer] = Number(singgit.balance[previous.transfer].toFixed(2));
							}
							
							//update memory balance for editted transaction
							if($('#transfer').val()=='') {
								singgit.balance[$('#account').val()] += alteredAmount;
								singgit.balance[$('#account').val()] = Number(singgit.balance[$('#account').val()].toFixed(2));
							}
							else {
								singgit.balance[$('#account').val()] -= alteredAmount;
								singgit.balance[$('#account').val()] = Number(singgit.balance[$('#account').val()].toFixed(2));
								singgit.balance[$('#transfer').val()] += alteredAmount;
								singgit.balance[$('#transfer').val()] = Number(singgit.balance[$('#transfer').val()].toFixed(2));
							}

							//update transaction in memory to avoid refetching firestore
							for(x=0; x<singgit.transactions.length; x++) {
								if(singgit.transactions[x].id==edittedId) {
									singgit.transactions[x] = {
										id: edittedId,
										amount: alteredAmount,
										description: $('#description').val(),
										date: moment($('#date').val(), 'D MMM YYYY').add(r, 'months').format('YYYYMMDD'),
										formatteddate: moment($('#date').val(), 'D MMM YYYY').format('DD MMM').toUpperCase(),
										account: [$('#account').val(), $('#transfer').val()],
										categories: $('#categories').val()
									};
									break;
								}
							}
						}
						else {
							
							//add firestore data
							db.doc('transactions').collection(moment($('#date').val(), 'D MMM YYYY').add(r, 'months').format('YYYYMM')).add({
								amount: alteredAmount,
								description: $('#description').val(),
								date: moment($('#date').val(), 'D MMM YYYY').add(r, 'months').format('YYYYMMDD'),
								account: [$('#account').val(), $('#transfer').val()],
								categories: $('#categories').val()
							});
							
							//update memory balance for new transaction
							if($('#transfer').val()=='') {
								singgit.balance[$('#account').val()] += alteredAmount;
								singgit.balance[$('#account').val()] = Number(singgit.balance[$('#account').val()].toFixed(2));
							}
							else {
								singgit.balance[$('#account').val()] -= alteredAmount;
								singgit.balance[$('#account').val()] = Number(singgit.balance[$('#account').val()].toFixed(2));
								singgit.balance[$('#transfer').val()] += alteredAmount;
								singgit.balance[$('#transfer').val()] = Number(singgit.balance[$('#transfer').val()].toFixed(2));
							}
						}
					}
					
					//update firestore balance
					singgit.balance['Total'] = singgit.totalBalance();
					db.doc('balance').set(singgit.balance);
					
					if(singgit.activeTab=='new') {
						singgitF7.modal({
							title: 'Saved Successfully',
							text: 'Do you want to keep the form or dismiss?',
							buttons: [
								{ text: 'Keep' },
								{ text: 'Dismiss', onClick: function() { singgit.newTransaction(); } }
							]
						});
					}
					else {
						singgit.cancelTransaction();
					}
				}
				else {
					$('#amount').addClass('error');
				}
			},
			showTransactions: function() {
				$('.progressbar-infinite').show();
				singgit.transactions = [];
				db.doc("transactions").collection(singgit.activeYear+''+singgit.activeMonth).orderBy("date", "desc").get().then(function(querySnapshot) {
					querySnapshot.forEach(function(doc) {
						var transaction = doc.data();
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
				$('.progressbar-infinite').show();
				
				singgit.statistic.totalIncome = 0;
				singgit.statistic.totalExpenses = 0;
				singgit.statistic.totalSaving = 0;
				singgit.statistic.totalByCategory = {};
				for(x=0; x<singgit.categories.length; x++) singgit.statistic.totalByCategory[singgit.categories[x]] = 0;
				
				db.doc("transactions").collection(singgit.activeYear+''+singgit.activeMonth).orderBy("date", "desc").get().then(function(querySnapshot) {
					querySnapshot.forEach(function(doc) {
						
						//count income & expenses excluding loan and transfer
						if(doc.data().categories.indexOf('Loan')<0 && doc.data().account[1]=='') {
							if(doc.data().amount>0) singgit.statistic.totalIncome += doc.data().amount;
							else singgit.statistic.totalExpenses += doc.data().amount;
							singgit.statistic.totalSaving += doc.data().amount;
						}
						
						//count expenses by category
						for(x=0; x<doc.data().categories.length; x++) {
							singgit.statistic.totalByCategory[doc.data().categories[x]] += doc.data().amount;
						}
					});
					
					singgit.statistic = JSON.parse(JSON.stringify(singgit.statistic));
					$('.progressbar-infinite').hide();
				})
				.catch(function(error) {
					singgitF7.alert('Error getting documents: ' + error);
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
			calibrate: function() {
				db.where("doctype", "==", "opening").get().then(function(querySnapshot) {
					querySnapshot.forEach(function(doc) {
						
						balance = doc.data();
						var startYear = 2017;
						var totalYear = 3;
						var done = 0;
						
						console.log(balance);
						
						function whenAllDone() {
							done++;
							if(done==totalYear) {
								console.log(
									"balance['BIS'] = "+balance['BIS']+"\n"+
									"balance['Credit Card'] = "+balance['Credit Card']+"\n"+
									"balance['MBB'] = "+balance['MBB']+"\n"+
									"balance['RHB'] = "+balance['RHB']+"\n"+
									"balance['Wallet'] = "+balance['Wallet']
								);
							}
						}

						for(var year=startYear; year<startYear+totalYear; year++) {
							for(var month=1; month<13; month++) {
								db.doc("transactions").collection(year+(month<10?'0':'')+month).get().then(function(querySnapshot) {
									querySnapshot.forEach(function(doc) {
										var transaction = doc.data();
										if(transaction.account[1]=='') {
											balance[transaction.account[0]] += transaction.amount;
											balance[transaction.account[0]] = Number(balance[transaction.account[0]].toFixed(2));
										}
										else {
											balance[transaction.account[0]] -= transaction.amount;
											balance[transaction.account[0]] = Number(balance[transaction.account[0]].toFixed(2));
											balance[transaction.account[1]] += transaction.amount;
											balance[transaction.account[1]] = Number(balance[transaction.account[1]].toFixed(2));
										}
									});
									whenAllDone();
								});
							}
						}
					});
				});
			}
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
			db.where("doctype", "==", "balance").get().then(function(querySnapshot) {
				querySnapshot.forEach(function(doc) {
					singgit.balance = doc.data();
				});
			});
		},
		zzzupdated: function() {
			this.$nextTick(function () {

			});
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