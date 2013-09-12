using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Objects;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Security;
using AzurenRole.SDK;

namespace AzurenRole.Controllers
{
    public class NoteController : Controller
    {
        private AzurenEntities _entities = new AzurenEntities();
        private readonly AzurenClient _client = new AzurenClient("1003", "111111");

        public ActionResult Index()
        {
            if (!User.Identity.IsAuthenticated) return Redirect(_client.OAuthCheckUrl());
            ViewData["user"] = User.Identity.Name;
            ViewData["notes"] = _entities.Notes.Where(m => m.User == User.Identity.Name);
            return View();
        }

        public ActionResult List()
        {
            if (!User.Identity.IsAuthenticated) return Redirect(_client.OAuthCheckUrl());
            return Json(_entities.Notes.Where(m => m.User == User.Identity.Name).Select(m=>new {m.Id, m.Title}), JsonRequestBehavior.AllowGet);
        }

        public ActionResult AddOrMod(string title, string content, int id = -1)
        {
            if (!User.Identity.IsAuthenticated) return Redirect(_client.OAuthCheckUrl());
            try
            {
                var note = new Note();
                if (id != -1)
                {
                    note = _entities.Notes.SingleOrDefault(m => m.Id == id);
                    if (note == null)
                    {
                        throw new Exception("Note not exists.");
                    }

                }
                note.Title = title;
                note.Content = content;
                note.User = User.Identity.Name;

                if(note.EntityState != EntityState.Modified)
                _entities.AddToNotes(note);
                _entities.SaveChanges();
                _entities.Refresh(RefreshMode.StoreWins, note);
                return Json(new { code = 0, data = note }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { code = 1, data = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult Show(int id)
        {
            if (!User.Identity.IsAuthenticated) return Redirect(_client.OAuthCheckUrl());
            try
            {
                var note = _entities.Notes.SingleOrDefault(m => m.Id == id);
                if (note == null)
                {
                    throw new Exception("Note not exist");
                }
                return Json(new { code = 0, data = note }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { code = 1, data = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult Delete(int id)
        {
            if (!User.Identity.IsAuthenticated) return Redirect(_client.OAuthCheckUrl());
            try
            {
                var note = _entities.Notes.SingleOrDefault(m => m.Id == id);
                if (note == null)
                {
                    throw new Exception();
                }
                _entities.DeleteObject(note);
                _entities.SaveChanges();
                return Json(new { code = 0, data = note }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { code = 1, data = ex.Message }, JsonRequestBehavior.AllowGet);
            }
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
