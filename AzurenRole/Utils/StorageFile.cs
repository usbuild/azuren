using System;
using System.Collections;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Net.NetworkInformation;
using System.Web;
using System.Web.Mvc;
using Microsoft.WindowsAzure.Storage.Blob;

namespace AzurenRole.Utils
{
    public class BlobFile
    {
        private readonly string _path;
        private readonly CloudBlobContainer _container;
        private readonly CloudBlockBlob _blob;

        public BlobFile(CloudBlobContainer container, string path)
        {
            this._container = container;
            this._path = path.EndsWith("/") && path != "/" ? path.Substring(0, path.Length - 1) : path;
            this._blob = container.GetBlockBlobReference(_path);
            if (path == "/")
            {
                if (!this.Exists())
                {
                    this.CreateDirecotry();

                }
            }
            if (Exists()) this._blob.FetchAttributes();
        }

        public BlobFile(CloudBlockBlob blob)
        {
            this._blob = blob;
            this._container = blob.Container;
            this._path = blob.Name;
            if (Exists()) this._blob.FetchAttributes();
        }

        public Boolean Exists()
        {
            return _blob.Exists();
        }

        public Boolean IsDirectory()
        {
            if (!_blob.Exists()) return false;
            string type;
            _blob.Metadata.TryGetValue("type", out type);
            if (type == "d")
            {
                return true;
            }
            return false;
        }

        public Boolean Create()
        {
            if (_blob.Exists()) return false;
            _blob.UploadFromStream(new MemoryStream());
            _blob.Properties.ContentType = MimeMapping.GetMimeMapping(Name());
            _blob.Metadata.Add("type", "f");
            _blob.SetMetadata();
            return true;
        }

        public Boolean CreateDirecotry()
        {
            if (_blob.Exists()) return false;
            _blob.UploadFromStream(new MemoryStream());
            _blob.Metadata.Add("type", "d");
            _blob.SetMetadata();
            return true;
        }

        public int Delete()
        {
            var num = 0;
            if (IsDirectory())
            {
                CloudBlobDirectory directory = _container.GetDirectoryReference(_path);
                foreach (var listBlobItem in directory.ListBlobs())
                {
                    if (listBlobItem is CloudBlockBlob)
                    {
                        ((CloudBlockBlob)listBlobItem).Delete();
                        ++num;
                    }
                }
                _blob.Delete();
                ++num;
            }
            else
            {
                _blob.Delete();
                ++num;
            }
            return num;
        }

        public string Name()
        {
            return _blob.Name.Substring(_blob.Name.LastIndexOf('/') + 1);
        }

        public string Path()
        {
            return _blob.Name;
        }

        public BlobProperties Properties()
        {
            return _blob.Properties;
        }

        public IEnumerable<BlobFile> ListFiles()
        {
            if (!this.IsDirectory()) return null;
            var list = new List<BlobFile>();
            CloudBlobDirectory directory = _container.GetDirectoryReference(_path);
            foreach (var listBlobItem in directory.ListBlobs())
            {
                if (listBlobItem is CloudBlockBlob)
                {
                    var blockBlobItem = new BlobFile((CloudBlockBlob)listBlobItem);
                    if (blockBlobItem.Name() == "") continue;
                    list.Add(blockBlobItem);
                }
            }
            return list;
        }

        public Boolean UploadFile(HttpPostedFileBase file)
        {
            _blob.Properties.ContentType = file.ContentType;
            _blob.UploadFromStream(file.InputStream);
            _blob.Metadata.Add("type", "f");
            _blob.SetMetadata();
            return true;
        }

        public ActionResult ImageThumb(HttpRequestBase request, HttpResponseBase response)
        {
            if (Exists() && !IsDirectory())
            {
                DateTime dt;
                if (DateTime.TryParse(request.Headers["If-Modified-Since"], out dt) && (_blob.Properties.LastModified.Value - DateTime.SpecifyKind(dt.ToUniversalTime(), DateTimeKind.Utc)).TotalSeconds < 1.0)
                {
                    response.StatusCode = 304;
                    return new EmptyResult();
                }
                response.Cache.SetCacheability(HttpCacheability.Public);
                response.Cache.SetValidUntilExpires(true);
                response.Cache.SetMaxAge(TimeSpan.FromSeconds(300));
                response.Expires = 300;
                response.ContentType = _blob.Properties.ContentType;

                Stream stream = _blob.OpenRead();
                Image image = Image.FromStream(stream);
                Image thumb = image.GetThumbnailImage(90, 90, () => false, IntPtr.Zero);
                thumb.Save(response.OutputStream, ImageFormat.Jpeg);
            }
            else
            {
                response.StatusCode = 404;
            }
            return new EmptyResult();
        }
        

        public ActionResult DownloadFile(HttpRequestBase request, HttpResponseBase response, string filename = "", bool attach = false)
        {
            if (Exists() && !IsDirectory())
            {
                
                if (attach)
                {
                    response.ContentType = _blob.Properties.ContentType;
                    response.AppendHeader("Content-Disposition", "attachment; filename=" + filename);
                    _blob.DownloadToStream(response.OutputStream);
                }
                else
                {
                    DateTime dt;
                    if (DateTime.TryParse(request.Headers["If-Modified-Since"], out dt) && (_blob.Properties.LastModified.Value - DateTime.SpecifyKind(dt.ToUniversalTime(), DateTimeKind.Utc)).TotalSeconds < 1.0)
                    {
                        response.StatusCode = 304;
                        return new EmptyResult();
                    }
                    response.Cache.SetCacheability(HttpCacheability.Public);
                    response.Cache.SetValidUntilExpires(true);
                    response.Cache.SetMaxAge(TimeSpan.FromSeconds(300));
                    response.Expires = 300;
                    response.ContentType = _blob.Properties.ContentType;
                    _blob.DownloadToStream(response.OutputStream);
                }
            }
            else
            {
                response.StatusCode = 404;
            }
            return new EmptyResult();
        }
    }
}