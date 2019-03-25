
//(2)--XML操作--------------------------------------------------------------------

//从字符串创建一个XML
function CreateXmlFromString(theStr)
{
	var xmlDoc=new ActiveXObject("MSXML2.DOMDocument.3.0");
	xmlDoc.loadXML(theStr);
	return xmlDoc;
}

//创建一个XML
//参数：结点名（如果为空，则默认为XML）
function CreateXml(RootNodeText)
{
	var xmlDoc=new ActiveXObject("MSXML2.DOMDocument.3.0");
	var XmlRoot=xmlDoc.createElement((RootNodeText!=null)?RootNodeText:"xml");
	xmlDoc.appendChild(XmlRoot);
    return xmlDoc;
}

//添加一个子结点
//参数：父结点、结点名、结点值
function AddXmlNode(pNode, NodeName, NodeValue)
{
    if(pNode==null) return false;
    var xmlNode = pNode.ownerDocument.createElement(NodeName);
    if(NodeValue!=null) xmlNode.text = NodeValue;
    pNode.appendChild(xmlNode);
    return xmlNode;
}

//添加一个属性
//参数：结点、属性名、属性值
function AddAttribute(pNode, AttribName, AttribValue)
{
   if(pNode==null) return;
   pNode.setAttribute(AttribName,AttribValue);	
}

//获取属性值
//参数：结点、属性名
function GetAttributeValue(pNode, AttribName)
{
   if(pNode==null) return;
   var result=pNode.getAttribute(AttribName);
   return result!=null? result:"";
}

//返回XML文件里某个结点的值。
//参数：1、XML文档；2、结点路径。
function GetNodeValue(xmlDoc,thePath)
{
    var xmlNode=xmlDoc.selectSingleNode(thePath);
    return (xmlNode!=null)?xmlNode.text:"";
}

//设置XML文件里某个结点的值。
//参数：1、XML文档；2、结点路径；3、要设置结点的值。
function SetNodeValue(xmlDoc,thePath,theValue)
{
    var xmlNode=xmlDoc.selectSingleNode(thePath);
    if(xmlNode!=null)xmlNode.text=theValue;
}
///-------------------------------------------------------------------------------------

