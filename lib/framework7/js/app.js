if('serviceWorker' in navigator) {
	navigator.serviceWorker.register('service-worker.js');
}

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
				moment().format('YYYY'),
				moment().subtract(1, 'years').format('YYYY'),
				moment().subtract(2, 'years').format('YYYY')
			],
			search: '',
			activeTab: 'new',
			activeMonth: moment().format('MM'),
			activeYear: moment().format('YYYY'),
			accounts: ['Wallet', 'Credit Card', 'BIS', 'MBB', 'RHB'],
			categories: ['Food', 'Other', 'Big', 'Transport', 'Vehicle Service', 'Fixed', 'Loan', 'Adjustment', 'Income', 'Opening'],
			transactions: []
		},
		methods: {
			deleteTransaction: function(id) {
				db.doc('transactions').collection(singgit.activeYear+''+singgit.activeMonth).doc(id).delete().catch(function(error) {
					singgitF7.alert("Error deleting transaction: ", error);
				});
			},
			newTransaction: function() {
				$('form')[0].reset();
				$('#date').val(moment().format('D MMM YYYY'));
				$('#account .item-after').text($('#account select').val());
				$('#categories .item-after').text('');
				$('#transfer .item-after').text('');
				
				singgit.activeTab = 'new';
			},
			editTransaction: function(id) {
				scrollTop = $('.page-content').scrollTop();
				edittedId = id;
				
				for(x=0; x<singgit.transactions.length; x++) {
					if(singgit.transactions[x].id==id) {
						$('#amount').val(singgit.transactions[x].amount*(singgit.transactions[x].negative?1:-1));
						$('#description').val(singgit.transactions[x].description);
						$('#date').val(moment(singgit.transactions[x].date).format('D MMM YYYY'));
						$('#repeat').val(1);
						
						$('#account select').val(singgit.transactions[x].account[0]);
						$('#account .item-after').text(singgit.transactions[x].account[0]);
						
						$('#categories select').val(singgit.transactions[x].categories);
						$('#categories .item-after').text(singgit.transactions[x].categories.join(', '));
						
						$('#transfer select').val(singgit.transactions[x].account[1]);
						$('#transfer .item-after').text(singgit.transactions[x].account[1]);

						$('#tabTransactions, .tabbar [href="#tabTransactions"], #tabForm, .tabbar [href="#tabForm"]').toggleClass('active');
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
				for(r=0; r<$('#repeat').val(); r++) {
					if(singgit.activeTab=='edit' && r==0) {
						db.doc('transactions').collection(moment($('#date').val(), 'D MMM YYYY').add(r, 'months').format('YYYYMM')).doc(edittedId).set({
							amount: eval($('#amount').val())*-1,
							description: $('#description').val(),
							date: moment($('#date').val(), 'D MMM YYYY').add(r, 'months').format('YYYYMMDD'),
							account: [$('#account select').val(), $('#transfer select').val()],
							categories: $('#categories select').val()
						});
						
						//update vue data to avoid refetching firestore
						for(x=0; x<singgit.transactions.length; x++) {
							if(singgit.transactions[x].id==edittedId) {
								singgit.transactions[x] = {
									id: edittedId,
									amount: eval($('#amount').val()).toFixed(2),
									negative: eval($('#amount').val())>=0?true:false,
									description: $('#description').val(),
									date: moment($('#date').val(), 'D MMM YYYY').add(r, 'months').format('YYYYMMDD'),
									formatteddate: moment($('#date').val(), 'D MMM YYYY').format('DD MMM').toUpperCase(),
									account: [$('#account select').val(), $('#transfer select').val()],
									categories: $('#categories select').val()
								};
								break;
							}
						}
					}
					else {
						db.doc('transactions').collection(moment($('#date').val(), 'D MMM YYYY').add(r, 'months').format('YYYYMM')).add({
							amount: eval($('#amount').val())*-1,
							description: $('#description').val(),
							date: moment($('#date').val(), 'D MMM YYYY').add(r, 'months').format('YYYYMMDD'),
							account: [$('#account select').val(), $('#transfer select').val()],
							categories: $('#categories select').val()
						});
					}
				}
				
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
			},
			showTransactions: function() {
				$('.progressbar-infinite').show();
				singgit.transactions = [];
				db.doc("transactions").collection(singgit.activeYear+''+singgit.activeMonth).orderBy("date", "desc").get().then(function(querySnapshot) {
					querySnapshot.forEach(function(doc) {
						var transaction = doc.data();
						transaction.formatteddate = moment(transaction.date).format('DD MMM').toUpperCase();
						transaction.id = doc.id;
						transaction.negative = transaction.amount<0?true:false;
						transaction.amount = Math.abs(transaction.amount).toFixed(2);
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
		},
		updated: function() {
			/*
			this.$nextTick(function () {
				if(singgit.activeTab=='new') {
					singgit.newTransaction();
				}
			});
			*/
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