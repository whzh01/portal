$(function() {
	if(window.localStorage){
		//重新登录的时候清除掉localStorage
		window.localStorage.clear();
	}
	if(window.sessionStorage){
		//重新登录的时候清除掉sessionStorage
		window.sessionStorage.clear();
	}
	//判断service地址，如果是门户平台则直接改为https协议
	replaceHash(GetQueryString("service"));
	
	var passwordhtml = document.getElementById("password_template").innerHTML;
	var qrcodehtml = document.getElementById("qrcode_template").innerHTML;
	$("#login_content").html(passwordhtml);
	
	var setting = {
		imageWidth : 1680,
		imageHeight : 1050
	};
	var init = function() {
		var windowHeight = $(window).height();
		var windowWidth = $(window).width();
		$(".login_conatiner").css("height",windowHeight);
		$(".login_conatiner").css("width",windowWidth);
		
		$("#container_bg").css("height",windowHeight);
		$("#container_bg").css("width",windowWidth);
		
		$("#login_right_box").css("height",windowHeight);

		var imgW = setting.imageWidth;
		var imgH = setting.imageHeight;
		var ratio = imgH / imgW; // 图片的高宽比

		imgW = windowWidth; // 图片的宽度等于窗口宽度
		imgH = Math.round(windowWidth * ratio); // 图片高度等于图片宽度 乘以 高宽比

		if (imgH < windowHeight) { // 但如果图片高度小于窗口高度的话
			imgH = windowHeight; // 让图片高度等于窗口高度
			imgW = Math.round(imgH / ratio); // 图片宽度等于图片高度 除以 高宽比
		}

		$(".login_img_01").width(imgW).height(imgH); // 设置图片高度和宽度
	};

	init();
	
	$(window).resize(function() {
		init();
	});
	
	
	//点击记住用户名
	$("#rememberName").change(function(){
		if($(this).is(":checked")){
			var $u = $("#un").val() ;
			if($.trim($u)==''){
				$("#errormsg").text("账号不能为空。").show();
				$("#help-link").hide();
				$(this).removeAttr("checked");
			}else{
				//不等于空，写cookie
				setCookie('dlut_cas_un' , $u , 365);
				document.getElementById('pd').focus()
			}
		}else{
			//反选之后清空cookie
			clearCookie('dlut_cas_un');
		}
	});
	
	//点击账号登陆
	$("#password_login").click(function(){
//		$("#password_login").addClass("active");
//		$("#qrcode_login").removeClass("active");
//		$("#login_content").html(passwordhtml);
		var	search =location.search;
		//跳转url
		var service = getParameter(search, "service", "");
		window.location.href = decodeURIComponent(service);
	});
	
	//点击扫码登陆
	$("#qrcode_login").click(function(){
		$("#password_login").removeClass("active");
		$("#qrcode_login").addClass("active");
		$("#login_content").html(qrcodehtml);
		//获取token及扫码地址
		$.ajax({
	        type : "get",      
	        url : "qrcodesso", 
	        dataType : "text",
	        cache: false ,
	        data :
	        {
	        	"type" : "getToken"
	        },
	        success : function(result)
	        {
	        	var token = result.substring(0,result.indexOf(","));
	        	var content = result.substring(result.indexOf(",")+1);
	        	//生成二维码
	        	setQrcode(content);
	        	var num = 0;
	        	//扫码登录
	    		qrcodeLogin(content, token, num);
	        },
	        error : function(xhr, status, errMsg)
	        {
	             alert("获取token失败");
	        }
	    });
	});
	//登录按钮触发
	$("#index_login_btn").click(function(){
		login();
	});
	
	//触发如何使用360极速模式图片
//	 $("#open_360").mouseover(function(){
//		$("#open_360_img").show();
//	}).mouseout(function(){
//		$("#open_360_img").hide();
//	}); 
	
	 $("#open_360").click(function(){
			$("#open_360_img").show();
		});
	 $("#open_360").click(function(event){
		    event.stopPropagation();
		});
	 $(document).click(function(){
		    $("#open_360_img").hide();
		});
	
	//用户名文本域keyup事件
	$("#un").keyup(function(e){
		if(e.which == 13) {
			login();
	    }
	}).keydown(function(e){
		$("#errormsg").hide();
		var winW =$("body").width();
		if(winW < 1024){
		$("#help-link").show();
		}
	}).focus();
	
	//密码文本域keyup事件
	$("#pd").keyup(function(e){
		if(e.which == 13) {
			login();
	    }
	}).keydown(function(e){
		$("#errormsg").hide();
		var winW =$("body").width();
		if(winW < 1024){
		$("#help-link").show();
		}
	});
	
	//如果有错误信息，则显示
	if($("#errormsghide").text()){
		$("#errormsg").text($("#errormsghide").text()).show();
		$("#help-link").hide();
	}
	
	//重新获取验证码
	$("#a_changeCode").click(function(){
    	$("#codeImage").attr("src", "code?"+Math.random()) ;
    });
    
	//获取cookie值
	var cookie = getCookie('dlut_cas_un');
	if(cookie){
		$("#un").val(cookie);
		$("#rememberName").attr("checked","checked");
	}
	
	var ifchecked = function(){
		if($("#rememberName").is(":checked")){
		   document.getElementById('pd').focus()
	    }
	};
	ifchecked();
});

function login(){
	
	var $u = $("#un") , $p=$("#pd");
	
	var u = $u.val().trim();
	if(u==""){
		$u.focus();
		$("#errormsg").text("账号不能为空。");
		$("#help-link").hide();
		return ;
	}
	
	var p = $p.val().trim();
	if(p==""){
		$p.focus();
		$("#errormsg").text("密码不能为空。");
		$("#help-link").hide();
		return ;
	}
	
	$u.attr("disabled","disabled");
	$p.attr("disabled","disabled");
	
	var lt = $("#lt").val();
	
	$("#ul").val(u.length);
	$("#pl").val(p.length);
	$("#rsa").val(strEnc(u+p+lt , '1' , '2' , '3'));
	
	$("#loginForm")[0].submit();
}
function setQrcode(content){
	$("#qrcode").qrcode({width: 143,height: 143,text: content});
}
function qrcodeLogin(content, token, num){
	var	search =location.search;
	//跳转url
	var service = getParameter(search, "service", "");
	$.ajax({
        type : "get",      
        url : "qrcodesso", 
        dataType : "text",
        cache: false ,
        data :
        {
        	 "type"    : "qrcodeLogin",
             "service" : service,
             "token"   : token,
             "content" : content
        },
        success : function(result)
        {
        	num ++;
        	if(result == "out" && num < 2){
        		qrcodeLogin(content, token, num);
        	}else{
        		window.location.href = decodeURIComponent(service);
        	}
//        	window.location.href = decodeURIComponent(service);
//        	if(result == "ok"){
//        		window.location.href = decodeURIComponent(service);
//        	}else if(result == "out"){
////        		alert("扫码超时");
//        		window.location.href = decodeURIComponent(service);
//        	}else if(result == "error"){
//        		alert("二维码失效");
//        	}
        },
        error : function(xhr, status, errMsg)
        {
//             alert("扫码失败刷新后重试");
        }
    });
}

function getParameter(hash,name,nvl) {
	if(!nvl){
		nvl = "";
	}
	var svalue = hash.match(new RegExp("[\?\&]?" + name + "=([^\&\#]*)(\&?)", "i"));
	if(svalue == null){
		return nvl;
	}else{
		svalue = svalue ? svalue[1] : svalue;
		svalue = svalue.replace(/<script>/gi,"").replace(/<\/script>/gi,"").replace(/<html>/gi,"").replace(/<\/html>/gi,"").replace(/alert/gi,"").replace(/<span>/gi,"").replace(/<\/span>/gi,"").replace(/<div>/gi,"").replace(/<\/div>/gi,"");
		return svalue;
	}
}

//设置cookie
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}

//获取cookie
function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) != -1) return c.substring(name.length, c.length);
    }
    return "";
}

//清除cookie  
function clearCookie(name) {  
    setCookie(name, "", -1);  
} 
//判断如果是大理工门户地址则改成https协议并重定向请求
function replaceHash (paramValue){
	if(paramValue!=null&&paramValue.indexOf("portal.dlut.edu.cn")!=-1&&paramValue.indexOf("https")==-1){
		paramValue = paramValue.replace("http","https");
		window.location.href = paramValue;
	}
}
//获取地址栏参数值 	
function GetQueryString(service) {
	var b = new RegExp("(^|&)" + service + "=([^&]*)(&|$)");
	var r = window.location.search.substr(1).match(b);
	if (r != null) return unescape(r[2]);
	return null
};