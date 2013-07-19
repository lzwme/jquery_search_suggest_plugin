/*******************************************
 * @date    : 2013-07-18
 * Depends  : jquery.js
 * author   : l@lzw.me
 * function : 搜索框提示功能插件
 */
/*******************************************
使用示例

1. 使用插件：
$('input').searchSuggest({
    //url: 'http://localhost/tips/ajax?method=getsearchhelp', //优先从url ajax 请求 json 帮助数据
    json:{  //若无 url，则从自定义 json 中取得数据
        'data':[
            {'id':'0','word':'@','description':'根据设备名（或前缀）搜索<br>例如：<code>@CNC-BJ</code>'},
            {'id':'1','word':'~','description':'根据应用名称搜索<br>例如：<code>~ng</code>'},
            {'id':'2','word':'#','description':'根据频道名称搜索<br>例如：<code>#</code>'},
            {'id':'3','word':'/','description':'根据 MRTG 标注搜索<br>例如：<code>/webcache</code>'}
        ],
        'defaults':'设备搜索帮助提示'
    },
    width:350,      //提示框的宽度，缺省为输入框的宽度相同
    topoffset: 6,   //提示框与输入框的距离，缺省为 5
    style: 'list',   //两种风格，一种为 list, 一种为 default
    cssFile: 'searchsuggest/search-suggest.css'   //指定加载的 CSS 样式文件

});

2. 销毁：
$('input').searchSuggest('destroy');
********************************************/
!window.jQuery && document.writeln("<script src=\"http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js?ver=1.9.1\"></script>");

(function($) {
    /**
     * @desc 仿oninput的特殊事件，因为onpropertychange在ie下，用js改变值也会被触发，
     * 在suggest插件中就不是很好用了。故使用这个特殊事件插件, 原插件位于http://www.zurb.com/playground/jquery-text-change-custom-event，
     * 这里已经对实现做了修改，将.data('lastValue')改为.attr('lastValue'）存储以提高性能。
     */
    $.event.special.textchange = { //bind('textchange', function(event, oldvalue, newvalue){}) //传入旧值和当前新值
        setup: function (data, namespaces) {
          $(this).attr('lastValue', this.contentEditable === 'true' ? $(this).html() : $(this).val());
            $(this).bind('keyup.textchange', $.event.special.textchange.handler);
            $(this).bind('cut.textchange paste.textchange input.textchange', $.event.special.textchange.delayedHandler);
        },
        teardown: function (namespaces) {
            $(this).unbind('.textchange');
        },
        handler: function (event) {
            $.event.special.textchange.triggerIfChanged($(this));
        },
        delayedHandler: function (event) {
            var element = $(this);
            setTimeout(function () {
                $.event.special.textchange.triggerIfChanged(element);
            }, 25);
        },
        triggerIfChanged: function (element) {
          var current = element[0].contentEditable === 'true' ? element.html() : element.val();
            if (current !== element.attr('lastValue')) {
                element.trigger('textchange',  element.attr('lastValue'), current).attr('lastValue', current);
            };
        }
    };

    /* 搜索建议插件 */
    $.fn.searchSuggest = function(opts) {
        //方法判断
        if ( methods[opts] ) {
            //如果是方法，则参数第一个为函数名，从第二个开始为函数参数
            return methods[ opts ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        }else if(typeof opts === 'object' || !opts){
            //调用初始化方法
            return methods.init.apply(this, arguments);
        }

    }

    //方法列表
    var methods = {
        //初始化
        init: function(opts){

            /**处理ajax失败的方法**/
            var handleError = function(error) {
                showError("url错误或超时，请求失败!"); 
            }
            var showError = function(error) {
                //alert(error);
                console.log(error);
            } 

            /**通过ajax返回json格式数据生成用来创建dom的字符串**/
            var render = function(parent, json) {
                var res = json['data'] || json;
                var appendStr = '<div class="content">';
                //用json对象中内容替换模版字符串中匹配/\{([a-z]+)\}/ig的内容,如{word},{description} 
                for (var i = 0; i < res.length; i += 1) {
                    appendStr += options.tpl.replace(/\{([a-z]+)\}/ig, function(m, n) {
                        return res[i][n];
                    });
                }
                appendStr += '</div><div class="description">' + options.json.defaults + '</div>';
                jebind(parent, appendStr);
            } 

            /**设置描述信息**/
            var setDescription = function(){
                if(dropDiv.html() == ''){
                    dropDiv.hide();
                    return;
                }
                var desc = dropDiv.find('.description');

                //console.log(options);
                //风格设置判断
                if(options.style == 'list'){ //每一行显示 word 及其描述
                    desc.hide();
                    dropDiv.find('.content').css({'width':'100%','border':'0'});
                    dropDiv.find('.content .list .word').css({'width':"49%"});
                    dropDiv.find('.desc').show();
                    return;
                }else if(options.style == 'line'){ //只显示 word，一行一个
                    desc.hide();
                    dropDiv.find('.desc').hide();
                    dropDiv.find('.content').css({'width':'100%','border':'0'});
                    return;
                }

                var selectedList = dropDiv.find('.' + options.listHoverCSS);

                if(selectedList.length > 0){
                    var rel_id = selectedList.find('.word').attr('rel_id').split('_');
                    var index = rel_id[rel_id.length - 1];
                    var de = options.json.data[index].description;
                }else{
                    var de = options.json.defaults;
                }
                
                desc.html(de);
            }

            /**将新建dom对象插入到提示框中,并重新绑定mouseover事件监听**/
            var jebind = function(parent, a) {
                dropDiv.append(a);
                setDescription();
                dropDiv.find('.list').each(function() {
                    $(this).unbind('mouseover').mouseover(function() {
                        unHoverAll();
                        $(this).addClass(options.listHoverCSS);
                        setDescription();
                    }).unbind('click').click(function() {
                        var inputValList = parent.val().split(' ');
                        inputValList[inputValList.length - 1] = getPointWord($(this));
                        parent.val(inputValList.join(' '));
                        //dropDiv.empty().hide();
                        parent.focus();
                    });
                });
            } 

            /**将提示框中所有列的hover样式去掉**/
            var unHoverAll = function() {
                dropDiv.find('.list').each(function() {
                    $(this).removeClass(options.listHoverCSS);
                });
                setDescription();
            } 

            /**在提示框中取得当前选中的提示关键字**/
            var getPointWord = function(p) {
                return p.find('div:first').text()
            } 

            /**刷新提示框,并设定样式**/
            var refreshDropDiv = function(parent, json) {
                var left = parent.offset().left;
                var height = parent.height();
                var top = parent.offset().top + options.topoffset + height;
                var width = options.width || parent.width() + 'px';
                dropDiv.empty();
                dropDiv.css({
                    'left': left,
                    'top': top,
                    'width': width
                });
                render(parent, json);
                //防止ajax返回之前输入框失去焦点导致提示框不消失 
                parent.focus();
            } 

            /**通过 ajax 或 json 参数获取数据**/
            var getData = function(parent, word) {
                var validData = false;
                var json;

                /**给了url参数，则从服务器 ajax 请求帮助的 json **/
                console.log(options.url + word);
                if(options.url != null){
                    var hyphen = options.url.indexOf('?') != -1 ? '&' : "?"; //简单判断，如果url已经存在？，则jsonp的连接符应该为&
                    var URL = options.jsonp ? [options.url+word, hyphen, options.jsonp, '=?'].join('') : options.url + word; //开启jsonp，则修订url，不可以用param传递，？会被编码为%3F
                    $.ajax({
                        type: 'GET',
                        /*data: "word=" + word,*/
                        url: URL,
                        dataType: 'json',
                        timeout: 3000,
                        success: function(data) {
                            json = validData = processData(data);

                            if(validData && json.data.length > 0){
                                dropDiv.fadeIn(500,refreshDropDiv(parent, json));
                            }else{
                                dropDiv.hide();
                            }
                        },
                        error: handleError
                    });
                }else{
                    /**没有给出url 参数，则从 json 参数获取或自行构造json帮助内容 **/
                    json = options.json;
                    validData = checkData(json);

                    if(validData && $.trim(word) != ''){ //输入不为空时则进行匹配
                        var jsonStr = "{'data':[";
                        for (var i = json.data.length - 1; i >= 0; i--) {
                           if(json.data[i].word.indexOf(word) != -1 || word.indexOf(json.data[i].word) != -1){
                                jsonStr += "{'id':'" + json.data[i].id 
                                    + "','word':'"+ json.data[i].word
                                    + "', 'description': '" + json.data[i].description 
                                    + "'},";
                            }
                        };
                        jsonStr += "],'defaults':'" + json.defaults + "'}";
                        //alert(jsonStr);
                        //json = json2;//JSON.parse(json2);
                        //字符串转化为 js 对象
                        json = (new Function("return "+jsonStr ))();
                    }
                    if(validData && json.data.length > 0){
                        dropDiv.fadeIn(500,refreshDropDiv(parent, json));
                    }else{
                        dropDiv.hide();
                    }
                }//else

                return;
            }
            
            /** url 获取数据时，对数据的处理，一般可由客户端来处理 **/
            var processData = function(json){
                return checkData(json);
            }

            /**检测 ajax 返回成功数据或 json 参数数据是否有效**/
            var checkData = function(json) {
                var isEmpty = true;
                for (var o in json) {
                    if (o == 'data') isEmpty = false;
                }
                if (isEmpty) {
                    showError("返回数据格式错误!");
                    return false;
                }
                if (json['data'].length == 0) {
                    showError("返回数据为空!");
                    return false;
                }

                return json;
            }

            var loadCssFlie = function(filename){
                //如果已经存在，则不加载
                var linkList = document.getElementsByTagName('link');
                for (var i = linkList.length - 1; i >= 0; i--) {
                    if(linkList[i].href.indexOf(filename) != -1){
                        return;
                    }
                };

                var fileref = document.createElement('link');
                fileref.setAttribute('rel', 'stylesheet');
                fileref.setAttribute('type', 'text/css');
                fileref.setAttribute('href', filename);
                document.getElementsByTagName('head')[0].appendChild(fileref);
            }

            //参数设置
            var options = $.extend({
                url: null,
                jsonp: null, //设置此参数名，将开启jsonp功能，否则使用json数据结构
                json: {
                    'data':[
                        {'id':'0','word':'23322111','description':'11'},
                        {'id':'1','word':'c22cc','description':'22'},
                        {'id':'2','word':'31133','description':'22'}
                    ],
                    'defaults':'默认的描述'
                },
                style: 'default',
                cssFile: '/our/css/search-suggest.css',
                listHoverCSS: 'jhover', //提示框列表鼠标悬浮的样式
                tpl: '<div class="list"><div class="word" rel_id="st_{id}">{word}</div><div class="desc">{description}</div></div>',
                processData: null, //格式化数据的方法
                getData: null,  //获取数据的方法
                topoffset: 5,
                keyLeft: 37,    //向左方向键
                keyUp: 38,      //向上方向键
                keyRight: 39,   //向右方向键
                keyDown: 40,    //向下方向键
                keyEnter: 13    //回车键
            }, opts);
            options.json.defaults = options.json.defaults || '';

            if($.isFunction(options.processData)){
                processData = options.processData;
            }

            if($.isFunction(options.getData)){
                processData = options.getData;
            }

            //是否已经初始化的检测
            var data = this.data('searchsuggest');
            if(data){
                return this;
            }
            this.data('searchsuggest',{target:this, options:options});
            loadCssFlie(options.cssFile);

            var dropDiv = $('<div class="search-suggest"></div>').appendTo('body');
            //var dropDiv = $(this).after('<div class="search-suggest" id="search_suggest_'+ $(this).attr('id') +'"></div>').next();

            var isOver = false;
            dropDiv.hover(function() {
                isOver = true;
            }, function() {
                isOver = false;
            });

            return this.each(function() {

                var $this = $(this);
                //$(this).unbind(); //首先解除所有的事件绑定

                $(this).bind('keydown', function(event) {
                    if (dropDiv.css('display') != 'none') { //当提示层显示时才对键盘事件处理 
                        var currentList = dropDiv.find('.' + options.listHoverCSS);
                        var tipsWord = '';
                        if (event.keyCode == options.keyDown) { //如果按的是向下方向键 
                            if (currentList.length == 0) {
                                //如果提示列表没有一个被选中,则将列表第一个选中 
                                tipsWord = getPointWord(dropDiv.find('.list:first').mouseover());
                            } else if (currentList.next().length == 0) {
                                //如果是最后一个被选中,则取消选中,即可认为是输入框被选中，并恢复输入的值
                                unHoverAll();
                                $(this).val($(this).attr('alt'));
                            } else {
                                unHoverAll();
                                //将原先选中列的下一列选中 
                                if (currentList.next().length != 0) 
                                    tipsWord = getPointWord(currentList.next().mouseover());
                            }
                        } else if (event.keyCode == options.keyUp) { //如果按的是向上方向键 
                            if (currentList.length == 0) {
                                tipsWord = getPointWord(dropDiv.find('.list:last').mouseover());
                            } else if (currentList.prev().length == 0) {
                                unHoverAll();
                                $(this).val($(this).attr('alt'));

                            } else {
                                unHoverAll();
                                if (currentList.prev().length != 0)
                                    tipsWord = getPointWord(currentList.prev().mouseover());
                            }
                        } else if (event.keyCode == options.keyEnter) dropDiv.empty().hide();

                        //支持空格为分割的多个提示
                        if(tipsWord != ''){
                            var inputVal = $(this).val();
                            var inputValList = inputVal.split(' ');
                            inputValList[inputValList.length - 1] = tipsWord;
                            $(this).val(inputValList.join(' '));
                            return false;
                        }
                    }

                    //当按下键之前记录输入框值,以方便查看键弹起时值有没有变 
                    $(this).attr('alt', $(this).val());
                }).bind('keyup', function(event) {
                    //如果弹起的键是向上或向下方向键则返回 
                    if (event.keyCode == options.keyDown || event.keyCode == options.keyUp) return;

                    //若输入框值没有改变或变为空则返回
                    if ($(this).val() != '' && $(this).val() == $(this).attr('alt')) return;

                    var words = $(this).val().split(' ');
                    getData( $this, words[words.length-1]);
                }).bind('blur', function() {
                    if (isOver && dropDiv.find('.' + options.listHoverCSS) != 0) return;
                    //文本输入框失去焦点则清空并隐藏提示层 
                    dropDiv.empty().hide();
                }).bind('click', function(){ //单击输入框时，应显示提示
                    if ($(this).val() != '' && $(this).val() == $(this).attr('alt') || dropDiv.css('display') != 'none') return;

                    var words = $(this).val().split(' ');
                    getData( $this, words[words.length-1]);
                    //setDescription();
                });

            });

        },
        show: function(){
            $('.search-suggest').show();
            return this;
        },
        hide: function(){
            $('.search-suggest').hide();
            return this;
        },
        //销毁
        destroy: function(){
            $('.search-suggest').remove();
            this.removeData('searchsuggest');

            return this.each(function(){
                $(this).unbind(); //首先解除所有的事件绑定
            })
        }
    }

})(jQuery);