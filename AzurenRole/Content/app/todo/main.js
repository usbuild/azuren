//Azuren.ready(function () {
$(function () {
    var colors = { 0: "green" };
    var buildProject = function (project) {
        var html = '<li class="project-item" data-id="' + project.Id + '"> <div class="proj-color color-' + colors[project.Color] + '" /> <div class="name">' + project.Name +
            '</div><div class="menu"> <div class="icon menu cmp-gear-off gear-menu glyphicon glyphicon-cog"></div></div></li>';
        return html;
    };

    var reloadProjects = function () {
        $.get("/TODO/Projects", {}, function (e) {
            $(".project-itemt").remove();
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
        var html = '<li class="task-item clearfix" data-id="' + e.Id + '"> <div class="task-color color-' + colors[e.Color] + '" /> <div class="name">' + e.Content +
            '</div><div class="menu  glyphicon glyphicon-cog"></div><div class="task-due">' + e.Due + '</div><div class="menu"> </div></li>';
        return html;
    };
    $(".add-task-link").click(function (e) {
        e.preventDefault();
        $(this).hide();
        $(".add-task").show();
    });
    $("#add-task-btn").click(function (e) {
        e.preventDefault();
        $(".add-task-link").show();
        $(".add-task").hide();
        $.post("/TODO/AddTask", { projectId: $("#add-task-id").val(), content: $(".add-task-text").val(), due: $("#add-task-due-text").val() }, function (e) {
            console.dir(e);
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
        $(".task-info").show();
        $(".project-item").removeClass("active-project");
        $(this).parents(".project-item").addClass("active-project");
        $.post("/TODO/Tasks", { projectId: id }, function (e) {
            $("#add-task-id").val(id);
            $(".project-title").html(name);
            if (e.code == 0) {
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
        $(".edit-task .datetimepicker").data('datetimepicker').setDate(Date.parse(taskItem.find(".task-due").html()));
    });

    $(document).on("dblclick", ".project-item .name", function (e) {
        $(this).parent(".project-item").after($(".edit-project-form").show()).hide();
        $("#edit-project-name").val($(this).html());
    });
    $(document).on("click", "#edit-project-btn", function(e) {
        var item = $(".edit-project-form").prev();
        $.post("/TODO/EditProject", { projectId: item.data("id"), name: $("#edit-project-name").val() }, function (e) {
            if (e.code == 0) {
                $(".edit-project-form").hide().prev().show().find(".name").html(e.data);
            } else {
                alert("update failed");
            }
        });
    });

    $(document).on("click", "#edit-task-btn", function(e) {
        e.preventDefault();
        var editTask = $(".edit-task");
        var taskItem = editTask.prev();
        var content = $(".edit-task .edit-task-text").val();
        var id = $(".edit-task .task-id").val();
        var due = $("#edit-task-due-text").val();
        $.post("/TODO/EditTask", { Id: id, Content: content, Due: due }, function(e) {
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
        
    });
    $(document).on("click", ".project-item .menu", function (e) {
        
    });
});