using System;
using System.ComponentModel.DataAnnotations;
using System.Configuration;
using System.Linq;
using System.Runtime.Caching;
using System.Web.Mvc;
using AzurenRole.Helpers;
using AzurenRole.Models;
using AzurenRole.Filters;
using System.Web.Security;
using AzurenRole.Utils;
using Microsoft.ApplicationServer.Caching;

namespace AzurenRole.Controllers
{
    [Authorize]
    [InitializeSimpleMembership]
    public class AccountController : Controller
    {
        //
        // GET: /Account/

        private AzurenEntities context = GlobalData.dbContext;
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult Logout()
        {
            FormsAuthentication.SignOut();
            return RedirectToAction("Login");
        }

        [HttpGet]
        [AllowAnonymous]
        public ActionResult Login(string returnUrl = "/")
        {
            if (System.Web.HttpContext.Current.User.Identity.IsAuthenticated)
            {
                return RedirectToAction("Index", "Home");
            }
            return PartialView();
        }

        [HttpPost]
        [AllowAnonymous]
        public ActionResult Login(Models.LoginForm form, string ReturnUrl = "/")
        {
            if (System.Web.HttpContext.Current.User.Identity.IsAuthenticated)
            {
                return RedirectToAction("Index", "Home");
            }

            if (!ModelState.IsValid)
            {
                return PartialView(form);
            }


            User u;
            if (form.EmailOrUserName.Contains("@"))
            {
                u = context.Users.SingleOrDefault(m => m.Email == form.EmailOrUserName);
            }
            else
            {
                u = context.Users.SingleOrDefault(m => m.Username == form.EmailOrUserName);
            }
            if (u == null || StringHelper.CalcPassword(form.Password, u.Salt) != u.Password)
            {
                ModelState.AddModelError("", "Email or password is not correct");
                return PartialView(form);
            }
            FormsAuthentication.SetAuthCookie(u.Username, true);
            return Redirect(ReturnUrl);
        }

        [HttpGet]
        [AllowAnonymous]
        public ActionResult Signup()
        {

            if (System.Web.HttpContext.Current.User.Identity.IsAuthenticated)
            {
                return RedirectToAction("Index", "Home");
            }
            return PartialView();
        }

        [HttpPost]
        [AllowAnonymous]
        public ActionResult Signup(Models.RegisterForm form)
        {
            if (System.Web.HttpContext.Current.User.Identity.IsAuthenticated)
            {
                return RedirectToAction("Index", "Home");
            }
            if (!ModelState.IsValid)
            {
                return PartialView(form);
            }

            User u = context.Users.SingleOrDefault(m => m.Email == form.Email);
            if (u != null)
            {
                ModelState.AddModelError("Email", "This Email has already registered.");
                return PartialView(form);
            }

            u = context.Users.SingleOrDefault(m => m.Username == form.UserName);
            if (u != null)
            {
                ModelState.AddModelError("Username", "This username has already been taken.");
                return PartialView(form);
            }

            var salt = StringHelper.GetUniqueId();
            var password = StringHelper.CalcPassword(form.Password, salt);
            var user = new User { Username = form.UserName, Password = password, Salt = salt, Status = 0, Email = form.Email };
            context.AddToUsers(user);
            context.SaveChanges();
            FormsAuthentication.SetAuthCookie(form.UserName, true);
            return RedirectToAction("Index", "Home");
        }


        [HttpGet]
        public ActionResult Settings()
        {
            return View();
        }
        [HttpPost]
        public ActionResult Settings(SettingForm form)
        {
            User user = GlobalData.user;
            /*
            if (form != null)
            {
                if(ModelState.IsValidField(form.DisplayName)){
                    user.Displayname = form.DisplayName;
                }
            }
             * */


            if (form.NewPassword != null)
            {
                if (form.OldPassword == null || form.OldPassword != user.Password)
                {
                    ModelState.AddModelError("OldPassword", "Old password is not correct.");
                }
                if (ModelState.IsValidField(form.NewPassword))
                {
                    user.Password = form.NewPassword;
                }
            }
            (new DataCache("default")).Put(user.Username, user);
            User ent = context.Users.Single(_ => _.Id == user.Id);
            ent.Password = user.Password;
            context.SaveChanges();
            return View(form);
        }

        private const string EmailBody = @"Please follow this link to verify your email address: <a href=""{0}"">{0}</a><br>This link will expire in 30 minutes.";

        public ActionResult SendEmail()
        {
            string email = GlobalData.user.Email;
            try
            {
                MemoryCache cache = MemoryCache.Default;
                var token = Guid.NewGuid().ToString("N");
                cache.Add(token, email, DateTimeOffset.Now.AddMinutes(30));
                GlobalData.SendMail(email, "Please validate your email", String.Format(EmailBody, "http://" + ConfigurationManager.AppSettings["host"] + "/Account/ValidateEmail?token="+token));
                return Json(new { code = 0 }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { code = 1 }, JsonRequestBehavior.AllowGet);
            }
        }

        [AllowAnonymous]
        public ActionResult ValidateEmail(string token)
        {
            MemoryCache cache = MemoryCache.Default;
            if (cache.Contains(token))
            {
                var email = cache.Get(token).ToString();
                User u = GlobalData.dbContext.Users.SingleOrDefault(m => m.Email == email);
                if (u != null)
                {
                    u.Status = 1;
                    GlobalData.dbContext.SaveChanges();
                    cache.Remove(token);
                    return Content("Your email has already been validated");
                }
            }
            return Content("Invalid token");
        }
    }
}
