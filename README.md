jquery_search_suggest_plugin
============================
jQuery 搜索建议插件

插件使用方法
============================
安装使用步骤
----------------------------
### 1. 在页面引入 jQuery.j 及本插件脚本

	<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>
	<script>
	!window.jQuery && document.write('<script src="js/jquery-1.9.1.min.js"><\/script>');
	</script>
	 
	<script type="text/javascript" src="js/search-suggest.js"></script>

### 2. 在页面定义插件初始化数据

例如页面包含如下输入框：
	百度搜索建议：  <input type="text" size="50" id="baidu_line" />
	淘宝搜索建议：  <input type="text" size="50" id="taobao_list" />
	自定义list风格：<input type="text" size="50" id="list" />
	自定义默认风格：<input type="text" size="50" id="default" />

使用示例代码参考：
----------------------------
### 自定义默认风格：

	$("#default").searchSuggest({
	    //url: '', //*优先从url ajax 请求 json 帮助数据/
	    json:{
	        'data':[
	            {'id':'0','word':'bytes=','description':'根据服务器发给客户端访问数据量搜索；单位为 byte<br>例如，搜索数据量大概在 20-50K 之间的日志：<pre>bytes=[20000,50000]</pre>'},
	            {'id':'1','word':'contenttype=','description':'根据内容类型进行搜索<br>例如：<pre>contenttype=image/jpeg</pre>'},
	            {'id':'2','word':'cookie=','description':'根据客户端 Cookie 进行搜索<br>例如：<pre>cookie=user </pre>'},
	            {'id':'3','word':'domain=','description':'根据域名搜索<br>例如：<pre>domain=chinacache.com </pre>提示：切割自请求 URL'},
	            {'id':'4','word':'elapsed=','description':'请求耗时<br>例如：<pre>elapsed==1</pre>'},
	            {'id':'5','word':'fccode=','description':'根据状态码进行搜索<br>例如：<pre>fccode=TCP_REFRESH_HIT/304</pre>'},
	            {'id':'6','word':'ip=','description':'根据客户端 IP 搜索<br>例如，搜索客户端 IP 为 127.0.0.1 或包含 192.168 的日志：<pre>ip={127.0.0.1,192.168}</pre>'},
	            {'id':'7','word':'method=','description':'根据客户端请求方式搜索<br>例如：<pre>method=GET<br>method=POST<br>method={GET,POST}</pre>'},
	            {'id':'8','word':'param=','description':'通过 URL 中传的参数进行搜索<br>例如：<pre>param=username </pre>'},
	            {'id':'9','word':'peerinfo=','description':'根据回源信息进行搜索<br>例如：<pre>peerinfo=DIRECT/1.202.150.137 </pre>回源信息字段包括下面的 Peercode 和 Peerhost'},
	            {'id':'10','word':'peercode=','description':'通过回源代码进行搜索<br>例如：<pre>peercode=DIRECT </pre>注意：此为切割自 Peerinfo 字段'},
	            {'id':'11','word':'peerhost=','description':'根据回源主机进行搜索<br>例如：<pre>peerhost=1.202.150.137 </pre>注意：此为切割自 Peerinfo 字段'},
	            {'id':'12','word':'referer=','description':'根据来路域名搜索<br>例如：<pre>referer=baidu.com </pre>'},
	            {'id':'13','word':'result=','description':'根据请求结果搜索<br>例如：<pre>result=TCP_MEM_HIT</pre>提示：为切割自 FC Code 字段'},
	            {'id':'14','word':'scheme=','description':'根据协议搜索<br>例如：<pre>scheme=http </pre>提示：切割自请求 URL'},
	            {'id':'15','word':'status=','description':'根据状态码进行搜索<br>例如：<pre>status=404 </pre>提示：为切割自 FC Code 字段'},
	            {'id':'16','word':'ua=','description':'根据浏览器客户端的 User Agent 信息进行搜索<br>例如：<pre>ua=chrome </pre>'},
	            {'id':'17','word':'uri=','description':'根据请求的 URI 搜索<br>例如：<pre>uri=login </pre>'},
	            {'id':'18','word':'url=','description':'根据请求的 URL 搜索<br>例如，搜索 URL 包含 chinacache.com 域名的日志：<pre>url=chinacache.com </pre>提示：包括以下的Scheme、Domain、URI 及 Parameter'},
	            {'id':'19','word':'username=','description':'按照客户端用户名搜索<br>例如：<pre>username=- </pre>提示：该字段一般为 - '}
	        ],
	        'defaults':'<b>日志搜索步骤</b><br>' +
	                    '1. 在右下角小窗口选定清单<br/>' +
	                    '2. 输入搜索条件查询<br>' +
	                    '3. 内容框载入最近 500 条信息，并在状态栏实时显示查询进度<br><br>' +
	                    '<b>搜索语法示例</b><br>' +
	                    '1. 模糊搜索：直接输入关键字<pre>chinacache.com</pre>' +
	                    '2. 集合的写法：<pre>foo={a,b,c}<br>foo!={a,b,c}</pre>' +
	                    '3. 区间的写法：<pre>foo=[x,y]<br>foo=(x,y)<br>foo=[x,] foo=[,y]</pre>' +
	                    '4. 精确匹配的写法：<pre>foo==a </pre>' +
	                    '5. 多条件的搜索：<pre>foo=a bar=b<br>foo=[x,y] bar={a,b} far!=c</pre>' +
	                    '<br>更多解释请参考: <a href="/help/index.html#log-search" target="_blank">帮助文档</a>'
	 
	    },
	    width:380,   //提示框的宽度，缺省为输入框的宽度相同
	    topoffset: 16,  //*提示框与输入框的距离，缺省为5
	    style: 'default',
	    cssFile: 'css/search-suggest.css'
	 
	});

### 自定义 getData 数据获取与处理实现渐进式提示效果：
    $("#list_progress").searchSuggest({
        width:350,   /*提示框的宽度，缺省为输入框的宽度相同*/
        topoffset: 6,  /*提示框与输入框的距离，缺省为5*/
        style: 'list',
        cssFile: 'css/search-suggest.css',
        getData: function(word, parent, callback,ddiv,opts) {//数据获取方法
            //if(!word) return;
            console.log(word);
            var data;
            var json;
            switch (word){
                case '':
                    data = opts.json;
                    break;
                case '@': //设备前缀搜索方式，请求一级前缀
                    //一级数据构造
                    var str="ABCDEFGHIJKLMNOPQRSTUVWXYZ";
                    var jsonStr = "{'data':[";
                    for (var i = 0; i < str.length; i++) {
                        for(var j = 0; j < 3; j++){
                            jsonStr += "{'id':'" + i 
                                + "','word':'"+ word + str[i] + str[(i+1)%str.length] + str[(i+2)%str.length]
                                + "', 'description': '" + str[i]+ str[(i+1)%str.length] + str[(i+2)%str.length]
                                + "'},";
                        }
                    }
                    jsonStr += "],'defaults':''}";
                    
                    //字符串转化为 js 对象
                    opts.devdata = data = (new Function("return "+jsonStr ))();
                    break;
                case '~': //为应用名称搜索，请求应用名称数据
                    //一级数据构造
                    var str="ABCDEFGHIJKLMNOPQRSTUVWXYZ";
                    var jsonStr = "{'data':[";
                    for (var i = 0; i < str.length; i++) {
                        for(var j = 0; j < 3; j++){
                            jsonStr += "{'id':'" + i 
                                + "','word':'"+ word + str[i] + str[(i+1)%str.length] + str[(i+2)%str.length]
                                + "', 'description': '" + str[i]+ str[(i+1)%str.length] + str[(i+2)%str.length]
                                + "'},";
                        }
                    }
                    jsonStr += "],'defaults':''}";
                    
                    //字符串转化为 js 对象
                    opts.appdata = data = (new Function("return "+jsonStr ))();
                    break;
                default:
                    if(word[0] == '@'){//为设备前缀搜索
                        if(word[word.length -1] == '-'){ //二级的请求开始
                            //数据构造
                            var str="ABCDEFGHIJKLMNOPQRSTUVWXYZ";
                            var jsonStr = "{'data':[";
                            for (var i = 0; i < str.length; i++) {
                                for(var j = 0; j < 3; j++){
                                    jsonStr += "{'id':'" + i 
                                        + "','word':'"+ word + str[i] + str[(i+1)%str.length] + str[(i+2)%str.length]
                                        + "', 'description': '" + word
                                        + "'},";
                                }
                            }
                            jsonStr += "],'defaults':''}";
                            
                            //字符串转化为 js 对象
                            opts.devdata = data = (new Function("return "+jsonStr ))();
                        }else{ //在上一次请求中查询
                            json = opts.devdata;
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
                            
                            //字符串转化为 js 对象
                            data = (new Function("return "+jsonStr ))();
                        }

                        break;
                    }

                    if(word[0] == '~'){ //应用名搜索，在已请求数据中查询
                        json = opts.appdata;
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
                        
                        //字符串转化为 js 对象
                        data = (new Function("return "+jsonStr ))(); 

                        break;
                    }

                    //其他情况下，在 json 中查询
                    json = opts.json;
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
                    
                    //字符串转化为 js 对象
                    data = (new Function("return "+jsonStr ))();

            }
            callback(parent,data,ddiv,opts);
        }

    });


### 自定义 list 风格：

	$("#list").searchSuggest({
	    //url: 'http://localhost/tips/ajax?method=getsearchhelp', /*优先从url ajax 请求 json 帮助数据*/
	    json:{
	        'data':[
	            {'id':'0','word':'@','description':'根据设备名（或前缀）搜索<br>例如：<code>@CNC-BJ</code>'},
	            {'id':'1','word':'~','description':'根据应用名称搜索<br>例如：<code>~FSCS</code>'},
	            {'id':'2','word':'#','description':'根据频道名称搜索<br>例如：<code>#chinacache.com</code>'},
	            {'id':'3','word':'/','description':'根据 MRTG 标注搜索<br>例如：<code>/apple</code>'},
	            {'id':'4','word':'','description':'智能匹配，无需前缀标识<br>例如：<code>apple @CHN-BJ</code>'}
	        ],
	        'defaults':'设备搜索帮助提示'
	    },//*/
	    width:350,   /*提示框的宽度，缺省为输入框的宽度相同*/
	    topoffset: 6,  /*提示框与输入框的距离，缺省为5*/
	    style: 'list',
	    cssFile: 'css/search-suggest.css'
	 
	});

### 百度搜索建议：（line 风格）

	$("#baidu_line").searchSuggest({
	    url: 'http://unionsug.baidu.com/su?p=3&t='+ (new Date()).getTime() +'&wd=', /*优先从url ajax 请求 json 帮助数据，注意最后一个参数为关键字请求参数*/
	    jsonp: 'cb',/*如果从 url 获取数据，并且需要跨域，则该参数必须设置*/
	    json:{
	        'data':[
	            {'id':'0','word':'baidu','description':''},
	            {'id':'1','word':'lzw.me','description':''},
	            {'id':'2','word':'w1.lzw.me','description':''},
	            {'id':'3','word':'g.lzw.me','description':''},
	            {'id':'4','word':'seo.lzw.me','description':''}
	        ],
	        'defaults':'http://lzw.me'
	    },
	    width:300,   /*提示框的宽度，缺省为输入框的宽度相同*/
	    topoffset: 6,  /*提示框与输入框的距离，缺省为5*/
	    style: 'line',
	    cssFile: 'css/search-suggest.css',
	    processData: function(json){// url 获取数据时，对数据的处理，作为 getData 的回调函数
	        if(!json || json.s.length == 0) return false;
	 
	        console.log(json);
	 
	        var jsonStr = "{'data':[";
	        for (var i = json.s.length - 1; i >= 0; i--) {
	            jsonStr += "{'id':'" + i 
	                + "','word':'"+ json.s[i]
	                + "', 'description': ''},";
	        }
	        jsonStr += "],'defaults':'baidu'}";
	 
	        //字符串转化为 js 对象
	        return json = (new Function("return "+jsonStr ))();
	    },
	    getData: function(word, parent, callback) {//数据获取方法
	        if(!word) return;
	        $.ajax({
	            type: 'GET',
	            /*data: "word=" + word,*/
	            url: 'http://unionsug.baidu.com/su?p=3&t='+ (new Date()).getTime() +'&wd=' + encodeURIComponent(word) + '&cb=?',
	            //'http://suggest.taobao.com/sug?code=utf-8&extras=1&q='+word+'&callback=?'
	            dataType: 'json',
	            timeout: 3000,
	            success: function(data) {
	                callback(parent, data);
	            },
	            error: function(data){callback(parent, data);}
	        });
	    }
	 
	});

### 淘宝搜索建议：（list 风格）

	$("#taobao_list").searchSuggest({
	    url: 'http://suggest.taobao.com/sug?code=utf-8&extras=1&q=', /*优先从url ajax 请求 json 帮助数据，注意最后一个参数为关键字请求参数*/
	    jsonp: 'callback',/*如果从 url 获取数据，并且需要跨域，则该参数必须设置*/
	    json:{
	        'data':[
	            {'id':'0','word':'baidu','description':''},
	            {'id':'1','word':'lzw.me','description':''},
	            {'id':'2','word':'w1.lzw.me','description':''},
	            {'id':'3','word':'g.lzw.me','description':''},
	            {'id':'4','word':'seo.lzw.me','description':''}
	        ],
	        'defaults':'http://lzw.me'
	    },//
	    width:350,   //提示框的宽度，缺省为输入框的宽度相同
	    topoffset: 6,  //提示框与输入框的距离，缺省为5
	    style: 'list',
	    cssFile: 'css/search-suggest.css',
	    tpl: '<div class="list"><div class="word" rel_id="st_{id}">{word}</div><div class="desc">约{description}条记录</div></div>',
	    processData: function(json){// url 获取数据时，对数据的处理，作为 getData 的回调函数
	        if(!json || json.result.length == 0) return false;
	 
	        var jsonStr = "{'data':[";
	        for (var i = json.result.length - 1; i >= 0; i--) {
	            jsonStr += "{'id':'" + i 
	                + "','word':'"+ json.result[i][0]
	                + "', 'description': '"+ json.result[i][1] +"'},";
	        }
	        jsonStr += "],'defaults':'taobao'}";
	 
	        //字符串转化为 js 对象
	        return json = (new Function("return "+jsonStr ))();
	    },
	    getData: function(word, parent, callback) {//数据获取方法
	        if(!word) return;
	        $.ajax({
	            type: 'GET',
	            /*data: "word=" + word,*/
	            url: 'http://suggest.taobao.com/sug?code=utf-8&extras=1&q='+word+'&callback=?',
	            dataType: 'json',
	            timeout: 3000,
	            success: function(data) {
	                callback(parent, data);
	            },
	            error: function(){
	                callback(parent, data);
	            }
	        });
	    }
	 
	});
 
参数说明
------------------------------
	url:  , //请求数据的 URL。优先从url ajax 请求 json 帮助数据，注意最后一个参数为关键字请求参数
	jsonp: ,//设置此参数名，将开启jsonp功能，否则使用json数据结构
	json: {
	    'data':[
	        {'id':'0','word':'lzw.me','description':'http://lzw.me'},
	        {'id':'1','word':'w1.lzw.me','description':'http://w1.lzw.me'},
	        {'id':'2','word':'g.lzw.me','description':'http://g.lzw.me'}
	    ],
	    'defaults':'http://lzw.me'
	},                      //无 url 参数时从这里加载数据，注意格式
	style: 'default',       //风格样式，[line,list,default]
	cssFile: 'css/search-suggest.css', //提示框加载的 css 样式文件
	listHoverCSS: 'jhover', //提示框列表鼠标悬浮的样式
	tpl:                    //行模板
	width: 300,             //提示框的宽度，缺省为输入框的宽度相同
	topoffset:16,           //提示框与输入框的距离，缺省为5
	processData: processData, //格式化数据的方法，参考 json 参数的格式进行处理
	getData: getData,       //获取数据的方法，默认以插件定义为准

使用效果参考
-----------------------------
http://lzw.me/pages/demo/jquery_search_suggest_plugin/(http://lzw.me/pages/demo/jquery_search_suggest_plugin/)