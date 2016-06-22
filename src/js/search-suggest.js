/*******************************************
 * @date        : 2013-07-18
 * @update      : 2014-02-15
 * @Depends      : jquery.js
 * @author      : l@lzw.me 志文工作室(http://lzw.me)
 * @description : 搜索框提示功能插件
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
    width:350,       //提示框的宽度，缺省为输入框的宽度相同
    topoffset: 6,    //提示框与输入框的距离，缺省为 6
    style: 'list',   //两种风格，一种为 list, 一种为 default
    cssFile: 'css/search-suggest.css'   //指定加载的 CSS 样式文件
});

2. 销毁：
$('input').searchSuggest('destroy');
********************************************/
/* eslint:  no-use-before:0 */
(function($) {
    /* 搜索建议插件 */
    $.fn.searchSuggest = function(opts) {
        //方法判断
        if (typeof opts === 'string' && methods[opts]) {
            //如果是方法，则参数第一个为函数名，从第二个开始为函数参数
            return methods[opts].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof opts === 'object' || !opts) {
            //调用初始化方法
            return methods.init.apply(this, arguments);
        }

    };

    //方法列表
    var methods = {
        //初始化
        init: function(opts) {
            /**处理ajax失败的方法**/
            var handleError = function(error) {
                showError("url错误或超时，请求失败!");
            };
            var showError = function(error) {
                //alert(error);
                console.log(error);
            };

            /**通过ajax返回json格式数据生成用来创建dom的字符串**/
            var render = function(parent, json, ddiv, opts) {
                var res = json.data || json;
                var appendStr = '<div class="content">';
                //用json对象中内容替换模版字符串中匹配/\{([a-z]+)\}/ig的内容,如{word},{description}
                for (var i = 0; i < res.length; i += 1) {
                    appendStr += opts.tpl.replace(/\{([a-z]+)\}/ig, function(m, n) {
                        return res[i][n];
                    });
                }
                appendStr += '</div><div class="description">' + opts.json.defaults + '</div>';
                jebind(parent, appendStr, ddiv, opts);
            };

            /**设置描述信息**/
            var setDescription = function(ddiv, opts) {
                var ddiv = ddiv || dropDiv;
                var opts = opts || options;

                if (!$.trim(ddiv.html())) {
                    ddiv.hide();
                    return;
                }
                var desc = ddiv.find('.description');

                //风格设置判断
                if (opts.style === 'list') { //每一行显示 word 及其描述
                    desc.hide();
                    ddiv.find('.content').css({
                        'width': '100%',
                        'border': '0'
                    });
                    ddiv.find('.content .list .word').css({
                        'width': "49%"
                    });
                    ddiv.find('.desc').show();
                    return;
                } else if (opts.style === 'line') { //只显示 word，一行一个
                    desc.hide();
                    ddiv.find('.desc').hide();
                    ddiv.find('.content').css({
                        'width': '100%',
                        'border': '0'
                    });
                    return;
                }

                var selectedList = ddiv.find('.' + opts.listHoverCSS);

                if (selectedList.length > 0) {
                    var rel_id = selectedList.find('.word').attr('rel_id').split('_');
                    var index = rel_id[rel_id.length - 1];
                    var de = opts.json.data[index].description;
                } else {
                    var de = opts.json.defaults;
                }

                desc.html(de);
            };

            /**将新建dom对象插入到提示框中,并重新绑定mouseover事件监听**/
            var jebind = function(parent, a, ddiv, opts) {
                var ddiv = ddiv || dropDiv,
                    opts = opts || options;

                ddiv.append(a);
                setDescription(ddiv, opts);
                ddiv.find('.list').each(function() {
                    $(this).unbind('mouseover').mouseover(function() {
                        unHoverAll(ddiv, opts);
                        $(this).addClass(opts.listHoverCSS);
                        setDescription(ddiv, opts);
                    }).unbind('click').click(function() {
                        var inputValList;
                        if (opts.multiWord) { //空格分隔的多关键字处理
                            inputValList = parent.val().split(' ');
                            inputValList[inputValList.length - 1] = getPointWord($(this));
                            parent.val(inputValList.join(' '));
                        } else {
                            parent.val(getPointWord($(this)));
                        }
                        //ddiv.empty().hide();
                        parent.focus();
                    });
                });
            };

            /**将提示框中所有列的hover样式去掉**/
            var unHoverAll = function(ddiv, opts) {
                var ddiv = ddiv || dropDiv,
                    opts = opts || options;

                ddiv.find('.' + opts.listHoverCSS).removeClass(opts.listHoverCSS);

                setDescription(ddiv, opts);
            };

            /**在提示框中取得当前选中的提示关键字**/
            var getPointWord = function(p) {
                return p.find('div:first').text()
            };

            /**刷新提示框,并设定样式**/
            var refreshDropDiv = function(parent, json, ddiv, opts) {
                var left, height, top, width,
                    ddiv = ddiv || dropDiv,
                    opts = opts || options;

                json = validData = processData(json);

                if (!validData || ! json.data.length) {
                    ddiv.hide();
                    return false;
                }

                left = parent.offset().left;
                height = parent.height();
                top = parent.offset().top + opts.topoffset + height;
                width = opts.width || parent.width() + 'px';

                ddiv.empty();
                ddiv.css({
                    'left': left,
                    'top': top,
                    'width': width
                });
                render(parent, json, ddiv, opts);
                //防止ajax返回之前输入框失去焦点导致提示框不消失
                parent.focus();
                ddiv.fadeIn(500);
            };

            /**通过 ajax 或 json 参数获取数据**/
            var getData = function(word, parent, callback, ddiv, opts) {
                var json, validData,
                    ddiv = ddiv || dropDiv,
                    opts = opts || options;


                /**给了url参数，则从服务器 ajax 请求帮助的 json **/
                console.log(opts.url + word);
                if (opts.url) {
                    var hyphen = opts.url.indexOf('?') > -1 ? '&' : "?"; //简单判断，如果url已经存在？，则jsonp的连接符应该为&
                    var URL = opts.jsonp ? [opts.url + word, hyphen, opts.jsonp, '=?'].join('') : opts.url + word; //开启jsonp，则修订url，不可以用param传递，？会被编码为%3F
                    $.ajax({
                        type: 'GET',
                        /*data: "word=" + word,*/
                        url: URL,
                        dataType: 'json',
                        timeout: 3000,
                        success: function(data) {

                            callback(parent, data, ddiv, opts); //为 refreshDropDiv

                        },
                        error: handleError
                    });
                } else {
                    /**没有给出url 参数，则从 json 参数获取或自行构造json帮助内容 **/
                    json = opts.json;
                    validData = checkData(json);
                    //本地的 json 数据
                    if (validData && $.trim(word)) { //输入不为空时则进行匹配
                        var jsonStr = "{'data':[";
                        for (var i = json.data.length - 1; i >= 0; i--) {
                            if (json.data[i].word.indexOf(word) > -1 || word.indexOf(json.data[i].word) > -1) {
                                jsonStr += "{'id':'" + json.data[i].id + "','word':'" + json.data[i].word + "', 'description': '" + json.data[i].description + "'},";
                            }
                        };
                        jsonStr += "],'defaults':'" + json.defaults + "'}";

                        //字符串转化为 js 对象
                        json = (new Function("return " + jsonStr))();
                        console.log(json)
                    }
                    callback(parent, json, ddiv, opts);
                } //else

                return;
            };

            /** url 获取数据时，对数据的处理，作为 getData 的回调函数 **/
            var processData = function(json) {

                return validData = checkData(json);
                //url 请求的数据
                //if(!opts.url) return validData;
            };

            /**检测 ajax 返回成功数据或 json 参数数据是否有效**/
            var checkData = function(json) {
                var isEmpty = ! $.isArray(json.data);
                if (isEmpty) {
                    showError("返回数据格式错误!");
                    return false;
                }
                if (! json['data'].length) {
                    showError("返回数据为空!");
                    return false;
                }

                return json;
            };
            /**
             * 加载 css 文件
             * @param  {[type]} filename [description]
             * @return {[type]}          [description]
             */
            var loadCssFlie = function(filename) {
                if (!filename) {
                    return;
                }

                //如果已经存在，则不加载
                var linkList = document.getElementsByTagName('link');
                for (var i = linkList.length - 1; i >= 0; i--) {
                    if (linkList[i].href.indexOf(filename) > -1) {
                        return;
                    }
                };

                var fileref = document.createElement('link');
                fileref.setAttribute('rel', 'stylesheet');
                fileref.setAttribute('type', 'text/css');
                fileref.setAttribute('href', filename);
                document.getElementsByTagName('head')[0].appendChild(fileref);
            };

            //参数设置
            var options = $.extend({
                url: '',        //请求数据的 URL。优先从url ajax 请求 json 帮助数据，注意最后一个参数为关键字请求参数
                jsonp: null,    //设置此参数名，将开启jsonp功能，否则使用json数据结构
                json: {         //注意数据格式
                    data: [{
                        'id': '0',
                        'word': 'lzw.me',
                        'description': 'http://lzw.me'
                    }],
                    defaults: 'http://lzw.me'
                },
                style: 'default',                   //风格样式，[line,list,default]
                cssFile: '',                        //提示框加载的 css 样式文件路径。为空时，应手动在页面引入
                dropDivClassName: 'search-suggest', //提示框样式名称
                listHoverCSS: 'jhover',             //提示框列表鼠标悬浮的样式
                tpl: '<div class="list"><div class="word" rel_id="st_{id}">{word}</div><div class="desc">{description}</div></div>',
                //行模板
                multiWord: false,                   //以空格分隔的多关键字支持
                processData: processData,           //格式化数据的方法，注意格式化后的数据格式
                getData: getData,                   //获取数据的方法
                topoffset: 6,                       //提示框与输入框的距离
                keyLeft: 37,                        //向左方向键
                keyUp: 38,                          //向上方向键
                keyRight: 39,                       //向右方向键
                keyDown: 40,                        //向下方向键
                keyEnter: 13                        //回车键
            }, opts);
            options.json.defaults = options.json.defaults || '';

            if ($.isFunction(options.processData)) {
                processData = options.processData;
            }

            if ($.isFunction(options.getData)) {
                getData = options.getData;
            }

            //是否已经初始化的检测
            var data = this.data('searchsuggest');

            if (data) {
                return this;
            }
            this.data('searchsuggest', {
                target: this,
                options: options
            });
            loadCssFlie(options.cssFile);

            var dropDiv = $('<div class="' + options.dropDivClassName + '"></div>').appendTo('body');

            var isOver = false;
            dropDiv.hover(function() {
                isOver = true;
            }, function() {
                isOver = false;
            });

            return this.each(function() {
                var $this = $(this);
                //$this.off(); //首先解除所有的事件绑定
                $this.bind('keydown', function(event) {
                    if (dropDiv.css('display') !== 'none') { //当提示层显示时才对键盘事件处理
                        var currentList = dropDiv.find('.' + options.listHoverCSS),
                            tipsWord = ''; //提示列表上被选中的关键字
                        if (event.keyCode === options.keyDown) { //如果按的是向下方向键
                            if (! currentList.length) {
                                //如果提示列表没有一个被选中,则将列表第一个选中
                                tipsWord = getPointWord(dropDiv.find('.list:first').mouseover());
                            } else if (! currentList.next().length) {
                                //如果是最后一个被选中,则取消选中,即可认为是输入框被选中，并恢复输入的值
                                unHoverAll(dropDiv, options);
                                $this.val($this.attr('alt'));
                            } else {
                                unHoverAll(dropDiv, options);
                                //将原先选中列的下一列选中
                                if (currentList.next().length)
                                    tipsWord = getPointWord(currentList.next().mouseover());
                            }
                        } else if (event.keyCode === options.keyUp) { //如果按的是向上方向键
                            if (! currentList.length) {
                                tipsWord = getPointWord(dropDiv.find('.list:last').mouseover());
                            } else if (! currentList.prev().length) {
                                unHoverAll(dropDiv, options);
                                $this.val($this.attr('alt'));

                            } else {
                                unHoverAll(dropDiv, options);
                                if (currentList.prev().length) {
                                    tipsWord = getPointWord(currentList.prev().mouseover());
                                }
                            }
                        } else if (event.keyCode === options.keyEnter) dropDiv.empty().hide();

                        //支持空格为分割的多个提示
                        if (tipsWord) {
                            if (opts.multiWord) { //支持空格分隔的多个关键字提示
                                var inputVal = $this.val();
                                var inputValList = inputVal.split(' ');
                                inputValList[inputValList.length - 1] = tipsWord;
                                $this.val(inputValList.join(' '));
                            } else {
                                $this.val(tipsWord);
                            }
                            return false;
                        }
                    }

                    //当按下键之前记录输入框值,以方便查看键弹起时值有没有变
                    $this.attr('alt', $.trim($this.val()));
                }).bind('keyup', function(event) {
                    var word, words;

                    //如果弹起的键是向上或向下方向键则返回
                    if (event.keyCode === options.keyDown || event.keyCode === options.keyUp) {
                        return;
                    }

                    word = $.trim($this.val());

                    //若输入框值没有改变或变为空则返回
                    if (word && word === $this.attr('alt')) {
                        return;
                    }

                    if (opts.multiWord) {
                        words = word.split(' ');
                        word = words[words.length - 1];
                    }

                    getData($.trim(word), $this, refreshDropDiv, dropDiv, options);
                }).bind('blur', function() {
                    if (isOver) {
                        return;
                    }
                    //文本输入框失去焦点则清空并隐藏提示层
                    dropDiv.empty().hide();
                }).bind('click', function() { //单击输入框时，应显示提示
                    var word, words;

                    word = $this.val();

                    if ($.trim(word) && word === $this.attr('alt') || dropDiv.css('display') !== 'none') {
                        return;
                    }

                    if (opts.multiWord) {
                        words = word.split(' ');
                        word = words[words.length - 1];
                    }

                    getData($.trim(word), $this, refreshDropDiv, dropDiv, options);
                    //setDescription();
                });
            });
        },
        show: function() {
            var data = this.data('searchsuggest');
            if (data && data.options) {
                $("." + data.options.dropDivClassName).show();
            };
            return this;
        },
        hide: function() {
            var data = this.data('searchsuggest');
            if (data && data.options) {
                $("." + data.options.dropDivClassName).hide();
            };
            return this;
        },
        //销毁
        destroy: function() {
            var data = this.data('searchsuggest');
            if (data && data.options) {
                $("." + data.options.dropDivClassName).remove();
            };
            return this.each(function() {
                $(this).unbind(); //首先解除所有的事件绑定
            })
        }
    };
})(jQuery);
