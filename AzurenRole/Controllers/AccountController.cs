using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Configuration;
using AzurenRole.Models;
using System.Data;
using System.Data.Objects;
using WebMatrix.WebData;
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
        public ActionResult Login(Models.LoginForm form, string ReturnUrl="/")
        {
            if (System.Web.HttpContext.Current.User.Identity.IsAuthenticated)
            {
                return RedirectToAction("Index", "Home");
            }

            if (!ModelState.IsValid)
            {
                return PartialView(form);
            }
            AzurenEntities context = new AzurenEntities();
            ObjectQuery<User> query = context.Users.Where("it.username = @username", new ObjectParameter("username", form.UserName)).Where("it.password = @password", new ObjectParameter("password", form.Password));
            if (query.LongCount() == 0)
            {
                ModelState.AddModelError("", "User Name or password is not correct");
                return PartialView(form);
            }
            FormsAuthentication.SetAuthCookie(form.UserName, true);
            
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

            AzurenEntities context = new AzurenEntities();

            ObjectQuery<User> query = context.Users.Where("it.username = @username", new ObjectParameter("username", form.UserName));
            if (query.LongCount() != 0)
            {
                ModelState.AddModelError("UserName", "The user name has already taken");
                return PartialView(form);
            }

            User user = new User{username=form.UserName, password=form.Password, displayname=form.DisplayName};
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
            if (form.DisplayName != null)
            {
                if(ModelState.IsValidField(form.DisplayName)){
                    user.displayname = form.DisplayName;
                }
            }


            if(form.NewPassword != null) {
                    if(form.OldPassword == null || form.OldPassword != user.password) {
                        ModelState.AddModelError("OldPassword", "Old password is not correct.");
                    }
                if(ModelState.IsValidField(form.NewPassword)) {
                    user.password = form.NewPassword;
                }
            }
                (new DataCache("default")).Put(user.username, user);
                AzurenEntities context = new AzurenEntities();
                User ent = context.Users.Where(_ => _.id == user.id).Single();
                ent.displayname = user.displayname;
                ent.password = user.password;
                context.SaveChanges();
            return View(form);
        }
    }
}
