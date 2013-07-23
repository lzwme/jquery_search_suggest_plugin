/* 
 * @date: 2013-07-08
 * Depends:
 * jquery.js
 *
 * function:搜索框提示功能插件
 */
(function($) {
    $.fn.searchTips = function(options) {
        defaults = {
            url: options.url,
            json: options.json || {data:[]},
            keyLeft: 37,
            //向左方向键
            keyUp: 38,
            //向上方向键
            keyRight: 39,
            //向右方向键
            keyDown: 40,
            //向下方向键
            keyEnter: 13,
            //回车键
            listHoverCSS: 'jhover',
            
            //提示框列表鼠标悬浮的样式
            tpl: '<div class="list"><div class="word" rel="{id}">{word}</div><div class="description">约{description}条记录</div></div>',
            topoffset: options.topoffset || 5
        };
        var options = $.extend(defaults, options);

        var dropDiv = $('<div></div>').addClass('dropDiv').appendTo('body');
        var isOver = false;
        dropDiv.hover(function() {
            isOver = true;
        }, function() {
            isOver = false;
        });

        return this.each(function() {
            var inputObj = $(this);
            $(this).bind('keydown', function(event) {
                if (dropDiv.css('display') != 'none') { //当提示层显示时才对键盘事件处理 
                    var currentList = dropDiv.find('.' + options.listHoverCSS);
                    if (event.keyCode == options.keyDown) { //如果按的是向下方向键 
                        if (currentList.length == 0) {
                            //如果提示列表没有一个被选中,则将列表第一个选中 
                            $(this).val(getPointWord(dropDiv.find('.list:first').mouseover()));
                        } else if (currentList.next().length == 0) {
                            //如果是最后一个被选中,则取消选中,即可认为是输入框被选中 
                            unHoverAll();
                        } else {
                            unHoverAll();
                            //将原先选中列的下一列选中 
                            if (currentList.next().length != 0) 
                                $(this).val(getPointWord(currentList.next().mouseover()));
                        }
                        return false;
                    } else if (event.keyCode == options.keyUp) { //如果按的是向上方向键 
                        if (currentList.length == 0) {
                            $(this).val(getPointWord(dropDiv.find('.list:last').mouseover()));
                        } else if (currentList.prev().length == 0) {
                            unHoverAll();
                        } else {
                            unHoverAll();
                            if (currentList.prev().length != 0) $(this).val(getPointWord(currentList.prev().mouseover()));
                        }
                        return false;
                    } else if (event.keyCode == options.keyEnter) dropDiv.empty().hide();
                }
                //当按下键之前记录输入框值,以方便查看键弹起时值有没有变 
                $(this).attr('alt', $(this).val());
            }).bind('keyup', function(event) {
                //如果弹起的键是向上或向下方向键则返回 
                if (event.keyCode == options.keyDown || event.keyCode == options.keyUp) return;
                if ($(this).val() == '') {
                    //dropDiv.empty().hide();
                    dropDiv.show();
                    //return;
                }
                //若输入框值没有改变或变为空则返回 
                if ($(this).val() == $(this).attr('alt')) return;
                getData(inputObj, $(this).val());
            }).bind('blur', function() {
                if (isOver && dropDiv.find('.' + options.listHoverCSS) != 0) return;
                //文本输入框失去焦点则清空并隐藏提示层 
                dropDiv.empty().hide();
            }).bind('click', function(){ //单击输入框时，应显示提示
                if ($(this).val() == $(this).attr('alt')) return;
                getData(inputObj, $(this).val());
            }); 

            /**处理ajax返回成功的方法**/
            handleResponse = function(parent, json) {
                var isEmpty = true;
                for (var o in json) {
                    if (o == 'data') isEmpty = false;
                }
                if (isEmpty) {
                    showError("返回数据格式错误!");
                    return;
                }
                if (json['data'].length == 0) {
                    //返回数据为空 
                    return;
                }
                refreshDropDiv(parent, json);
                dropDiv.show();
            } 

            /**处理ajax失败的方法**/
            handleError = function(error) {
                showError("url错误或超时，请求失败!"); 
            }
            showError = function(error) {
                alert(error);
            } 

            /**通过ajax返回json格式数据生成用来创建dom的字符串**/
            render = function(parent, json) {
                var res = json['data'] || json;
                var appendStr = '';
                //用json对象中内容替换模版字符串中匹配/\{([a-z]+)\}/ig的内容,如{word},{description} 
                for (var i = 0; i < res.length; i += 1) {
                    appendStr += options.tpl.replace(/\{([a-z]+)\}/ig, function(m, n) {
                        return res[i][n];
                    });
                }
                jebind(parent, appendStr);
            } 

            /**将新建dom对象插入到提示框中,并重新绑定mouseover事件监听**/
            jebind = function(parent, a) {
                dropDiv.append(a);
                dropDiv.find('.list').each(function() {
                    $(this).unbind('mouseover').mouseover(function() {
                        unHoverAll();
                        $(this).addClass(options.listHoverCSS);
                    }).unbind('click').click(function() {
                        parent.val(getPointWord($(this)));
                        dropDiv.empty().hide();
                        parent.focus();
                    });
                });
            } 

            /**将提示框中所有列的hover样式去掉**/
            unHoverAll = function() {
                dropDiv.find('.list').each(function() {
                    $(this).removeClass(options.listHoverCSS);
                });
            } 

            /**在提示框中取得当前选中的提示关键字**/
            getPointWord = function(p) {
                return p.find('div:first').text()
            } 

            /**刷新提示框,并设定样式**/
            refreshDropDiv = function(parent, json) {
                var left = parent.offset().left;
                var height = parent.height();
                var top = parent.offset().top + options.topoffset + height;
                var width = options.width || parent.width() + 'px';
                dropDiv.empty();
                dropDiv.css({
                    'border': '1px solid #FE00DF',
                    'left': left,
                    'top': top,
                    'width': width
                });
                render(parent, json);
                //防止ajax返回之前输入框失去焦点导致提示框不消失 
                parent.focus();
            } 
            /**通过ajax向服务器请求数据**/
            getData = function(parent, word) {

                /**给了url参数，则从服务器 ajax 请求帮助的 json **/
                if(typeof options.url != 'undefined'){
                    $.ajax({
                        type: 'GET',
                        data: "word=" + word,
                        url: options.url,
                        dataType: 'json',
                        timeout: 1000,
                        success: function(json) {
                            handleResponse(parent, json);
                        },
                        error: handleError
                    });
                    return;
                }

                /**没有给出url 参数，则从 json 参数获取或自行构造json帮助内容 **/
                var json = options.json || {
                    'data':[
                        {'id':'0','word':'23322111','description':'11'},
                        {'id':'1','word':'c22cc','description':'22'},
                        {'id':'2','word':'31133','description':'22'}
                    ],
                    'defaults':'默认的描述'
                };

                    console.log(json);
                if($.trim(word) != ''){ //输入框不为空时则进行匹配
                    var jsonStr = "{'data':[";
                    for (var i = json.data.length - 1; i >= 0; i--) {
                       if(json.data[i].word.indexOf(word) != -1){
                            jsonStr += "{'id':'" + json.data[i].id 
                                + "','word':'"+ json.data[i].word 
                                + "', 'description': '" + json.data[i].description 
                                + "'},";
                            //alert(i + '\r\n' + word + ' \r\n' + json.data[i].word);
                        }
                    };
                    jsonStr += "],'defaults':'" + json.defaults + "'}";
                    //alert(jsonStr);
                    //json = json2;//JSON.parse(json2);
                    //字符串转化为 js 对象
                    json = (new Function("return "+jsonStr ))();

                    //alert(json);

                    console.log(json);
                }

                handleResponse(parent, json);
            }
        });
    }
})(jQuery);

/*////////////////////////////////////////
用法：
1. 页面加入 css 代码
    <style type="text/css">
        .dropDiv { position: absolute; z-index: 10; display: none; cursor: hand;}
        .dropDiv .jhover { background-color: #00FEDF; }
        .dropDiv .list { float:left;width:100%; }
        .dropDiv .word { float:left; }
        .dropDiv .description { float:right; color: gray; text-align: right; font-size: 10pt; }
    </style>

2. 加载 js 代码

    <script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>
    //最好再加上以下代码，一边在连接google的API库是失效时调用本地的jQuery文件：
    <script>
    !window.jQuery && document.write('<script src="js/jquery.min.js"><\/script>');
    </script>
    <script type="text/javascript" src="searchtips/searchtips.js"></script>

    <script type="text/javascript">
        $(function() {　　
            $("input").searchTips({
                //url: 'http://localhost/tips/ajax?method=getsearchhelp', //*优先从url ajax 请求 json 帮助数据/
                json:{
                        'data':[
                            {'id':'0','word':'23322111','description':'11'},
                            {'id':'1','word':'c22cc','description':'22'}
                        ],
                        'defaults':'默认的描述'
                    },  //*无 url 参数时，则采用该参数数据，url 与 json 参数都不存在则使用缺省数据/
                width:350,   //*提示框的宽度，缺省为输入框的宽度相同/
                topoffset: 6,  //*提示框与输入框的距离，缺省为5/

            });
        });
    </script>

3. 使用示例

3.1 
*/