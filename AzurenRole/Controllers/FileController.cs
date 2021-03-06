﻿using System;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Web;
using System.Web.Mvc;
using AzurenRole.Utils;

namespace AzurenRole.Controllers
{
    public class FileController : Controller
    {

        //
        // GET: /File/

        [Authorize]
        public ActionResult Index(string path = "/")
        {
            var file = new BlobFile2(User.Identity.Name, path);
            ViewData["files"] = file.ListFiles();

            var paths = path.Split('/').ToList();

            if (paths[paths.Count() - 1] == "")
            {
                paths.RemoveAt(paths.Count() - 1);
            }
            paths.RemoveAt(0);
            ViewData["paths"] = paths;
            ViewData["path"] = path;
            return View();
        }

        [Authorize]
        public ActionResult Detail(string path)
        {
            return Download(null, path);
        }

        [Authorize]
        public ActionResult Thumb(string path)
        {
            //return new BlobFile(AzureServiceHelper.GetUserContainer(User.Identity.Name), path).ImageThumb(Request, Response);
            return new EmptyResult();
        }

        [Authorize]
        public JsonResult CreateFolder(string path, string name)
        {
            try
            {
                new BlobFile2(User.Identity.Name, path + "/" + name).CreateDirectory();
                return Json(new { code = 0 });
            }
            catch (Exception ex)
            {
                return Json(new { code = 1, data = ex.Message });
            }
        }

        [Authorize]
        public ActionResult Upload(HttpPostedFileBase file, string name, string path)
        {
            try
            {
                new BlobFile2(User.Identity.Name, path + "/" + name).CreateFile(file.InputStream);
                return Json(new { code = 0 });
            }
            catch (Exception ex)
            {
                return Json(new { code = 1, data = ex.Message });
            }
        }
        [Authorize]
        public ActionResult UpdateText(String content, string name, string path)
        {
            try
            {
                var f = new BlobFile2(User.Identity.Name, path + "/" + name);
                var stream = new MemoryStream();
                var writer = new StreamWriter(stream);
                writer.Write(content);
                writer.Flush();
                stream.Position = 0;
                f.GetBlob().UploadFromStream(stream);
                return Json(new { code = 0 });
            }
            catch (Exception ex)
            {
                return Json(new { code = 1, data = ex.Message });
            }
        }

        [Authorize]
        public ActionResult Move(string path1, string path2)
        {
            try
            {
                new BlobFile2(User.Identity.Name, path1).Move(path2);
                return Json(new { code = 0 });
            }
            catch (Exception ex)
            {
                return Json(new { code = 1, data = ex.Message });
            }
        }

        [Authorize]
        public ActionResult Delete(string path)
        {
            try
            {
                new BlobFile2(User.Identity.Name, path).Delete();
                return Json(new { code = 0 });
            }
            catch (Exception ex)
            {
                return Json(new { code = 1, data = ex.Message });
            }
        }

        [Authorize]
        public ActionResult Copy(string path1, string path2)
        {
            try
            {
                new BlobFile2(User.Identity.Name, path1).Copy(path2);
                return Json(new { code = 0 });
            }
            catch (Exception ex)
            {
                return Json(new { code = 1, data = ex.Message });
            }
        }

        [Authorize]
        public ActionResult Download(string name, string path)
        {
            var file = new BlobFile2(User.Identity.Name, path + name);
            if (file.Exists() && !file.IsDirectory())
            {

                if (name != null)
                {
                    Response.StatusCode = 200;
                    Response.ContentType = file.ContentType();
                    Response.AppendHeader("Content-Disposition", "attachment; filename=" + name);
                    file.GetBlob().DownloadToStream(Response.OutputStream);
                }
                else
                {
                    DateTime dt;
                    if (DateTime.TryParse(Request.Headers["If-Modified-Since"], out dt) && (file.LastModified() - DateTime.SpecifyKind(dt.ToUniversalTime(), DateTimeKind.Utc)).TotalSeconds < 1.0)
                    {
                        Response.StatusCode = 304;
                        return new EmptyResult();
                    }
                    Response.Cache.SetCacheability(HttpCacheability.Public);
                    Response.Cache.SetValidUntilExpires(true);
                    Response.Cache.SetMaxAge(TimeSpan.FromSeconds(300));
                    Response.Expires = 300;
                    Response.ContentType = file.Properties().ContentType;
                    file.GetBlob().DownloadToStream(Response.OutputStream);
                }
            }
            else
            {
                Response.StatusCode = 404;
            }
            return new EmptyResult();
        }

        [Authorize]
        public ActionResult FileListByType(string type)
        {
            try
            {
                var file = new BlobFile2(User.Identity.Name, "/");
                var list = file.AllFiles();
                var regex = new Regex("^" + Regex.Escape(type).Replace(@"\*", ".*").Replace(@"\?", ".") + "$",
                    RegexOptions.IgnoreCase);
                var data = list.Where(delegate(BlobFile2 m)
                {
                    return regex.IsMatch(m.ContentType()
                        );
                }).Select(m => m.Path().Path());
                return Json(new { code = 0, data = data }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { code = 1 }, JsonRequestBehavior.AllowGet);
            }
        }
    }
}
