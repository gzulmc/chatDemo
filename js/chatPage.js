var totalRows;
var totalPages;
var page = 1;
var rows = 10;

function currentPage() {
    if (totalPages > 0) {
        $("#currentPage").text(page);
    } else {
        $("#currentPage").text(0);
    }
}

//上一页
function beforePage() {
    if (page > 1) {
        page -= 1;
        currentPage();
        $("#jumpPage").val("");
        //getQueryData();
        //LoadData(queryData);
        loadUserList();
    }
}

//下一页
function nextPage() {
    if (page < totalPages) {
        page += 1;
        currentPage();
        $("#jumpPage").val("");
        //getQueryData();
        //LoadData(queryData);
        loadUserList();
    }
}

//跳转页面
function jumpPage() {
    var wherePage = parseInt($("#jumpPage").val(), 10);
    if (wherePage >= 1 && wherePage <= totalPages) {
        page = wherePage;
        currentPage();
        $("#jumpPage").val("");
        loadUserList();
    } else {
        $.messager.defaults = {ok: "确定", cancel: "取消"};
        $.messager.alert('提醒消息', "页数有误，请重新输入！");
    }
}

function setTotalPage() {
    var a = totalRows / rows;
    totalPages = Math.ceil(a);
    $("#totalPages").text(totalPages);
    currentPage();
}

function loadUserList() {
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
                retStr += "    <li class=\"dialog__item j-dialog__item \"  id=\""+datas[i].fromUser+"\">\n" +
                    "        <a class=\"dialog__item_link\" onclick='openDialog(\""+datas[i].fromUser+"\")' href=\"javascript:void(0);\" style='text-decoration: none'>\n" +
                    "            <span class=\"dialog__info\">\n" +
                    "                <span class=\"dialog__name\">"+datas[i].fromUser+"</span>\n" +
                    "                <span class=\"dialog__last_message j-dialog__last_message \">"+datas[i].fromUser+"</span>\n" +
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
            $("#hots").replaceWith(retStr);
        }
    });
}
