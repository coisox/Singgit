app = new Vue({
    el: '#app',
    data: {
		version: 'v20190620',
        dbx: new Dropbox.Dropbox({accessToken: 'gLb9sbW8xDgAAAAAAAADyIxcjH6QBxbYI7o6qWl31VQweZV2b1U7MEcrq9X-hh6c'}),
        cloud: {
            error: null,
            lastAction: JSON.parse(localStorage.getItem('SINGGIT_LastAction') || '{"time":"No action", "size":"No action", "type":"No action", "duration":"No action"}'),
            backup: function() {
                app.cloud.error = null
                var start = moment()
                
                app.dbx.filesUpload({path:'/transactions.json', contents:localStorage.getItem('taffy_SINGGIT'), mode:'overwrite', mute:true})
                    .then(function(response) {
                        app.cloud.lastAction.time = moment().format('DD/MM/YYYY hh:mmA')
                        app.cloud.lastAction.type = 'Backup'
                        app.cloud.lastAction.size = app.bytesToSize(response.size)
                        app.cloud.lastAction.duration = moment().diff(start)+' milliseconds'
                        localStorage.setItem('SINGGIT_LastAction', JSON.stringify(app.cloud.lastAction))
                    })
                    .catch(function(error) {
                        app.cloud.error = error
                    })
            },
            overwrite: function() {
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
                            app.transaction.data.merge(reader.result)
                            app.transaction.forceUpdate++
                        });
                        reader.readAsText(blob);
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
            negative: true,
            description: '',
            account: 'Wallet',
            category: 'Other',
            transferto: '',
            date: moment().format('YYYY-MM-DDTHH:mm'),
        },
        form_reset: {},
        lov: {
            account: ['Wallet', 'Credit Card', 'BIS', 'MBB', 'RHB', 'THJ', 'Loan'],
            category: ['Other', 'Food', 'Big', 'Transport', 'Service', 'Fixed', 'Asjustment', 'Income', 'Transfer', 'Exclude Stat'],
        },
		modalDifferent: {
			show: false,
			actual: [],
		},
        transaction: {
            data: null,
            filter: '',
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
                if(app.form.negative) app.form.amount *= -1

				//====================================================== auto AI start
				if(!app.form.amount && !app.form.description) {
					app.form.amount = 0
					app.form.description = 'Reconcile'
					app.form.category = 'Food'
					app.form.account = 'Wallet'
				}
				if(app.form.amount && !app.form.description) {
					app.form.description = 'Food'
					app.form.category = 'Food'
				}
				if(app.form.category=='Transfer') {
					app.form.negative = false
				}
				//====================================================== auto AI end
				
                app.form.amountInString = app.form.amount.toFixed(2)
				
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
                app.form.account = item[0]
                app.form.category = item[1]
                app.form.description = item[2]
                app.form.negative = item[3]
                app.form.transferto = item[4]
            }
        }
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
        }
    },
    computed: {
        formDateFormatted: function() {
            return moment(this.form.date).format('DD/MM/YYYY')
        },
        filteredTransactions: function() {
			this.transaction.filter = this.transaction.filter.replace(/,/gi, '')
            this.transaction.forceUpdate

            //=========================================================== maintenance mode
            // return this.transaction.data({description:"Groceries", category:{'!is':'Food'}}).get()			// find groceries that's not food
            // return this.transaction.data({description:{right:' '}}).get()                                	// find all description end with space

            //=========================================================== actual mode
            var match = this.transaction.data(
                [
                    {amountInString:{likenocase:this.transaction.filter}},
                    {description:   {likenocase:this.transaction.filter}},
                    {account:       {likenocase:this.transaction.filter}},
                    {category:      {likenocase:this.transaction.filter}},
                    {transferto:    {likenocase:this.transaction.filter}},
                ]
            ).order('date desc')
            
            this.transaction.more = match.count() > this.transaction.limit

            return match.limit(this.transaction.limit).get()
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
                .distinct('account', 'category', 'description', 'negative', 'transferto') //even change the order, it will always return in alphabetical order (a > d > t)
    
                return match.slice(0, 5)
            }
        },
        statistic: function() {
            var start = moment()

            this.transaction.forceUpdate

            var result = { balance:{ Overall:0 }, different:{} }

            this.lov.account.forEach(function(account){
                result.balance[account] =
                    app.transaction.data({account:account, transferto:''}).sum('amount') -
                    app.transaction.data({account:account, transferto:{'!is':''}}).sum('amount') +
                    app.transaction.data({transferto:account}).sum('amount')
				
				result.different[account] = (result.balance[account] - (Number(app.modalDifferent.actual[account]) || 0)).toFixed(2)

                if(account!='THJ') result.balance.Overall += result.balance[account]
            })

            console.log('Statistic timelapse in milliseconds: ', moment().diff(start))

            return result
        }
    },
    mounted: function() {
        this.transaction.data = TAFFY()
        this.transaction.data.store('SINGGIT')
        this.form_reset = this.byValue(this.form)

        window.onscroll = function() {
            if(app.page=='transactions') app.transaction.scrollY = window.scrollY
        }
    },
    watch: {
        'transaction.filter': function(newVal) {
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