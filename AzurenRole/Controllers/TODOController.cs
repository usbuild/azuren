using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Web.Mvc;
using System.Web.Security;
using AzurenRole.App_Start;
using AzurenRole.SDK;

namespace AzurenRole.Controllers
{


    public class TODOController : Controller
    {


        private AzurenEntities entities = new AzurenEntities();
        private readonly AzurenClient _client = new AzurenClient("1", "111111");

        public ActionResult Test()
        {
            _client.SendMessage("usbuild", new {content = "Hello"});
            return Content("");
        }
        public ActionResult Index()
        {
            if (!User.Identity.IsAuthenticated) return Redirect(_client.OAuthCheckUrl());
            return View();
        }

        public ActionResult Projects()
        {
            if (!User.Identity.IsAuthenticated) return Redirect(_client.OAuthCheckUrl());
            var Projects = entities.ToDoProjects.Where(a => a.UserName == User.Identity.Name).Select(a => new { Name = a.Name, Id = a.Id, Color = a.Color, Email = a.Email });
            return Json(new { code = 0, data = Projects.ToList() }, JsonRequestBehavior.AllowGet);
        }

        public ActionResult Tasks(int projectId, string condition)
        {
            if (!User.Identity.IsAuthenticated) return Redirect(_client.OAuthCheckUrl());
            var project = entities.ToDoProjects.SingleOrDefault(m => m.UserName == User.Identity.Name && m.Id == projectId);

            if (project != null)
            {
                IEnumerable<ToDoTask> result = project.ToDoTasks;
                if (condition != null)
                {
                    var conditions = from x in condition.Split(',')
                                     select x.Trim();
                    foreach (var cond in conditions)
                    {
                        if (cond.Equals("complete"))
                        {
                            result = result.Where(m => m.Color >= 100);
                        }
                        else if (cond.Equals("pending"))
                        {
                            result = result.Where(m => m.Color < 100);
                        }
                    }
                }
                return Json(new { code = 0, data = result.Select(m => new { Id = m.Id, Content = m.Content, Color = m.Color, ProjectId = m.ProjectId, Due = m.Due.ToString("yyyy/MM/dd HH:mm:ss UTC") }).Reverse() }, JsonRequestBehavior.AllowGet);
            }

            return Json(new { code = 1 }, JsonRequestBehavior.AllowGet);
        }

        public ActionResult AddProject(string name)
        {
            if (!User.Identity.IsAuthenticated) return Redirect(_client.OAuthCheckUrl());
            ToDoProject Project = entities.ToDoProjects.SingleOrDefault(m => m.Name == name && m.UserName == User.Identity.Name);
            if (Project == null)
            {
                ToDoProject pro = new ToDoProject();
                pro.Name = name;
                pro.UserName = User.Identity.Name;
                pro.Color = 0;
                pro.Email = false;
                entities.AddToToDoProjects(pro);
                entities.SaveChanges();
                return Json(new { code = 0, data = pro }, JsonRequestBehavior.AllowGet);
            }
            return Json(new { code = 1 }, JsonRequestBehavior.AllowGet);
        }

        public ActionResult RemoveProject(int id)
        {
            if (!User.Identity.IsAuthenticated) return Redirect(_client.OAuthCheckUrl());
            ToDoProject project =
                entities.ToDoProjects.SingleOrDefault(m => m.Id == id && m.UserName == User.Identity.Name);
            if (project != null)
            {
                entities.DeleteObject(project);
                entities.SaveChanges();
                return Json(new { code = 0, data = project }, JsonRequestBehavior.AllowGet);
            }
            return Json(new { code = 1 }, JsonRequestBehavior.AllowGet);
        }

        public ActionResult AddTask(int projectId, string content, string due)
        {
            if (!User.Identity.IsAuthenticated) return Redirect(_client.OAuthCheckUrl());
            ToDoProject project =
                entities.ToDoProjects.SingleOrDefault(m => m.Id == projectId && m.UserName == User.Identity.Name);
            if (project != null)
            {
                ToDoTask task = new ToDoTask();
                task.Content = content;
                task.Due = DateTime.Parse(due).ToUniversalTime();
                task.Color = 0;
                task.ProjectId = projectId;
                project.ToDoTasks.Add(task);
                entities.SaveChanges();
                ToDoTaskQueue.AddToQueue(task);
                return Json(new { code = 0, data = new { Id = task.Id, Content = task.Content, Color = task.Color, ProjectId = task.ProjectId, Due = task.Due.ToString("yyyy/MM/dd HH:mm:ss UTC") } }, JsonRequestBehavior.AllowGet);
            }
            return Json(new { code = 1 }, JsonRequestBehavior.AllowGet);
        }

        public ActionResult RemoveTask(int taskId)
        {
            if (!User.Identity.IsAuthenticated) return Redirect(_client.OAuthCheckUrl());
            ToDoTask task = entities.ToDoTasks.SingleOrDefault(m => m.Id == taskId);
            if (task != null)
            {
                entities.DeleteObject(task);
                entities.SaveChanges();
                ToDoTaskQueue.DeleteQueue(task);
                return Json(new { code = 0, data = new { Id = task.Id, Content = task.Content, Color = task.Color, ProjectId = task.ProjectId, Due = task.Due.ToString("yyyy/MM/dd HH:mm:ss UTC") } }, JsonRequestBehavior.AllowGet);
            }
            return Json(new { code = 1 }, JsonRequestBehavior.AllowGet);
        }

        public ActionResult EditTask(ToDoTask task)
        {
            if (!User.Identity.IsAuthenticated) return Redirect(_client.OAuthCheckUrl());
            ToDoTask t = entities.ToDoTasks.SingleOrDefault(m => m.Id == task.Id);
            if (t != null && t.ToDoProject.UserName == User.Identity.Name)
            {
                if (Request.Params["Content"] != null) t.Content = task.Content;
                if (Request.Params["Color"] != null) t.Color = task.Color;
                if (Request.Params["Due"] != null) t.Due = task.Due.ToUniversalTime();
                entities.SaveChanges();
                if (task.Color < 100)
                {
                    ToDoTaskQueue.UpdateQueue(t);
                }
                else
                {
                    ToDoTaskQueue.DeleteQueue(t);
                }
                return Json(new { code = 0, data = new { Id = t.Id, Content = t.Content, Color = t.Color, ProjectId = t.ProjectId, Due = t.Due.ToString("yyyy/MM/dd HH:mm:ss UTC") } }, JsonRequestBehavior.AllowGet);
            }
            return Json(new { code = 1 }, JsonRequestBehavior.AllowGet);
        }

        public ActionResult EditProject(int projectId, string name)
        {
            if (!User.Identity.IsAuthenticated) return Redirect(_client.OAuthCheckUrl());
            ToDoProject proj = entities.ToDoProjects.SingleOrDefault(m => m.Id == projectId && m.UserName == User.Identity.Name);
            if (proj != null)
            {
                proj.Name = name;
                entities.SaveChanges();
                return Json(new { code = 0, data = name }, JsonRequestBehavior.AllowGet);
            }
            return Json(new { code = 1 }, JsonRequestBehavior.AllowGet);
        }
        public ActionResult EditProjectColor(int Id, byte Color)
        {
            if (!User.Identity.IsAuthenticated) return Redirect(_client.OAuthCheckUrl());
            ToDoProject proj = entities.ToDoProjects.SingleOrDefault(m => m.Id == Id && m.UserName == User.Identity.Name);
            if (proj != null)
            {
                proj.Color = Color;
                entities.SaveChanges();
                return Json(new { code = 0, data = Color }, JsonRequestBehavior.AllowGet);
            }
            return Json(new { code = 1 }, JsonRequestBehavior.AllowGet);
        }



        public ActionResult Callback(string key)
        {
            var b = _client.GetToken(key);
            if (b != null)
            {
                FormsAuthentication.SetAuthCookie(b, true);
                return RedirectToAction("Index");
            }
            return Content("Authentification Failed");
        }
    }
}
