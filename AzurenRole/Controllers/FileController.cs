using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using AzurenRole.Helpers;
using Microsoft.WindowsAzure.Storage.Blob;

namespace AzurenRole.Controllers
{
    public class FileController : Controller
    {
        //
        // GET: /File/

        public ActionResult Index()
        {
            return View();
        }
        [HttpPost]
        public ActionResult Upload(HttpPostedFileBase upfile, string pictitle, string filename)
        {
            CloudBlobContainer container = AzureServiceHelper.GetBlobContainer("image");
            string key = DateTime.UtcNow.ToString("yyyyMMddHHmmssffff");
            CloudBlockBlob blob = container.GetBlockBlobReference(key);
            blob.Properties.ContentType = upfile.ContentType;
            blob.UploadFromStream(upfile.InputStream);
            ViewData["key"] = key;
            return Content("{'url':'" + Url.Action("Load", "Home", new { @key=key}) + "','title':'" + pictitle + "','original':'" +  filename+ "','state':'SUCCESS'}");
        }

    }
}
