//Azuren.ready(function () {
$(function () {
    var buildProject = function (project) {
        var html = '<li class="project-item" data-id="' + project.Id + '" data-email="' + project.Email + '"> <div class="proj-color color-' + project.Color + '" /> <div class="name">' + project.Name +
            '</div><div class="menu"> <div class="menu glyphicon glyphicon-cog"></div></div></li>';
        return html;
    };

    var reloadProjects = function () {
        $.get("/TODO/Projects", {}, function (e) {
            $(".project-item").remove();
            if (e.code == 0) {
                for (x in e.data) {
                    $("#project-list").append(buildProject(e.data[x]));
                }
            } else {
                alert("Fail to load projects");
            }
        });
    };
    reloadProjects();

    $("#add-project-cancel").click(function (e) {
        $("#add-project").show();
        $(".add-project-form").hide();
    });

    $("#edit-project-cancel").click(function (e) {
        $(".edit-project-form").hide().prev().show();
    });

    $("#add-project-btn").click(function (e) {
        $.post("/TODO/AddProject", { name: $("#project-name").val() }, function (e) {
            if (e.code == 0) {
                $("#add-project").show();
                $(".add-project-form").hide();
                $("#project-name").val("");
                reloadProjects();
            } else {
                alert("add project error");
            }
        });
    });

    $("#add-project").click(function (e) {
        e.preventDefault();
        $(this).hide();
        $(".add-project-form").show();
    });


    var buildTask = function (e) {
        var html = '<li class="task-item clearfix" data-id="' + e.Id + '"> <div class="task-color color-' + e.Color + '" /> <div class="name">' + e.Content +
            '</div><div class="menu  glyphicon glyphicon-cog"></div><div class="task-due">' + e.Due + '</div><div class="menu"> </div></li>';
        return html;
    };
    $(".add-task-link").click(function (e) {
        e.preventDefault();
        $(this).hide();
        $(".add-task").show().find(".datetimepicker").data("datetimepicker").setLocalDate(new Date());
    });
    $("#add-task-btn").click(function (e) {
        e.preventDefault();
        $.post("/TODO/AddTask", { projectId: $("#add-task-id").val(), content: $(".add-task-text").val(), due: $("#add-task-due-text").val() }, function (e) {
            $(".add-task").hide().find(".add-task-text").val("");
            $(".add-task-link").show();
            $(".task-list").prepend(buildTask(e.data));
        });
    });
    $("#add-task-cancel").click(function (e) {
        e.preventDefault();
        $(".add-task-link").show();
        $(".add-task").hide();
    });

    $(document).on("click", "#edit-task-cancel", function (e) {
        e.preventDefault();
        $(".edit-task").hide().prev().show();
    });

    var dtp = $(".datetimepicker").datetimepicker({
        language: "en",
        startDate: new Date(),
    });

    $(document).on("click", ".project-item .name", function (e) {
        e.preventDefault();
        var id = $(this).parents(".project-item").data("id");
        var name = $(this).html();

        $(".project-item").removeClass("active-project");
        $(this).parents(".project-item").addClass("active-project");
        $.post("/TODO/Tasks", { projectId: id }, function (e) {
            $("#add-task-id").val(id);
            $(".project-title").html(name);
            if (e.code == 0) {
                $(".task-info").show();
                $(".edit-task").hide();
                $(".task-item").remove();
                for (x in e.data) {
                    $(".task-list").append(buildTask(e.data[x]));
                }
            } else {
                alert("Load tasks error!");
            }
        });
    });

    $(document).on("dblclick", ".task-item", function () {
        $(".edit-task").hide().prev().show();
        var taskItem = $(this);
        taskItem.hide().after($(".edit-task").show());
        $(".edit-task .edit-task-text").val(taskItem.find(".name").html());
        $(".edit-task .task-id").val(taskItem.data("id"));
        $(".edit-task .datetimepicker").data('datetimepicker').setLocalDate(new Date(taskItem.find(".task-due").html()));
    });

    $(document).on("dblclick", ".project-item .name", function (e) {
        $(".edit-project-form").hide().prev().show();
        $(this).parent(".project-item").after($(".edit-project-form").show()).hide();
        $("#edit-project-name").val($(this).html());
    });
    $(document).on("click", "#edit-project-btn", function (e) {
        var item = $(".edit-project-form").prev();
        $.post("/TODO/EditProject", { projectId: item.data("id"), name: $("#edit-project-name").val() }, function (e) {
            if (e.code == 0) {
                $(".edit-project-form").hide().prev().show().find(".name").html(e.data);
            } else {
                alert("update failed");
            }
        });
    });

    $(document).on("click", "#edit-task-btn", function (e) {
        e.preventDefault();
        var editTask = $(".edit-task");
        var taskItem = editTask.prev();
        var content = $(".edit-task .edit-task-text").val();
        var id = $(".edit-task .task-id").val();
        var due = $("#edit-task-due-text").val();
        $.post("/TODO/EditTask", { Id: id, Content: content, Due: due }, function (e) {
            if (e.code == 0) {
                taskItem.find(".name").html(e.data.Content);
                taskItem.find(".task-due").html(e.data.Due);
                $(".edit-task").hide().prev().show();
            } else {
                alert("update failed");
            }
        });
    });

    $(document).on("click", ".task-item .menu", function (e) {
        e.stopPropagation();
        e.preventDefault();
        var pos = $(this).position();
        $(".context-menu").hide();
        $("#task-context-menu").show().css("top", pos.top + $(this).height()).css("left", pos.left + $(this).width() - $("#task-context-menu").width()).data("id", $(this).parents(".task-item").data("id"));
    });
    $(document).on("click", ".project-item .menu", function (e) {
        e.stopPropagation();
        e.preventDefault();
        var pos = $(this).position();
        $(".context-menu").hide();
        $("#project-context-menu").show().css("top", pos.top + $(this).height()).css("left", pos.left + $(this).width()).data("id", $(this).parents(".project-item").data("id"));
    });
    $(document).click(function () {
        $(".context-menu").hide();
    });
    $(document).on("click", ".proj-color", function (e) {
        e.stopPropagation();
        e.preventDefault();
        var pos = $(this).position();
        $(".context-menu").hide();
        $("#project-context-color").show().css("top", pos.top + $(this).height()).css("left", pos.left + $(this).width()).data("id", $(this).parents(".project-item").data("id"));
    });

    $("#project-context-menu").on("click", ".rename-project", function (e) {
        $(".project-item[data-id=" + $("#project-context-menu").data("id") + "]").find(".name").trigger("dblclick");
    });
    $("#project-context-menu").on("click", ".remove-project", function (e) {
        var id = $("#project-context-menu").data("id");
        $.post("/TODO/RemoveProject", { id: id }, function (e) {
            if (e.code == 0) {
                reloadProjects();
                var editor = $("#add-task-id[value=" + id + "]").parents("#editor");
                if (editor) {
                    editor.find(".task-info").hide();
                    editor.find(".task-list").html("");
                }
            } else {
                alert("Remove project failed");
            }
        }, "json");
    });

    $("#task-context-menu").on("click", ".remove-task", function (e) {
        var id = $("#task-context-menu").data("id");
        $.post("/TODO/RemoveTask", { taskId: id }, function (e) {
            if (e.code == 0) {
                $(".task-item[data-id=" + id + "]").remove();
            } else {
                alert("Remove task failed");
            }
        }, "json");
    });

    $("#task-context-menu").on("click", ".done-task", function (e) {
        var id = $("#task-context-menu").data("id");
        $.post("/TODO/EditTask", { Id: $("#task-context-menu").data("id"), Color: 101 }, function (e) {
            if (e.code == 0) {
                $(".task-item[data-id=" + id + "]").find(".task-color").removeClass("color-0").removeClass("color-1").removeClass("color-2").removeClass("color-3")
        .addClass("color-" + e.data.Color);
            } else {
                alert("update failed");
            }
        }, "json");
    });
    $("#task-context-menu").on("click", ".edit-taskitem", function (e) {
        var id = $("#task-context-menu").data("id");
        $(".task-item[data-id=" + id + "]").trigger("dblclick");
    });

    $("#project-context-color").on("click", "li", function (e) {
        var id = $("#project-context-color").data("id");
        $.post("/TODO/EditProjectColor", { Id: id, Color: $(this).data("id") }, function (e) {
            if (e.code == 0) {
                $(".project-item[data-id=" + id + "]").find(".proj-color").removeClass("color-0").removeClass("color-1").removeClass("color-2").removeClass("color-3")
        .addClass("color-" + e.data);
            } else {
                alert("set color failed");
            }
        }, "json");
    });

    $("#task-context-menu").on("click", ".set-priority li", function(e) {
        var color = $(this).data("id");
        var id = $("#task-context-menu").data("id");
        $.post("/TODO/EditTask", { Id: $("#task-context-menu").data("id") , Color: color}, function(e) {
            if (e.code == 0) {
                $(".task-item[data-id=" + id + "]").find(".task-color").removeClass("color-0").removeClass("color-1").removeClass("color-2").removeClass("color-3")
        .addClass("color-" + e.data.Color);
            } else {
                alert("update failed");
            }
        }, "json");
    });

});