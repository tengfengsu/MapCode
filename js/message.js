//------------------------------------------------------------------------------------------------------------------------------------
//
//  Message box
//
//------------------------------------------------------------------------------------------------------------------------------------

var mFilePath = "/krswebui/skin/images/message/"; //资料文件路径

//在屏幕右下角显示信息窗口（每次只能显示一个窗口）
function ShowMessageBox(strMessage, strTitle, strTime) {
    if (!strTitle || strTitle == "") strTitle = "信息提示";
    if (!strTime || strTime == "") strTime = (new Date()).format("yyyy-MM-dd HH:mm");
    
	var objMessageHead=GetElem("floathead");
	var objMessageContent=GetElem("MessageContent");

	var msg=strMessage;//.Trim();
    msg="<font color=gray>["+strTime+"]</font><br><br>"+msg;
  
	var objFloater=GetElem("floater");
	objMessageContent.style.overflow="";
	objFloater.style.visibility = "visible";

	objFloater.style.pixelTop = document.documentElement.offsetHeight + document.documentElement.scrollTop;
	objFloater.style.pixelLeft = document.documentElement.offsetWidth + document.documentElement.scrollLeft - objFloater.offsetWidth;
    objMessageHead.innerText=strTitle;
    objMessageContent.innerHTML=msg;

  try {
     window.focus();
  }catch(e){}

  //声音提示  
  var msgoundid="msgsound";
  var msgoundx=GetElem(msgoundid);
  msgoundx.src = mFilePath+"Msg.wav";
  //msgoundx.loop=0;   
  //setTimeout(__TurnOffSound,4000);
  
  FloatFlag=false;
  setTimeout(__MoveMessageBox,10);
}

function __TurnOffSound()
{
    var msgoundid="msgsound";
    var msgoundx=GetElem(msgoundid);
    msgoundx.src = "";
}

function __MoveMessageBox()
{	
	var objFloater=GetElem("floater");
	if (parseInt(objFloater.style.pixelTop) > document.documentElement.offsetHeight + document.documentElement.scrollTop - objFloater.offsetHeight-5)
	{
	    objFloater.style.pixelTop = parseInt(objFloater.style.pixelTop) - 5;
		setTimeout(__MoveMessageBox,12);
	}
	else
	{
	    objFloater.style.pixelTop = document.documentElement.offsetHeight + document.documentElement.scrollTop - objFloater.offsetHeight;
		GetElem("MessageContent").style.overflow="auto";

		var theParent = document.documentElement;
		if (objFloater.style.pixelTop < theParent.scrollTop) objFloater.style.pixelTop = theParent.scrollTop;
		if (objFloater.style.pixelTop > theParent.offsetHeight + theParent.scrollTop - objFloater.offsetHeight)
		    objFloater.style.pixelTop = theParent.offsetHeight + theParent.scrollTop - objFloater.offsetHeight;

		if (objFloater.style.pixelLeft < theParent.scrollLeft) objFloater.style.pixelLeft = theParent.scrollLeft;
		if (objFloater.style.pixelLeft > theParent.offsetWidth + theParent.scrollLeft - objFloater.offsetWidth)
		    objFloater.style.pixelLeft = theParent.offsetWidth + theParent.scrollLeft - objFloater.offsetWidth;


        lastScrollY = document.body.scrollTop; 
		lastScrollX  = document.body.scrollLeft; 
		FloatFlag=true;
	}
}

function __CloseMessageBox()
{
    GetElem("floater").style.visibility="hidden";
    __TurnOffSound();
}

//------------------------------------------------------------------------------------------------------------------------------------
//
//  diolog window
//
//------------------------------------------------------------------------------------------------------------------------------------

function ShowAlert(strMessage,strTitle,mIconIndex) {
    ShowConfirm1(strMessage, "确定", null, strTitle, mIconIndex);
} 

function ShowConfirm1(strMessage, btnInfo, onPageCallback, strTitle, mIconIndex) {
    if (!btnInfo || btnInfo=="") btnInfo = onPageCallback?"确定;取消":"确定";
    
    // 1/2/3/4 info/warning/error/query
    if (mIconIndex==null) mIconIndex = onPageCallback ? 4 : 1;
    if ((mIconIndex < 1) || (mIconIndex > 4)) mIconIndex = 0; //不绘制图标
    
    var strHtml = '<table border="0" width="100%" cellpadding="0" cellspacing="10">';

    strHtml += '<tr style ="vertical-align :middle">';
    if(mIconIndex!=0)
        strHtml += '<td width="48" style="text-align:center"><img src ="' + mFilePath + 'icon' + mIconIndex + '.gif" /></td>';
    strHtml += '<td width="200" id="td_alertmsg" style="text-align:left">' + strMessage + '</td>';
    strHtml += '</tr>';

    strHtml += '<tr style ="vertical-align :middle;height:40"><td ' + ((mIconIndex != 0) ? 'colspan=2 ' : '') + 'style="text-align:center">';
    var btnList = btnInfo.split(";");
    for (i = 0; i < btnList.length; i++) {
        strHtml += '<input type=button id="btnComfirm'+i+'" class=MT_MouseOut value="' + btnList[i] + '" onclick=__OnMessageButtonClick(' + i + ',"' + btnList[i] + '")> ';
    }
    strHtml += '</td></tr>';
    strHtml += '</table>';

    __ShowWindow(strHtml, strTitle, onPageCallback);
    GetElem("btnComfirm0").focus();
}

function __OnMessageButtonClick(retCode,retValue)
{
    __UnMaskBG();
    var onPageCallback = GetElem("floater_alert").pageCallback;
    if (onPageCallback != null)
        onPageCallback(retCode, retValue);
}

function ShowPage(url, strTitle, onPageCallback,mWidth, mHeight) {
    var str = "<img src='" + mFilePath + "loading.gif' id='img_frame_loading' style='position: absolute;cursor:wait;display:' />";
    str += "<iframe src=" + url + " onload=__ResetFrameSize(this," + mWidth + "," + mHeight + ") frameborder=\"0\"></iframe>";
    __ShowWindow(str, strTitle, onPageCallback);
}

function __ResetFrameSize(mFrame, mWidth, mHeight) {
    if (!mWidth) mWidth = 400;
    if (!mHeight) mHeight = 300;
    mFrame.style.width = mWidth;
    mFrame.style.height = mHeight;

    img_loading = GetElem("img_frame_loading");
    if (img_loading != null)
        img_loading.style.display = "none";

    div_alertX = GetElem("floater_alert");
    __MoveCenter(div_alertX);
}

var __mWindowShowed = false; //是否已显示弹出窗口
document.onkeyup = function() {
    if (__mWindowShowed && event.keyCode == 27)
        __UnMaskBG();
} 

//显示弹出窗口（同时只能弹出一个窗口）
function __ShowWindow(strHtml, strTitle, onPageCallback) {
    __MaskBG();
    __mWindowShowed = true;
    GetElem("td_alerttitle").innerText = (strTitle != null) ? strTitle : ((onPageCallback != null) ? "确认框" : "提示框");
    GetElem("td_alertcontent").innerHTML = strHtml;

    div_alertX = GetElem("floater_alert");
    div_alertX.pageCallback = onPageCallback;
//    div_alertX.style.visibility = "visible";
    div_alertX.style.display = "";
    __MoveCenter(div_alertX);
}

function __MoveCenter(objDiv) {
    var mLeft = (document.documentElement.offsetWidth - objDiv.offsetWidth) / 2 + document.documentElement.scrollLeft;
    objDiv.style.left = mLeft > 0 ? mLeft : 0;
    var mTop = (document.documentElement.offsetHeight - objDiv.offsetHeight) / 2 + document.documentElement.scrollTop;
    objDiv.style.top = mTop > 0 ? mTop : 0;
}

//显示蒙板
function __MaskBG() {
    var div_Mask = GetElem("BackGroundMask");
//    div_Mask.style.top = document.body.scrollTop;
    div_Mask.style.width = document.body.offsetWidth;
    div_Mask.style.height = document.body.offsetHeight;
    div_Mask.style.display = "";
    
}

//关闭蒙板（以及对话框）
function __UnMaskBG() {
    var div_Mask = GetElem("BackGroundMask");
    div_Mask.style.display = "none";
    div_Mask.visibility = "hidden";
 
//    GetElem("td_alertcontent").innerHTML = ""; //这句话清除了网页元素，可能会引起后续调用出错
//    GetElem("floater_alert").style.visibility = "hidden";
    GetElem("floater_alert").style.display = "none";
    __mWindowShowed = false;
}
