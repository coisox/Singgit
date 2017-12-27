if ('serviceWorker' in navigator) {
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
			accounts: ['Wallet', 'BIS', 'MBB', 'RHB'],
			categories: ['Food', 'Other', 'Big', 'Transport', 'Vehicle Service', 'Fixed', 'Loan', 'Adjustment', 'Income', 'Opening'],
			transactions: [],
			notcordova: !(document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1)
		},
		methods: {
			deleteTransaction: function() {
				
			},
			newTransaction: function() {
				$('form')[0].reset();
				$('#date').val(moment().format('YYYY-MM-DD'));
				$('#account .item-after').text($('#account select').val());
				$('#categories .item-after').text('');
				$('#transfer .item-after').text('');
				
				singgit.activeTab = 'new';
			},
			saveTransaction: function() {
				for(r=0; r<$('#repeat').val(); r++) {
					db.doc('transactions').collection(moment($('#date').val()).add(r, 'months').format('YYYYMM')).add({
						amount: eval($('#amount').val())*-1,
						description: $('#description').val(),
						date: moment($('#date').val()).add(r, 'months').format('YYYYMMDD'),
						account: [$('#account select').val(), $('#transfer select').val()],
						categories: $('#categories select').val()
					});
				}
			},
			showTransactions: function() {
				$('.progressbar-infinite').show();
				singgit.transactions = [];
				db.doc("transactions").collection(singgit.activeYear+''+singgit.activeMonth).orderBy("date", "desc").get().then(function(querySnapshot) {
					querySnapshot.forEach(function(doc) {
						var transaction = doc.data();
						transaction.date = moment(transaction.date).format('DD MMM').toUpperCase();
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

			$('#date').val(moment().format('YYYY-MM-DD'));
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
