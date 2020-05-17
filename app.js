app = new Vue({
	el: '#app',
	data: {
		version: 'v20200517',
		progress: false,
		dbx: new Dropbox.Dropbox({accessToken: 'gLb9sbW8xDgAAAAAAAADyIxcjH6QBxbYI7o6qWl31VQweZV2b1U7MEcrq9X-hh6c'}),
		cloud: {
			error: null,
			lastAction: JSON.parse(localStorage.getItem('SINGGIT_LastAction') || '{"time":"No action", "size":"No action", "type":"No action", "duration":"No action"}'),
			backup: function() {
				app.progress = true
				app.cloud.error = null
				var start = moment()

				app.dbx.filesCopyV2({
					from_path: '/transactions.json',
					to_path: '/transactions '+start.format('YYYYMMDD HHmm')+'.json'
				})
				
				app.dbx.filesUpload({path:'/transactions.json', contents:localStorage.getItem('taffy_SINGGIT'), mode:'overwrite', mute:true})
					.then(function(response) {
						app.cloud.lastAction.time = moment().format('DD/MM/YYYY hh:mmA')
						app.cloud.lastAction.type = 'Backup'
						app.cloud.lastAction.size = app.bytesToSize(response.size)
						app.cloud.lastAction.duration = moment().diff(start)+' milliseconds'
						localStorage.setItem('SINGGIT_LastAction', JSON.stringify(app.cloud.lastAction))
						
						app.progress = false
					})
					.catch(function(error) {
						app.cloud.error = error
					})
			},
			overwrite: function() {
				app.progress = true
				app.cloud.error = null
				var start = moment()

				app.dbx.filesDownload({path:'/transactions.json'})
					.then(function(response) {
						var blob = response.fileBlob;
						var reader = new FileReader();
						reader.addEventListener("loadend", function() {
							app.cloud.lastAction.time = moment().format('DD/MM/YYYY hh:mmA')
							app.cloud.lastAction.type = 'Overwrite'
							app.cloud.lastAction.size = app.bytesToSize(response.size)
							app.cloud.lastAction.duration = moment().diff(start)+' milliseconds'
							localStorage.setItem('SINGGIT_LastAction', JSON.stringify(app.cloud.lastAction))

							app.transaction.data().remove()
							app.transaction.data.insert(reader.result)
							location.reload()
						})
						reader.readAsText(blob)
					})
					.catch(function(error) {
						app.cloud.error = error
					})
			},
			merge: function() {

			},
		},
		moment: moment,
		page: 'new',
		form: {
			___id: null,
			amount: null,
			amountGroup: null,
			negative: true,
			description: '',
							  
			category: 'Other',
			accountFrom: 'Wallet',
			accountTo: '',
			date: moment().format('YYYY-MM-DDTHH:mm'),
		},
		form_reset: {},
		lov: {
			accountFrom: ['Wallet', 'Credit Card', 'BIS', 'MBB', 'RHB', 'Loan', 'THJ'],
			category: ['Income', 'Other', 'Food', 'Rare', 'Transport', 'Service', 'Fixed', 'Transfer', 'Property'],
		},
		modalDifferent: {
			show: false,
			actual: [],
		},
		modalFilter: {
			show: false,
		},
		transaction: {
			data: null,
			filter: {
				search: '',
				accountFrom: '',
				category: '',
				dateFrom: null,
				dateTo: null
			},
			limit: 50,
			pageSize: 50,
			more: false,
			scrollY: 0,
			forceUpdate: 1,
			edit: function(item) {
				app.form = Object.assign({}, item)
				app.form.negative = app.form.amount < 0
				app.form.amount = app.toCurrency(app.form.amount).replace(/,/gi, '')
				app.page = 'edit'
			},
			save: function(isUpdate, isRetain) {
				app.form.description = app.form.description.trim()
				app.form.amount = eval(app.form.amount)

				//====================================================== auto AI start
				if(!app.form.amount && !app.form.description) {
					app.form.amount = 0
					app.form.description = 'Reconcile'
					app.form.category = ''
					app.form.accountFrom = 'Wallet'
				}
				if(app.form.amount && !app.form.description) {
					app.form.description = 'Food'
					app.form.category = 'Food'
				}
				if(app.form.category=='Transfer') {
					app.form.negative = false
				}
				//====================================================== auto AI end
				
				
				//====================================================== save amount in string for easier search
				if(app.form.negative) app.form.amount *= -1
				app.form.amountInString = app.form.amount.toFixed(2) || ""
				app.form.amountGroup = (app.form.amountGroup)?Number(app.form.amountGroup).toFixed(2):""
				
																	
				
				//====================================================== save into DB
				if(app.form.___id && isUpdate) app.transaction.data(app.form.___id).update(JSON.parse(JSON.stringify(app.form)))
				else app.form.___id = app.transaction.data.insert(JSON.parse(JSON.stringify(app.form))).first().___id
				
				
				app.transaction.forceUpdate++
								
				if(isRetain) {
					app.form.amount = ''
					app.form.description = ''
				}
				else app.page = 'transactions'
			},
			remove: function() {
				app.transaction.data(app.form.___id).remove()
				app.transaction.forceUpdate++
				app.page = 'transactions'
			},
		},
		statisticDate: moment().format('YYYY-MM-01'),
		autoComplete: {
			show: false,
			select: function(item) {
				app.form.accountFrom = item.accountFrom
				app.form.accountTo = item.accountTo
				app.form.category = item.category
				app.form.description = item.description
				app.form.negative = item.negative
			}
		},
		filteredSum: '0.00'
	},
	methods: {
		toCurrency: function(n) {
			return new Intl.NumberFormat('en-US', {
				minimumFractionDigits: 2
			}).format(Math.abs(n))
		},
		bytesToSize: function(bytes) {
			var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
			if(bytes == 0) return '0 Byte'
			var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)))
			return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i]
		},
		byValue: function(val) {
			return JSON.parse(JSON.stringify(val))
		},
		filterByStatistic: function(item) {
			this.transaction.filter.search = ''
			this.transaction.filter.accountFrom = ''
			this.transaction.filter.category = item
			this.transaction.filter.dateFrom = moment(this.statisticDate).startOf('month').format('YYYY-MM-DD')
			this.transaction.filter.dateTo = moment(this.statisticDate).endOf('month').format('YYYY-MM-DD')

			this.page = 'transactions'
		},
		trimBoth: function(str, chars) {
			return str.split(chars).filter(Boolean).join(chars)
		}
	},
	computed: {
		formDateFormatted: function() {
			return moment(this.form.date).format('DD/MM/YYYY')
		},
		filteredTransactions: function() {
			if(app.transaction.data().count()==0) return []
			
			this.transaction.filter.search = this.transaction.filter.search.replace(/,/gi, '')
			this.transaction.forceUpdate

			var search = this.transaction.filter.search
			var showHidden = search[0]=="!"
			var exactMatch = search[0]=="'" && search[search.length-1]=="'"
			if(showHidden) search = search.replace("!", "")
			if(exactMatch) search = this.trimBoth(search, "'")

			//=========================================================== actual mode
			var key1 = exactMatch?'isnocase':'likenocase'
			var key2 = showHidden?'left':'!left'
			var latestReconcileID = this.transaction.data({description: {'is': 'Reconcile'}}).order('date desc').get()[0].___id
			var match = this.transaction.data(
				[
					{amountInString:	{[key1]: search.replace(/RM|rm/,'')}},
					{amountGroup:		{[key1]: search.replace(/RM|rm/,'')}},
					{description:   	{[key1]: search}},
					{accountFrom:	   {[key1]: search}},
					{accountTo:			{[key1]: search}},
					{category:	  	{[key1]: search}}
				],
				[
					{accountFrom: {'likenocase': this.transaction.filter.accountFrom}},
					{accountTo: {'likenocase': this.transaction.filter.accountFrom}}
				],
				{category: {'likenocase': this.transaction.filter.category}},
				{date: {'>=': this.transaction.filter.dateFrom || '2000-00-00'}},
				{date: {'<=': this.transaction.filter.dateTo+'T24:00' || '5000-00-00'}},
				{description: {[key2]: '!'}},
				[
					{description: {'!is':'Reconcile'}},
					{___id: {'==':latestReconcileID}}
				]
			).order('date desc')
			
			//============================================= limit data
			this.transaction.more = match.count() > this.transaction.limit
			match = match.limit(this.transaction.limit).get()
			
			//========================================= reset temporary properties
			for(a=0; a<match.length; a++) {
				delete match[a].redundant
				delete match[a].classes
			}
			
			//============================================= grouping processing
			for(a=0; a<match.length; a++) {
																   
				for(b=a+1; b<match.length; b++) {
					
					//===================================== highlight redundant
					if(match[a].date==match[b].date && match[a].amountInString==match[b].amountInString) {
						match[a].redundant = true
						match[b].redundant = true
					}
				}
				
				//========================================= assign classes
				match[a].classes = (match[a].negative?'text-negative':'text-positive')+(match[a].redundant?' bg-warning':'')
			}
			
			//========================================= sum amount in current list
			this.filteredSum = this.toCurrency(match.reduce(function(sum, item){ return sum + item.amount }, 0))
			
			return match
		},
		autoCompleteItems: function() {
			if(this.transaction.data==null) {
				return []
			}
			else {
				var match = this.transaction.data(
					{description:{likenocase:this.form.description}}
				)
				.order('date desc')
				.distinct('accountFrom', 'accountTo', 'category', 'description', 'negative') //even change the order, it will always return in alphabetical order (a > d > t)

				var result = []
				for(x=0; x<5 && x<match.length; x++) {
					result.push({
						accountFrom: match[x][0],
						accountTo: match[x][1],
						category: match[x][2],
						description: match[x][3],
						negative: match[x][4],
					})
				}

				return result
			}
		},
		statistic: function() {
			var start = moment()

			this.transaction.forceUpdate
			
			var result = {
				balance: { Overall:0 },
				different: {},
				expenses: { Overall:0 },
			}

			this.lov.accountFrom.forEach(function(accountFrom){
				result.balance[accountFrom] =
					app.transaction.data({accountFrom:accountFrom, accountTo:''}).sum('amount') -
					app.transaction.data({accountFrom:accountFrom, accountTo:{'!is':''}}).sum('amount') +
					app.transaction.data({accountTo:accountFrom}).sum('amount')
									
				if(app.modalDifferent.actual[accountFrom]) app.modalDifferent.actual[accountFrom] = app.modalDifferent.actual[accountFrom].replace(/[^0-9.+-]/g, '')
				result.different[accountFrom] = (result.balance[accountFrom] - (Number(app.modalDifferent.actual[accountFrom]) || 0)).toFixed(2)

				if(accountFrom!='THJ') result.balance.Overall += result.balance[accountFrom]
			})

			this.lov.category.forEach(function(category){
				if(category!='Transfer') {
					result.expenses[category] = app.transaction.data(
						{category: category},
						{date: {'>=': moment(app.statisticDate).startOf('month').format('YYYY-MM-DD')}},
						{date: {'<=': moment(app.statisticDate).endOf('month').format('YYYY-MM-DD')}}
					).sum('amount')
	
					result.expenses.Overall += result.expenses[category]
				}
			})

			return result
		},
	},
	mounted: function() {
		this.transaction.data = TAFFY()
		this.transaction.data.store('SINGGIT')
		this.form_reset = this.byValue(this.form)

		window.onscroll = function() {
			if(app.page=='transactions') app.transaction.scrollY = window.scrollY
		}
		
		//====================================================== data massage exercise
		
		// app.transaction.data().each(function (record, recordnumber) {
			// record.amountInString = record.amount.toFixed(2)
		// })
		
		// app.transaction.data().each(function (record, recordnumber) {
			// if(record.negative==undefined) {
				// app.transaction.data(record.___id).update({negative:false})
			// }
		// })
		
		// app.transaction.data({description:"Groceries", category:{'!is':'Food'}}).get()			// find groceries that's not food
		
		// app.transaction.data({description:{right:' '}}).get()									// find all description end with space
		
		// app.transaction.data({category:'Fixed', date:{gt:'2019-07-00'}}).order('date desc').get().map(function(item){ return item.date + " " + item.description + ' ' + item.amount })
		
		// app.transaction.data([{'accountFrom': {'is': 'Loan'}}, {'accountTo': {'is': 'Loan'}}]).order('date desc').get().map(function(item){ return {amount:item.amount, description:item.description, accountFrom:item.accountFrom+' > '+item.accountTo} })
	},
	watch: {
		'transaction.filter.search': function(newVal) {
			this.transaction.limit = this.transaction.pageSize
		},
		'transaction.filter.accountFrom': function(newVal) {
			this.transaction.limit = this.transaction.pageSize
		},
		'transaction.filter.category': function(newVal) {
			this.transaction.limit = this.transaction.pageSize
		},
		'transaction.filter.dateFrom': function(newVal) {
			this.transaction.limit = this.transaction.pageSize
		},
		'transaction.filter.dateTo': function(newVal) {
			this.transaction.limit = this.transaction.pageSize
		},
		page: function(newVal) {
			if(newVal=='transactions') {
				Vue.nextTick().then(function () {
					window.scrollTo(0, app.transaction.scrollY)
				})
			}
		}
	}
})