 
VuePager = {
    createPageComponent: function (componentName, pageOption) {
        Vue.component(componentName, {
            template: "#page",
            data: function () {
                return { 
                    pageOption: pageOption
                }
            },
            delimiters: ['${', '}'],
            computed: {
                pages: function () {
                    var pag = [];
                    if (this.pageOption.current < this.pageOption.showItem) { //如果当前的激活的项 小于要显示的条数
                        //总页数和要显示的条数那个大就显示多少条
                        var i = Math.min(this.pageOption.showItem, this.pageOption.allpage);
                        while (i) {
                            pag.unshift(i--);
                        }
                    } else { //当前页数大于显示页数了
                        var middle = this.pageOption.current - Math.floor(this.pageOption.showItem / 2), //从哪里开始
                            i = this.pageOption.showItem;
                        if (middle > (this.pageOption.allpage - this.pageOption.showItem)) {
                            middle = (this.pageOption.allpage - this.pageOption.showItem) + 1
                        }
                        while (i--) {
                            pag.push(middle++);
                        }
                    }
                    return pag
                }
            },
            methods: {
                goto: function (index) {
                    // if (index == this.current) return;
                    this.pageOption.current = index;
                    query.pageIndex = index;
                    getSearchResource()
                }
            }
        })
    }
}
