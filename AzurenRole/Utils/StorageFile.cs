using System;
using System.Collections;
using System.Collections.Generic;
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
                    list.Add(new BlobFile((CloudBlockBlob)listBlobItem));
                }
            }
            return list;
        }

        public Boolean UploadFile(HttpPostedFileBase file)
        {
            _blob.Properties.ContentType = file.ContentType;
            _blob.UploadFromStream(file.InputStream);
            return true;
        }

        public ActionResult DonwloadFile(HttpResponseBase response, string filename)
        {
            if (Exists() && !IsDirectory())
            {
                response.ContentType = _blob.Properties.ContentType;
                response.AppendHeader("Content-Disposition", "attachment; filename=" + filename);
                _blob.DownloadToStream(response.OutputStream);
                return new EmptyResult();
            }
            else
            {
                response.StatusCode = 404;
                return new EmptyResult();
            }
            
        }
    }
}