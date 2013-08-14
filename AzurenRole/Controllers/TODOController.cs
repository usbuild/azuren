using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Web;
using System.Web.Mvc;
using System.Web.Security;

namespace AzurenRole.Controllers
{
    public class TODOController : Controller
    {
        private static string OAuthServer = "http://127.0.0.1:81/OAuth";
        public ActionResult Index()
        {
            if (!User.Identity.IsAuthenticated) return Redirect(OAuthServer + "/Check?appid=1");
            return View();
        }

        public ActionResult Callback(string key)
        {
            using (HttpClient client = new HttpClient())
            {
                var response = client.GetAsync(OAuthServer + "/getToken?secret=111111&key=" + key);
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
