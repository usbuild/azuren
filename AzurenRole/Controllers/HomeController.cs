using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using AzurenRole.Utils;
using Microsoft.WindowsAzure.Storage;
using System.Configuration;
using Microsoft.WindowsAzure.Storage.Table;
using AzurenRole.Models;
using Microsoft.WindowsAzure.Storage.Blob;


namespace AzurenRole.Controllers
{

    [Authorize]
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            ViewBag.User = GlobalData.user;
            return PartialView();
        }

        public ActionResult App()
        {
            var x = GlobalData.user.Apps.Select(m=>new{id=m.Id,name=m.Name, url=m.Url, icon=m.Icon, height=m.Height, width=m.Width});
            return Json(new {code=0, data=x}, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult Upload(HttpPostedFileBase upfile, string pictitle, string filename)
        {
            CloudStorageAccount storageAccount = CloudStorageAccount.Parse(ConfigurationManager.ConnectionStrings["StorageConnectionString"].ConnectionString);
            CloudBlobClient client = storageAccount.CreateCloudBlobClient();
            CloudBlobContainer container = client.GetContainerReference("image");
            container.CreateIfNotExists();

            string key = DateTime.Now.ToString("yyyyMMddHHmmssffff");
            CloudBlockBlob blob = container.GetBlockBlobReference(key);
            blob.Properties.ContentType = upfile.ContentType;
            blob.UploadFromStream(upfile.InputStream);
            ViewData["key"] = key;
            return Content("{'url':'" + Url.Action("Load", "Home", new { @key=key}) + "','title':'" + pictitle + "','original':'" +  filename+ "','state':'SUCCESS'}");
        }

        public ActionResult Load(String key)
        {
            CloudStorageAccount storageAccount = CloudStorageAccount.Parse(ConfigurationManager.ConnectionStrings["StorageConnectionString"].ConnectionString);
            CloudBlobClient client = storageAccount.CreateCloudBlobClient();
            CloudBlobContainer container = client.GetContainerReference("image");
            container.CreateIfNotExists();
            CloudBlockBlob blob = container.GetBlockBlobReference(key);
            if (!blob.Exists())
            {
                Response.StatusCode = 404;
                return new EmptyResult();
            }

            blob.FetchAttributes();
            DateTime dt = DateTime.MinValue;
            if (DateTime.TryParse(Request.Headers["If-Modified-Since"], out dt) && (blob.Properties.LastModified.Value - DateTime.SpecifyKind(dt.ToUniversalTime(), DateTimeKind.Utc)).TotalSeconds < 1.0)
            {
                Response.StatusCode = 304;
                return new EmptyResult();
            }


            Response.Cache.SetCacheability(HttpCacheability.Public);
            Response.Cache.SetValidUntilExpires(true);
            Response.Cache.SetMaxAge(TimeSpan.FromSeconds(300));
            Response.Expires = 300;
            Response.ContentType = blob.Properties.ContentType;
            blob.DownloadToStream(Response.OutputStream);

            return new EmptyResult();
        }
    }
}
