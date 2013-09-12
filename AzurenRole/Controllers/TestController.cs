using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Mvc;

namespace AzurenRole.Controllers
{
    public class TestController : Controller
    {
        //
        // GET: /Test/
        private string server = "http://azuren.chinacloudapp.cn";

        public ActionResult Index()
        {
            return View();
        }

        public ActionResult Callback(string code)
        {
            using (var httpClient = new HttpClient())
            {
                var postData = new List<KeyValuePair<string, string>>();
                postData.Add(new KeyValuePair<string, string>("client_id", "1"));
                postData.Add(new KeyValuePair<string, string>("client_secret", "12345"));
                postData.Add(new KeyValuePair<string, string>("grant_type", "authorization_code"));
                postData.Add(new KeyValuePair<string, string>("code", code));
                postData.Add(new KeyValuePair<string, string>("redirect_uri", server + "/Test/Callback"));
                ServicePointManager.ServerCertificateValidationCallback = (sender, certificate, chain, errors) =>
                {
                    return true;
                };
                var response = httpClient.PostAsync(server + "/OAuth2/Token", new FormUrlEncodedContent(postData));
                if (response.Result.IsSuccessStatusCode)
                {
                    string content = response.Result.Content.ReadAsStringAsync().Result;
                    var data = System.Web.Helpers.Json.Decode(content);
                    Response.Cookies.Add(new HttpCookie("access_token", data.access_token));
                    return View();
                }
            }
            return Content("Error!!");
        }

        public ActionResult GetEmail()
        {
            HttpCookie cookie = Request.Cookies["access_token"];
            if (cookie == null)
            {
                return RedirectToAction("Index");
            }
            string token = cookie.Value;
            using (var httpClient = new HttpClient())
            {
                var postData2 = new List<KeyValuePair<string, string>>();
                postData2.Add(new KeyValuePair<string, string>("client_id", "1"));
                postData2.Add(new KeyValuePair<string, string>("access_token", token));
                var response = httpClient.PostAsync(server + "/api/Service2/Email",
                    new FormUrlEncodedContent(postData2));
                if (response.Result.IsSuccessStatusCode)
                {
                    var content = response.Result.Content.ReadAsStringAsync().Result;
                    return Content(content);
                }
                else
                {
                    return Content("Failed");
                }
            }
        }

    }
}
