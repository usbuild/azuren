﻿using System;
using System.Linq;
using System.Web.Mvc;
using AzurenRole.Utils;
using SignalR;

namespace AzurenRole.Controllers
{
    public class ServiceController : Controller
    {
        private readonly AzurenEntities _entities = GlobalData.dbContext;
        private Tuple<User, App> CheckAccess(int appid, string secret, string username)
        {
            User user = _entities.Users.SingleOrDefault(u => u.username == username);
            if (user != null)
            {
                App app = user.Apps.SingleOrDefault(a => a.Id == appid && a.Secret == secret);
                if (app != null) return new Tuple<User, App>(user, app);
            }
            return null;
        }

        private JsonResult Success(object obj)
        {
            return Json(new { code = 0, data = obj }, JsonRequestBehavior.AllowGet);
        }

        private JsonResult Fail(object obj, int code = 1)
        {
            return Json(new { code = code, data = obj }, JsonRequestBehavior.AllowGet);
        }

        public ActionResult Index()
        {
            return Content("");
        }


        public ActionResult SendMessage(int appId, string secret, string user, string message)
        {
            var result = CheckAccess(appId, secret, user);
            if (result != null)
            {
                AzurenHub.SendMessage(result.Item1, "app_msg", new { appId = result.Item2.Id, data = System.Web.Helpers.Json.Decode(message) });
                return Success("Reuqest Success");
            }
            return Fail("Request Failed");
        }



    }
}