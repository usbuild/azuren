using System;
using System.Linq;
using System.Runtime.Caching;
using System.Web.Mvc;
using AzurenRole.Utils;

namespace AzurenRole.Controllers
{
    class OAuthInfo
    {
        public User user { get; set; }
        public App app { get; set; }
    }

    public class OAuthController : Controller
    {
        //
        // GET: /OAuth/

        public ActionResult Index()
        {
            return Content("");
        }

        [Authorize]
        public ActionResult Check(int appId)
        {
            App app = GlobalData.user.Apps.SingleOrDefault(a => a.Id == appId);
            if (app != null)
            {
                MemoryCache cache = MemoryCache.Default;
                string key = Guid.NewGuid().ToString("N");
                cache.Add(key, new OAuthInfo { user = GlobalData.user, app = app }, DateTimeOffset.Now.AddSeconds(30));//key invalidate after 30s
                return Redirect(app.Callback + "?key=" + key);
            }
            else
            {
                return HttpNotFound();
            }
        }

        public ActionResult getToken(string key, string secret)
        {
            MemoryCache cache = MemoryCache.Default;
            if (cache.Contains(key))
            {
                OAuthInfo info = (OAuthInfo)cache.Get(key);
                if (info.app.Secret == secret)
                {
                    cache.Remove(key);
                    return Json(new {code = 0, data = info.user.username}, JsonRequestBehavior.AllowGet);
                }
            }
            return Json(new {code = 1}, JsonRequestBehavior.AllowGet);
        }

    }
}
