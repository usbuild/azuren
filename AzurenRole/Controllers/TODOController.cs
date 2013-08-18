using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Net.Http;
using System.Web.Mvc;
using System.Web.Security;
using AzurenRole.App_Start;

namespace AzurenRole.Controllers
{


    public class TODOController : Controller
    {


        private static string OAuthServer = "http://127.0.0.1:81/OAuth";
        private static string AppId = "1";
        private static string AppSecret = "111111";
        private AzurenEntities entities = new AzurenEntities();
        public ActionResult Index()
        {
            if (!User.Identity.IsAuthenticated) return Redirect(OAuthServer + "/Check?appid=" + AppId);
            return View();
        }

        public ActionResult Projects()
        {
            if (!User.Identity.IsAuthenticated) return Redirect(OAuthServer + "/Check?appid=" + AppId);
            var Projects = entities.ToDoProjects.Where(a => a.UserName == User.Identity.Name).Select(a => new { Name = a.Name, Id = a.Id, Color = a.Color, Email = a.Email });
            return Json(new { code = 0, data = Projects.ToList() }, JsonRequestBehavior.AllowGet);
        }

        public ActionResult Tasks(int projectId, string condition)
        {
            if (!User.Identity.IsAuthenticated) return Redirect(OAuthServer + "/Check?appid=" + AppId);
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
                return Json(new { code = 0, data = result.Select(m => new { Id = m.Id, Content = m.Content, Color = m.Color, ProjectId = m.ProjectId, Due = m.Due.DateTime.ToString("yyyy-MM-dd HH:mm:ss") }).Reverse() }, JsonRequestBehavior.AllowGet);
            }

            return Json(new { code = 1 }, JsonRequestBehavior.AllowGet);
        }

        public ActionResult AddProject(string name)
        {
            if (!User.Identity.IsAuthenticated) return Redirect(OAuthServer + "/Check?appid=" + AppId);
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
            if (!User.Identity.IsAuthenticated) return Redirect(OAuthServer + "/Check?appid=" + AppId);
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
            if (!User.Identity.IsAuthenticated) return Redirect(OAuthServer + "/Check?appid=" + AppId);
            ToDoProject project =
                entities.ToDoProjects.SingleOrDefault(m => m.Id == projectId && m.UserName == User.Identity.Name);
            if (project != null)
            {
                ToDoTask task = new ToDoTask();
                task.Content = content;
                DateTime dt = DateTime.ParseExact(due, "yyyy-MM-dd HH:mm:ss", new CultureInfo("zh-CN"));
                task.Due = DateTime.SpecifyKind(dt, DateTimeKind.Utc);
                task.Color = 0;
                task.ProjectId = projectId;
                project.ToDoTasks.Add(task);
                entities.SaveChanges();
                ToDoTaskQueue.AddToQueue(task);
                return Json(new { code = 0, data = new { Id = task.Id, Content = task.Content, Color = task.Color, ProjectId = task.ProjectId, Due = task.Due.DateTime.ToString("yyyy-MM-dd HH:mm:ss") } }, JsonRequestBehavior.AllowGet);
            }
            return Json(new { code = 1 }, JsonRequestBehavior.AllowGet);
        }

        public ActionResult RemoveTask(int taskId)
        {
            if (!User.Identity.IsAuthenticated) return Redirect(OAuthServer + "/Check?appid=" + AppId);
            ToDoTask task = entities.ToDoTasks.SingleOrDefault(m => m.Id == taskId);
            if (task != null)
            {
                entities.DeleteObject(task);
                entities.SaveChanges();
                ToDoTaskQueue.DeleteQueue(task);
                return Json(new { code = 0, data = new { Id = task.Id, Content = task.Content, Color = task.Color, ProjectId = task.ProjectId, Due = task.Due.DateTime.ToString("yyyy-MM-dd HH:mm:ss") } }, JsonRequestBehavior.AllowGet);
            }
            return Json(new { code = 1 }, JsonRequestBehavior.AllowGet);
        }

        public ActionResult EditTask(ToDoTask task)
        {
            if (!User.Identity.IsAuthenticated) return Redirect(OAuthServer + "/Check?appid=" + AppId);
            ToDoTask t = entities.ToDoTasks.SingleOrDefault(m => m.Id == task.Id);
            if (t != null && t.ToDoProject.UserName == User.Identity.Name)
            {
                if (Request.Params["Content"] != null) t.Content = task.Content;
                if (Request.Params["Color"] != null) t.Color = task.Color;
                if (Request.Params["Due"] != null) t.Due = task.Due;
                entities.SaveChanges();
                if (task.Color < 100)
                {
                    ToDoTaskQueue.UpdateQueue(t);
                }
                else
                {
                    ToDoTaskQueue.DeleteQueue(t);
                }
                return Json(new { code = 0, data = new { Id = t.Id, Content = t.Content, Color = t.Color, ProjectId = t.ProjectId, Due = t.Due.DateTime.ToString("yyyy-MM-dd HH:mm:ss") } }, JsonRequestBehavior.AllowGet);
            }
            return Json(new { code = 1 }, JsonRequestBehavior.AllowGet);
        }

        public ActionResult EditProject(int projectId, string name)
        {
            if (!User.Identity.IsAuthenticated) return Redirect(OAuthServer + "/Check?appid=" + AppId);
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
            if (!User.Identity.IsAuthenticated) return Redirect(OAuthServer + "/Check?appid=" + AppId);
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
            using (HttpClient client = new HttpClient())
            {
                var response = client.GetAsync(OAuthServer + "/getToken?secret=" + AppSecret + "&key=" + key);
                if (response.Result.IsSuccessStatusCode)
                {
                    string content = response.Result.Content.ReadAsStringAsync().Result;
                    var obj = System.Web.Helpers.Json.Decode(content);
                    if (obj.code == 0)
                    {
                        FormsAuthentication.SetAuthCookie(obj.data, true);
                        return RedirectToAction("Index");
                    }
                }
            }
            return Content("Authentification Failed");
        }
    }
}
