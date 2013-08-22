using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using AzurenRole.Helpers;
using AzurenRole.Utils;
using Microsoft.WindowsAzure.Storage.Blob;

namespace AzurenRole.Controllers
{
    public class FileController : Controller
    {
        //
        // GET: /File/

        [Authorize]
        public ActionResult Index(string path = "/")
        {
            var file = new BlobFile(AzureServiceHelper.GetUserContainer(User.Identity.Name), path);
            ViewData["files"] = file.ListFiles();
            var paths = path.Split('/').ToList();
            if (paths[paths.Count() - 1] == "")
            {
                paths.RemoveAt(paths.Count() - 1);
            }
            paths.RemoveAt(0);
            ViewData["paths"] = paths;
            return View();
        }

        [Authorize]
        public ActionResult Detail(string path)
        {
            return new BlobFile(AzureServiceHelper.GetUserContainer(User.Identity.Name), path).DownloadFile(Request, Response);
        }

        [Authorize]
        public ActionResult Thumb(string path)
        {
            return new BlobFile(AzureServiceHelper.GetUserContainer(User.Identity.Name), path).ImageThumb(Request, Response);
        }

        [Authorize]
        public ActionResult Upload(HttpPostedFileBase file, string name, string path)
        {
            CloudBlobContainer container = AzureServiceHelper.GetUserContainer(User.Identity.Name);
            try
            {
                if (!path.EndsWith("/")) path += "/";
                new BlobFile(container, path + name).UploadFile(file);
                return Json(new { code = 0 });
            }
            catch (Exception ex)
            {
                return Json(new { code = 1 });
            }
        }
    }
}
