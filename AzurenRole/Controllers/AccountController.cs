using System;
using System.Configuration;
using System.Linq;
using System.Runtime.Caching;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using AzurenRole.Helpers;
using AzurenRole.Models;
using AzurenRole.Filters;
using System.Web.Security;
using AzurenRole.Utils;
using DotNetOpenAuth.Messaging;
using DotNetOpenAuth.OAuth2;
using Microsoft.ApplicationServer.Caching;
using Recaptcha;

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

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult> LiveLogin(string name = null)
        {
            if (System.Web.HttpContext.Current.User.Identity.IsAuthenticated)
            {
                return RedirectToAction("Index", "Home");
            }


            var client = new LiveConnect();
            IAuthorizationState state;
            if (Session["LiveToken"] != null)
            {
                state = (IAuthorizationState) Session["LiveToken"];
            }
            else
            {
                state = await client.ProcessUserAuthorizationAsync(Request);
            }
            if (state == null)
            {
                var request = await client.PrepareRequestUserAuthorizationAsync(
                    scopes: new[] { LiveConnect.Scopes.Basic, LiveConnect.Scopes.Emails, LiveConnect.Scopes.SignIn });
                await request.SendAsync(new HttpContextWrapper(System.Web.HttpContext.Current));
                Response.End();
            }
            else
            {
                if (name != null && GlobalData.dbContext.Users.Any(m=>m.Username == name))
                {
                    ViewData["message"] = "UserName already exists!";
                    return View();
                }
                User user = await client.GetUser(state, name);
                if (user == null)
                {
                    return RedirectToAction("Login");
                }
                else
                {
                    if (user.Id == 0)
                    {
                        Session["LiveToken"] = state;
                        return View();
                    }
                }
                FormsAuthentication.SetAuthCookie(user.Username, true);
                return RedirectToAction("Index", "Home");
            }

            return RedirectToAction("Login");
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
                u = context.Users.SingleOrDefault(m => m.Email == form.EmailOrUserName && m.Status != 3);
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

        private const string ValidateEmailBody = @"Please follow this link to verify your email address: <a href=""{0}"">{0}</a><br>This link will expire in 30 minutes.";

        public ActionResult SendEmail()
        {
            string email = GlobalData.user.Email;
            try
            {
                MemoryCache cache = MemoryCache.Default;
                var token = Guid.NewGuid().ToString("N");
                cache.Add(token, email, DateTimeOffset.Now.AddMinutes(30));
                GlobalData.SendMail(email, "Please validate your email", String.Format(ValidateEmailBody, "http://" + ConfigurationManager.AppSettings["host"] + "/Account/ValidateEmail?token=" + token));
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
                    return CountDown("Your email has already been validated");
                }
            }
            return CountDown("Invalid token");
        }

        public ActionResult CountDown(string message, int countdown = 0)
        {
            ViewData["message"] = message;
            ViewData["count"] = countdown;
            return View("CountDown");
        }


        [AllowAnonymous]
        [HttpGet]
        public ActionResult ResetPassword(string token)
        {
            var model = new ResetForm { Token = token };
            return View(model);
        }

        [AllowAnonymous]
        [HttpPost]
        public ActionResult ResetPassword(ResetForm form)
        {
            if (!ModelState.IsValid)
            {
                return View(form);
            }
            MemoryCache cache = MemoryCache.Default;
            if (cache.Contains(form.Token))
            {
                var email = cache.Get(form.Token).ToString();
                User u = GlobalData.dbContext.Users.SingleOrDefault(m => m.Email == email);
                if (u != null)
                {
                    u.Password = StringHelper.CalcPassword(form.NewPassword, u.Salt);
                    cache.Remove(form.Token);
                    GlobalData.dbContext.SaveChanges();
                    return CountDown("Your password has already been updated, please <a href=\"/Account/Login\">Login</a>!");
                }
            }
            ModelState.AddModelError("", "Your token is invalid.");
            return View();
        }


        private const string ResetEmailBody = @"Please follow this link to set your new password: <a href=""{0}"">{0}</a><br>This link will expire in 30 minutes.";
        [AllowAnonymous]
        [HttpPost]
        [RecaptchaControlMvc.CaptchaValidator]
        public ActionResult Reset(string email, bool captchaValid, string captchaErrorMessage)
        {
            User u = GlobalData.dbContext.Users.SingleOrDefault(m => m.Email == email);
            ViewData["email"] = email;
            if (!captchaValid)
            {
                ViewData["error"] = captchaErrorMessage;
                return View();
            }
            if (u == null)
            {
                ViewData["error"] += "Email is not valid.<br/>";
                return View();
            }
            try
            {
                MemoryCache cache = MemoryCache.Default;
                var token = Guid.NewGuid().ToString("N");
                cache.Add(token, email, DateTimeOffset.Now.AddMinutes(30));
                GlobalData.SendMail(email, "Reset your password", String.Format(ResetEmailBody, "http://" + ConfigurationManager.AppSettings["host"] + "/Account/ResetPassword?token=" + token));
                return CountDown("An email has been sent to : " + email + ", you have 30 minutes to check it out.");
            }
            catch (Exception ex)
            {
                ViewData["error"] += "An Error occured while sending to your email";
                return View();
            }
        }

        [AllowAnonymous]
        [HttpGet]
        public ActionResult Reset()
        {
            ViewData["email"] = "";
            return View();
        }

        [AllowAnonymous]
        [HttpGet]
        public async Task<ActionResult> ADLogin()
        {
            if (System.Web.HttpContext.Current.User.Identity.IsAuthenticated)
            {
                return RedirectToAction("Index", "Home");
            }
            return Content("");

            /*
            var client = new LiveConnect();
            IAuthorizationState state;
            if (Session["LiveToken"] != null)
            {
                state = (IAuthorizationState)Session["LiveToken"];
            }
            else
            {
                state = await client.ProcessUserAuthorizationAsync(Request);
            }
            if (state == null)
            {
                var request = await client.PrepareRequestUserAuthorizationAsync(
                    scopes: new[] { LiveConnect.Scopes.Basic, LiveConnect.Scopes.Emails, LiveConnect.Scopes.SignIn });
                await request.SendAsync(new HttpContextWrapper(System.Web.HttpContext.Current));
                Response.End();
            }
            */
        }
    }
}
