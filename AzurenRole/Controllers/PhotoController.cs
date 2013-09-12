using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.Linq;
using System.Text.RegularExpressions;
using System.Web;
using System.Web.Mvc;
using AzurenRole.Utils;

namespace AzurenRole.Controllers
{
    public class PhotoController : Controller
    {

        public ActionResult Thumb(string path)
        {
            var file = new BlobFile2(User.Identity.Name, path);
            if (file.Exists() && !file.IsDirectory())
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
                Response.ContentType = MimeMapping.GetMimeMapping(path);

                Image image = Image.FromStream(file.GetBlob().OpenRead());
                new Bitmap(image, new Size(200, (int)(image.Height*200.0/image.Width))).Save(Response.OutputStream, image.RawFormat);
            }
            else
            {
                Response.StatusCode = 404;
            }
            return new EmptyResult();
        }
        //
        // GET: /Photo/

        public ActionResult Index()
        {
            const string type = "image/*";
            try
            {
                var file = new BlobFile2(User.Identity.Name, "/");
                var list = file.ListFiles();
                var regex = new Regex("^" + Regex.Escape(type).Replace(@"\*", ".*").Replace(@"\?", ".") + "$",
                    RegexOptions.IgnoreCase);
                var data = list.Where(m => regex.IsMatch(m.ContentType())).Select(m => m.Path().Path());
                ViewData["images"] = data;
            }
            catch (Exception ex)
            {
                ViewData["images"] = null;
            }
            return View();
        }

    }
}
