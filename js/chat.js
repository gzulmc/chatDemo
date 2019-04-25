// 按Enter键发送信息
$(document).keydown(function(event){
    if(event.keyCode == 13){
        SendMsg();
    }
});

initUserList();
setTotalPage();

function initUserList() {
    var retStr = "";
    $.ajax({
        type: "get",
        async:false,
        dataType: "json",
        data:{page: page, rows: rows},
        url: "serviceLog!findChatUserList",
        error: function (request) {
            retStr = "";
            $("#user_list").html("");
        },
        success: function (data) {
            retStr = "<ul class=\"sidebar__dilog_list\" style='height: 557px' id=\"hots\">";
            var datas = data.returnMessage.message;
            //设置总记录数
            totalRows = data.returnMessage.result;
            for (var i = 0; i < datas.length; i++) {
                retStr += "    <li class=\"dialog__item j-dialog__item \"  id=\""+datas[i].userId+"\">\n" +
                    "        <a class=\"dialog__item_link\" onclick='openDialog(\""+datas[i].userId+"\",\""+datas[i].nickName+"\")' href=\"javascript:void(0);\" style='text-decoration: none'>\n" +
                    "            <span class=\"dialog__info\">\n" +
                    "                <span class=\"dialog__name\">"+datas[i].nickName+"</span>\n" +
                    "                <span class=\"dialog__last_message j-dialog__last_message \">"+datas[i].userId+"</span>\n" +
                    "            </span>\n" +
                    /*"            <span class=\"dialog_additional_info\">\n" +
                    "                <span class=\"dialog__last_message_date j-dialog__last_message_date\">\n" +
                    "                    "+datas[i]+"\n" +
                    "                </span>\n" +
                    "                <span class=\"dialog_unread_counter j-dialog_unread_counter\">"+data[i].unread_counter+"</span>\n" +
                    "            </span>\n" +*/
                    "        </a>\n" +
                    "    </li>";
            }
            retStr += "</ul>";
            retStr += "<div style=\"bottom: 0px; height: 30px; line-height: 30px; width: 100%; background-color: #eceeed\">\n" +
                "                        <a href=\"javascript:void(0)\" onclick=\"beforePage()\">上一页</a>\n" +
                "                        <a href=\"javascript:void(0)\" onclick='nextPage()' id=\"nextPage\">下一页</a> 转到\n" +
                "                        <input type=\"text\" id=\"jumpPage\" style=\"width: 60px;height: 20px\">页\n" +
                "                        <a href=\"javascript:void(0)\" onclick='jumpPage()' id=\"jumpAction\">GO</a>\n" +
                "                        <a id=\"currentPage\" style=\"margin-left: 10px\">1</a>/<a id=\"totalPages\">0</a>\n" +
                "                    </div>";
            $("#user_list").append(retStr);
        }
    });
}

/*根据用户id获取用户对话记录*/
function openDialog(id,nickName) {
    if (id) {
        $("#msgs").html("");
        $("#user_list").find("ul li").each(function () {
            $(this).removeClass("selected");
        });
        $.ajax({
            type: "get",
            async:false,
            data:{fromUsers:id},
            dataType: "json",
            url: "serviceLog!findDialogHistory",
            error: function (request) {
                retStr = "";
                $("#user_list").html("");
            },
            success: function (data) {
                var datas = data.returnMessage.message;
                retStr = "";
                retStrs = "";
                $("#histStart").html(datas[0].fromUser);
                $("#" + id).addClass("selected");
                //表示消息已读
                $("#" + id).find("span").eq(1).css("color","#4A4A4A");
                for (var i = 0; i < datas.length; i++) {
                    if (datas[i].messageType == 1) { //用户提问
                        retStrs +=  "<div class=\"msg\">\n" +
                                    "    <div class=\"msg-left\" worker=\"" + nickName + "\">\n" +
                                    "        <div class=\"msg-host photo\" style=\"background-image: url(../../themes/images/head.png)\"></div>\n" +
                                    "        <div class=\"msg-ball\">\n" +
                                    "            <div class=\"message__text_and_date\">\n" +
                                    "                <div class=\"message__text_wrap\">\n" +
                                    "                    <p class=\"message__text\">" + showBase64Img(datas[i].message) + "</p>\n" +
                                    "                    <p class=\"message__text\">" + datas[i].messageTime + "</p>\n" +
                                    "                </div>\n" +
                                    "            </div>\n" +
                                    "        </div>\n" +
                                    "    </div>\n" +
                                    "</div>\n";
                    } else {
                        retStrs +=  "<div class=\"msg\">\n" +
                                    "    <div class=\"msg-right\" worker=\"lemma\">\n" +
                                    "        <div class=\"msg-host headDefault\" style=\"background-image: url(../../themes/images/man.png)\"></div>\n" +
                                    "        <div class=\"msg-ball\">\n" +
                                    "            <div class=\"message__text_and_date\">\n" +
                                    "                <div class=\"message__text_wrap\">\n" +
                                    "                    <p class=\"message__sender_name\">"+""+"</p>\n" +
                                    "                    <p class=\"message__text\">"+showBase64Img(datas[i].message)+"</p>\n" +
                                    "                    <p class=\"message__text\">"+datas[i].messageTime+"</p>\n" +
                                    "                </div>\n" +
                                    "            </div>\n" +
                                    "        </div>\n" +
                                    "    </div>\n" +
                                    "</div>";
                    }
                }
                $("#msgs").append(retStrs);
                $("#show")[0].scrollTop = $("#show")[0].scrollHeight;//滚动条滑动最低端
                //$("#" + id).find("span:last").addClass("hidden").html("");//设置未读消息为空
            }
        });
    }
}

function showBase64Img(msg) {
    if (msg && "data:image"==msg.substring(0, 10)) {
        return "<img style='max-width: 500px;max-height: 300px' src=" + msg + ">";
    }
    return msg;
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
function SendMsg(msg) {
    var text = $("#text").val().trim().replace(" ", "");
    if (msg) {
        text = msg;
    }
    var fromUser = $("#histStart").text();
    if (text) {
        //var retMsg = saveSendMsg(fromUser,text);
        if (true) {
            addMsg(fromUser, text);
        }
        $("#text").val("");
    }
    $("#show")[0].scrollTop = $("#show")[0].scrollHeight;
}

function SendMsgDispose(detail) {
    detail = detail.replace("\n", "<br>").replace(" ", "&nbsp;")
    return detail;
}

// 增加信息
function addMsg(user,content) {
    var str = createMsg(user, content);
    var msgs = document.getElementById("msgs");
    msgs.innerHTML = msgs.innerHTML + str;
}

// 生成内容
function createMsg(user, content) {

    if (user=="default") {
        return "<div class=\"msg\">\n" +
        "    <div class=\"msg-left\" worker=\"" + user + "\">\n" +
        "        <div class=\"msg-host photo\" style=\"background-image: url(../../themes/images/head.png)\"></div>\n" +
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
    } else if("data:image"==content.substring(0, 10)){
          return  "<div class=\"msg\">\n" +
            "    <div class=\"msg-right\" worker=\"lemma\">\n" +
            "        <div class=\"msg-host headDefault\" style=\"background-image: url(../../themes/images/man.png)\"></div>\n" +
            "        <div class=\"msg-ball\">\n" +
            "            <div class=\"message__text_and_date\">\n" +
            "                <div class=\"message__text_wrap\">\n" +
            "                    <p class=\"message__sender_name\">"+""+"</p>\n" +
            "                    <p class=\"message__text\">"+showBase64Img(content)+"</p>\n" +
            "                    <p class=\"message__text\">"+getFormatDate()+"</p>\n" +
            "                </div>\n" +
            "            </div>\n" +
            "        </div>\n" +
            "    </div>\n" +
            "</div>";
    } else {
        return  "<div class=\"msg\">\n" +
            "    <div class=\"msg-right\" worker=\"lemma\">\n" +
            "        <div class=\"msg-host headDefault\" style=\"background-image: url(../../themes/images/man.png)\"></div>\n" +
            "        <div class=\"msg-ball\">\n" +
            "            <div class=\"message__text_and_date\">\n" +
            "                <div class=\"message__text_wrap\">\n" +
            "                    <p class=\"message__sender_name\">"+""+"</p>\n" +
            "                    <p class=\"message__text\">"+content+"</p>\n" +
            "                    <p class=\"message__text\">"+getFormatDate()+"</p>\n" +
            "                </div>\n" +
            "            </div>\n" +
            "        </div>\n" +
            "    </div>\n" +
            "</div>";
    }
}



//存储坐席人员回复信息,并调用用户留言发送接口将回复信息发送给对方
function saveSendMsg(fromUser,content)
{
    var retStr = "";
    $.ajax({
        type: "POST",
        async:false,
        url: "serviceLog!saveChatInfo",
        data: {
            fromUser: fromUser,
            content: content
        },
        error: function (request) {
            retStr = "服务器出错";
        },
        success: function (data) {
            retStr = data.info;
        }
    });
    return retStr;
}

//接收服务端推送过来的数据,用户修改为红色
function receiveMsg(msg) {
    if (msg) {
        var fromUser = msg.fromUser;
        //修改用户显示为红色
        var dialogName = $("#"+searchText).find("span").eq(1);
        dialogName.css("color", "red");
        //调整li元素位置
        var li = $("#" + searchText);
        //获取列表中第一个li
        var li0 = $("#hots").find("li").eq(0);
        li0.before(li);
    }
}

//根据用户id或关键字查询信息
function searchByUserId(msg) {
    var searchText = $("#search").val();
    //修改用户显示为红色
    var dialogName = $("#"+searchText).find("span").eq(1);
    dialogName.css("color", "red");
    //调整li元素位置
    var li = $("#" + searchText);
    //获取列表中第一个li
    var li0 = $("#hots").find("li").eq(0);
    li0.before(li);
}

//根据内容查询
function searchByContent() {
    var searchText = $("#searchText").val();
    var regExp = new RegExp(searchText, 'g');
    $('#msgs').find("div.message__text_wrap").each(function () {
        var p_tag = $(this).find("p.message__text").eq(0);
        var p_text = p_tag.text();
        var newHtml = p_text.replace(regExp, '<span style="color:red;background-color: yellow">' + searchText + '</span>');
        p_tag.html(newHtml);
    })
}

function changeHandle() {
    var file = document.getElementById("fileInput");
    var reader = new FileReader();
    if (/image/.test(file.files[0].type)) {
        console.log(file.files[0]);
        reader.readAsDataURL(file.files[0]);
    } else {
        alert('请选择图片!');
        file.value = "";
        return;
    }
    // 图片加载错误
    reader.onerror = function () {
        document.write("图片加载错误");
    }
    // 图片加载完成,发送消息
    reader.onload = function () {
        var img = reader.result;
        SendMsg(img);
        $("#fileInput").off("change", changeHandle);
    }
}

//发送图片
function selectImg() {
    $("#fileInput").click();
    $("#fileInput").on("change", changeHandle);
}
