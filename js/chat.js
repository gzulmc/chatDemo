////////////////////////////////////////////键盘事件////////////////////////////////

// 按Enter键发送信息
$(document).keydown(function(event){
    if(event.keyCode == 13){
        SendMsg();
    }
});

initUserList();


function initUserList() {
    // var lis = document.getElementById("hots");
    var retStr = "";
    $.ajax({
        type: "get",
        async:false,
        dataType: "json",
        url: "users.json",
        error: function (request) {
            retStr = "";
            $("#user_list").html("");
        },
        success: function (data) {
            retStr = "<ul class=\"sidebar__dilog_list\" id=\"hots\">";
            for (let i = 0; i < data.length; i++) {
                retStr += "    <li class=\"dialog__item j-dialog__item \" id=\""+data[i].id+"\">\n" +
                    "        <a class=\"dialog__item_link\" onclick='openDialog("+data[i].id+")' href=\"javascript:void(0);\" style='text-decoration: none'>\n" +
                    "            <span class=\"dialog__info\">\n" +
                    "                <span class=\"dialog__name\">"+data[i].user_name+"</span>\n" +
                    "                <span class=\"dialog__last_message j-dialog__last_message \">"+data[i].last_message+"</span>\n" +
                    "            </span>\n" +
                    "            <span class=\"dialog_additional_info\">\n" +
                    "                <span class=\"dialog__last_message_date j-dialog__last_message_date\">\n" +
                    "                    "+data[i].last_message_date+"\n" +
                    "                </span>\n" +
                    "                <span class=\"dialog_unread_counter j-dialog_unread_counter\">"+data[i].unread_counter+"</span>\n" +
                    "            </span>\n" +
                    "        </a>\n" +
                    "    </li>";
            }
            retStr += "</ul>";
            $("#user_list").append(retStr);
        }
    });
}

/*根据用户id获取用户对话记录*/
function openDialog(id) {
    if (id) {
        $.ajax({
            type: "get",
            async:false,
            data:{id:id},
            dataType: "json",
            url: "dialogs.json",
            error: function (request) {
                retStr = "";
                $("#user_list").html("");
            },
            success: function (data) {
                retStr = "";
                for (let i = 0; i < data.length; i++) {
                    retStr += "<div class=\"msg\">\n" +
                        "                            <div class=\"msg-left\" worker=\""+data[i].from_user+"\">\n" +
                        "                                <div class=\"msg-host photo\" style=\"background-image: url(images/head.png)\"></div>\n" +
                        "                                <div class=\"msg-ball\">\n" +
                        "                                    <div class=\"message__text_and_date\">\n" +
                        "                                        <div class=\"message__text_wrap\">\n" +
                        "                                            <p class=\"message__text\">"+data[i].question+"</p>\n" +
                        "                                            <p class=\"message__text\">"+data[i].create_time+"</p>\n" +
                        "                                        </div>\n" +
                        "                                    </div>\n" +
                        "                                </div>\n" +
                        "                            </div>\n" +
                        "                        </div>\n" +
                        "                        <div class=\"msg\">\n" +
                        "                            <div class=\"msg-right\" worker=\"lemma\">\n" +
                        "                                <div class=\"msg-host headDefault\" style=\"background-image: url(images/man.png)\"></div>\n" +
                        "                                <div class=\"msg-ball\">\n" +
                        "                                    <div class=\"message__text_and_date\">\n" +
                        "                                        <div class=\"message__text_wrap\">\n" +
                        "                                            <p class=\"message__sender_name\">"+data[i].receive_user+"</p>\n" +
                        "                                            <p class=\"message__text\">"+data[i].answer+"</p>\n" +
                        "                                            <p class=\"message__text\">"+data[i].create_time+"</p>\n" +
                        "                                        </div>\n" +
                        "                                    </div>\n" +
                        "                                </div>\n" +
                        "                            </div>\n" +
                        "                        </div>";
                }
                $("#msgs").append(retStr);
            }
        });
    }
}

/////////////////////////////////////////////前台信息处理/////////////////////////////////////////////////////////
// 发送信息
function SendMsg()
{
    var text = document.getElementById("text");
    if (text.value == "" || text.value == null)
    {
        alert("发送信息为空，请输入！")
    }
    else
    {
        AddMsg('default', SendMsgDispose(text.value));
        var retMsg = AjaxSendMsg(text.value)
        AddMsg('小冰', retMsg);
        text.value = "";
    }
}
// 发送的信息处理
function SendMsgDispose(detail)
{
    detail = detail.replace("\n", "<br>").replace(" ", "&nbsp;")
    return detail;
}

// 增加信息
function AddMsg(user,content)
{
    var str = CreadMsg(user, content);
    var msgs = document.getElementById("msgs");
    msgs.innerHTML = msgs.innerHTML + str;
}

// 生成内容
function CreadMsg(user, content)
{
    var str = "";
    if(user == 'default')
    {
        str = "<div class=\"msg guest\"><div class=\"msg-right\"><div class=\"msg-host headDefault\"></div><div class=\"msg-ball\" title=\"今天 17:52:06\">" + content +"</div></div></div>"
    }
    else
    {
        str = "<div class=\"msg robot\"><div class=\"msg-left\" worker=\"" + user + "\"><div class=\"msg-host photo\" style=\"background-images: url(../Images/head.png)\"></div><div class=\"msg-ball\" title=\"今天 17:52:06\">" + content + "</div></div></div>";
    }
    return str;
}



/////////////////////////////////////////////////////////////////////// 后台信息处理 /////////////////////////////////////////////////////////////////////////////////

// 发送
function AjaxSendMsg(_content)
{
    var retStr = "";
    $.ajax({
        type: "POST",
        async:false,
        url: "/Home/ChatMethod/",
        data: {
            content: _content
        },
        error: function (request) {
            retStr = "你好";
        },
        success: function (data) {
            retStr = data.info;
        }
    });
    return retStr;
}