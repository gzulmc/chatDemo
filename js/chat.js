﻿
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
            retStr = "<ul class=\"sidebar__dilog_list\" style='height: 557px' id=\"hots\" >";
            for (let i = 0; i < data.length; i++) {
                retStr += "    <li class=\"dialog__item j-dialog__item \" id=\""+data[i].id+"\">\n" +
                    "        <a class=\"dialog__item_link\" onclick='openDialog("+data[i].id+")' href=\"javascript:void(0);\" style='text-decoration: none'>\n" +
                    "            <span class=\"dialog__info\">\n" +
                    "                <span class=\"dialog__name\">"+data[i].user_name+"</span>\n" +
                    "                <span class=\"dialog__last_message j-dialog__last_message \">"+data[i].user_id+"</span>\n" +
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
            retStr += "<div style=\"bottom: 0px; height: 30px; line-height: 30px; width: 100%; background-color: #eceeed\">\n" +
                "                        <a href=\"javascript:void(0)\" onclick=\"beforePage()\">上一页</a>\n" +
                "                        <a href=\"javascript:void(0)\" id=\"nextPage\">下一页</a> 转到\n" +
                "                        <input type=\"text\" id=\"jumpPage\" style=\"width: 60px;height: 20px\"> 页\n" +
                "                        <a href=\"javascript:void(0)\" id=\"jumpAction\">GO</a>\n" +
                "                        <a id=\"currentPage\" style=\"margin-left: 10px\">1</a>/<a id=\"totalPages\">5073</a>\n" +
                "                    </div>";
            $("#user_list").append(retStr);
        }
    });
}

/*根据用户id获取用户对话记录*/
function openDialog(id) {
    if (id) {
        $("#msgs").html("");
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
                $("#histStart").html(data[0].from_user);
                $("#" + id).addClass("selected");
                for (let i = 0; i < data.length; i++) {
                    retStr += "<div class=\"msg\">\n" +
                        "    <div class=\"msg-left\" worker=\""+data[i].from_user+"\">\n" +
                        "        <div class=\"msg-host photo\" style=\"background-image: url(images/head.png)\"></div>\n" +
                        "        <div class=\"msg-ball\">\n" +
                        "            <div class=\"message__text_and_date\">\n" +
                        "                <div class=\"message__text_wrap\">\n" +
                        "                    <p class=\"message__text\">"+data[i].question+"</p>\n" +
                        "                    <p class=\"message__text\">"+data[i].create_time+"</p>\n" +
                        "                </div>\n" +
                        "            </div>\n" +
                        "        </div>\n" +
                        "    </div>\n" +
                        "</div>\n" +
                        "<div class=\"msg\">\n" +
                        "    <div class=\"msg-right\" worker=\"lemma\">\n" +
                        "        <div class=\"msg-host headDefault\" style=\"background-image: url(images/man.png)\"></div>\n" +
                        "        <div class=\"msg-ball\">\n" +
                        "            <div class=\"message__text_and_date\">\n" +
                        "                <div class=\"message__text_wrap\">\n" +
                        "                    <p class=\"message__sender_name\">"+data[i].receive_user+"</p>\n" +
                        "                    <p class=\"message__text\">"+data[i].answer+"</p>\n" +
                        "                    <p class=\"message__text\">"+data[i].create_time+"</p>\n" +
                        "                </div>\n" +
                        "            </div>\n" +
                        "        </div>\n" +
                        "    </div>\n" +
                        "</div>";
                }
                $("#msgs").append(retStr);
                $("#show")[0].scrollTop = $("#show")[0].scrollHeight;//滚动条滑动最低端
                $("#" + id).find("span:last").addClass("hidden").html("");//设置未读消息为空
            }
        });
    }
}
function getFormatDate(){
    var nowDate = new Date();
    var year = nowDate.getFullYear();
    var month = nowDate.getMonth() + 1 < 10 ? "0" + (nowDate.getMonth() + 1) : nowDate.getMonth() + 1;
    var date = nowDate.getDate() < 10 ? "0" + nowDate.getDate() : nowDate.getDate();
    var hour = nowDate.getHours()< 10 ? "0" + nowDate.getHours() : nowDate.getHours();
    var minute = nowDate.getMinutes()< 10 ? "0" + nowDate.getMinutes() : nowDate.getMinutes();
    var second = nowDate.getSeconds()< 10 ? "0" + nowDate.getSeconds() : nowDate.getSeconds();
    return year + "-" + month + "-" + date+" "+hour+":"+minute+":"+second;
}

// 发送信息
function SendMsg() {
    var text = $("#text").val();
    if (!text)
    {
        alert("发送信息为空，请输入！")
    }
    else
    {
        /*AddMsg('default', SendMsgDispose(text));*/
        var retMsg = AjaxSendMsg(text)//发送后台存储用户问题(text)和答案(retMsg)
        AddMsg('坐席', retMsg);
        $("#text").val("");
    }
}
// 发送的信息处理
function SendMsgDispose(detail) {
    detail = detail.replace("\n", "<br>").replace(" ", "&nbsp;")
    return detail;
}

// 增加信息
function AddMsg(user,content) {
    var str = CreadMsg(user, content);
    var msgs = document.getElementById("msgs");
    msgs.innerHTML = msgs.innerHTML + str;
}

// 生成内容
function CreadMsg(user, content) {
    /*var str = "";
    if(user == 'default')
    {
        str = "<div class=\"msg\">\n" +
            "    <div class=\"msg-left\" worker=\"" + user + "\">\n" +
            "        <div class=\"msg-host photo\" style=\"background-image: url(images/head.png)\"></div>\n" +
            "        <div class=\"msg-ball\">\n" +
            "            <div class=\"message__text_and_date\">\n" +
            "                <div class=\"message__text_wrap\">\n" +
            "                    <p class=\"message__text\">" + content + "</p>\n" +
            "                    <p class=\"message__text\">" + getFormatDate() + "</p>\n" +
            "                </div>\n" +
            "            </div>\n" +
            "        </div>\n" +
            "    </div>\n" +
            "</div>";
    }
    else
    {
        str = "<div class=\"msg\">\n" +
            "    <div class=\"msg-left\" worker=\"" + user + "\">\n" +
            "        <div class=\"msg-host photo\" style=\"background-image: url(images/head.png)\"></div>\n" +
            "        <div class=\"msg-ball\">\n" +
            "            <div class=\"message__text_and_date\">\n" +
            "                <div class=\"message__text_wrap\">\n" +
            "                    <p class=\"message__text\">" + content + "</p>\n" +
            "                    <p class=\"message__text\">" + getFormatDate() + "</p>\n" +
            "                </div>\n" +
            "            </div>\n" +
            "        </div>\n" +
            "    </div>\n" +
            "</div>";
    }*/
    if (user=="de") {
        return "<div class=\"msg\">\n" +
        "    <div class=\"msg-left\" worker=\"" + user + "\">\n" +
        "        <div class=\"msg-host photo\" style=\"background-image: url(images/head.png)\"></div>\n" +
        "        <div class=\"msg-ball\">\n" +
        "            <div class=\"message__text_and_date\">\n" +
        "                <div class=\"message__text_wrap\">\n" +
        "                    <p class=\"message__text\">" + content + "</p>\n" +
        "                    <p class=\"message__text\">" + getFormatDate() + "</p>\n" +
        "                </div>\n" +
        "            </div>\n" +
        "        </div>\n" +
        "    </div>\n" +
        "</div>";
    } else{
          return  "<div class=\"msg\">\n" +
            "    <div class=\"msg-right\" worker=\"lemma\">\n" +
            "        <div class=\"msg-host headDefault\" style=\"background-image: url(images/man.png)\"></div>\n" +
            "        <div class=\"msg-ball\">\n" +
            "            <div class=\"message__text_and_date\">\n" +
            "                <div class=\"message__text_wrap\">\n" +
            "                    <p class=\"message__sender_name\">"+data[i].receive_user+"</p>\n" +
            "                    <p class=\"message__text\">"+data[i].answer+"</p>\n" +
            "                    <p class=\"message__text\">"+data[i].create_time+"</p>\n" +
            "                </div>\n" +
            "            </div>\n" +
            "        </div>\n" +
            "    </div>\n" +
            "</div>";
    }
}



// 发送后台处理
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