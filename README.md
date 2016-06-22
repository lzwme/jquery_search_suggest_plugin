jquery_search_suggest_plugin
============================
这是一个基于 jQuery 的搜索建议插件。

插件使用方法
============================
安装使用步骤
----------------------------
### 1. 在页面引入插件 css 样式

    <link rel="stylesheet" type="text/css" href="dist/css/search-suggest.min.css">

注：正确的配置了cssFile 参数，则此步可省略。否则应 cssFile 配置为 false
### 2. 在页面引入 jQuery.j 及本插件脚本

	<script type="text/javascript" src="//cdn.bootcss.com/jquery/1.9.1/jquery.min.js"></script>
	<script>
	<script type="text/javascript" src="dist/js/search-suggest.min.js"></script>

### 3. 在页面定义插件初始化数据

例如页面包含如下输入框：
	百度搜索建议：  <input type="text" size="50" id="baidu_line" />
	淘宝搜索建议：  <input type="text" size="50" id="taobao_list" />
	自定义list风格：<input type="text" size="50" id="list" />
	自定义默认风格：<input type="text" size="50" id="default" />

示例
------------------------------
[Demo|示例](http://lzw.me/pages/demo/jquery_search_suggest_plugin/)
[demo.js](https://github.com/lzwme/jquery_search_suggest_plugin/blob/master/demo/demo.js)

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
http://lzw.me/pages/demo/jquery_search_suggest_plugin/