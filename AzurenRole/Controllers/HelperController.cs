using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Web;
using System.Web.Helpers;
using System.Web.Mvc;

namespace AzurenRole.Controllers
{
    public class HelperController : Controller
    {

        public JsonResult HttpGet(string url)
        {
            if (!(url.StartsWith("http://") || url.StartsWith("https://")))
            {
                url = "http://" + url;
            }
            using (var client = new HttpClient())
            {
                var response = client.GetAsync(url);

                try
                {
                    if (response.Result.IsSuccessStatusCode)
                    {
                        string content = response.Result.Content.ReadAsStringAsync().Result;
                        return Json(new {code = response.Result.StatusCode, data = content, headers = Response.Headers},
                            JsonRequestBehavior.AllowGet);
                    }
                    else
                    {
                        return Json(new {code = response.Result.StatusCode},
                            JsonRequestBehavior.AllowGet);
                    }
                }
                catch (Exception ex)
                {
                    return Json(new { code = 500 },
                            JsonRequestBehavior.AllowGet);
                }
            }
        }

    }
}
