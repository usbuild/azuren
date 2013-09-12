using System;
using System.Collections.Generic;
using System.Data.Services.Common;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using AzurenRole.Helpers;
using Microsoft.WindowsAzure.Storage.Blob;
using Microsoft.WindowsAzure.Storage.Table;

namespace AzurenRole.Utils
{
    [DataServiceKey("PartitionKey", "RowKey")]
    public class FileEntity : TableEntity
    {
        public const int Directory = 0;
        public const int RegularFile = 1;
        public string Path { set; get; }
        public string Key { set; get; }
        public string Parent { set; get; }
        public int Type { set; get; }    //Folder or file
        public long Length { set; get; }  //File Length
        public string ContentType { set; get; } //Content-Type
        public DateTime LastModified { set; get; } //Last Modified Type
    }

    public class FileManager
    {
        private string _username;

        public FileManager(string username)
        {
            _username = username;
        }

        public BlobFile2 GetBlobFile(string path)
        {
            return new BlobFile2(_username, path);
        }
    }

    public class FileExistsException : Exception
    {
        public FileExistsException(string msg)
            : base(msg)
        {
        }
    }

    public class BlobFile2
    {
        private static Random _rnd = new Random();
        private static readonly CloudTable FileTable = AzureServiceHelper.GetTable("files");
        private FileEntity _entity = null;
        private CloudBlobContainer _container = null;
        private CloudBlockBlob _blob = null;
        private BlobProperties _properties = null;
        private FilePath _path;
        private string _username;


        private void ValidFileExist()
        {
            if (!Exists()) throw new FileNotFoundException("Path \"" + _path.Path() + "\" not found");
        }

        private void ValidateFileNotExist()
        {
            if (Exists()) throw new FileExistsException("Path \"" + _path.Path() + "\" already exists");
        }

        private void ValidateFile()
        {
            ValidFileExist();
            if (IsDirectory()) throw new InvalidOperationException("Path \"" + _path.Path() + "\" is directory.");
        }

        private void ValidateDirectory()
        {
            ValidFileExist();
            if (!IsDirectory()) throw new InvalidOperationException("Path \"" + _path.Path() + "\" is not directory.");
        }

        public BlobFile2(string username, string path)
        {
            _username = username;
            _path = new FilePath(path);
            var query =
                new TableQuery<FileEntity>().Where(
                    TableQuery.CombineFilters(
                        TableQuery.GenerateFilterCondition("PartitionKey", QueryComparisons.Equal, _username),
                        TableOperators.And, TableQuery.GenerateFilterCondition("Path", QueryComparisons.Equal, _path.Path())));
            try
            {
                _entity = FileTable.ExecuteQuery(query).FirstOrDefault();
            }
            catch (Exception ex)
            {
                _entity = null;
            }
            if (_entity == null && _path.IsRoot()) CreateDirectory();
            _container = AzureServiceHelper.GetUserContainer(username);
        }

        public BlobFile2(FileEntity entity)
        {
            _username = entity.PartitionKey;
            _path = new FilePath(entity.Path);
            _entity = entity;
            _container = AzureServiceHelper.GetUserContainer(_username);
        }

        public string ContentType()
        {
            ValidFileExist();
            return _entity.ContentType;
        }

        public void CreateEmptyFile()
        {
            ValidateFileNotExist();
            _entity = new FileEntity
            {
                PartitionKey = _username,
                RowKey = DateTime.UtcNow.Ticks.ToString("D") + _rnd.Next(1000, 9999).ToString("D"),
                Path = _path.Path(),
                Key = Guid.NewGuid().ToString("N"),
                Length = 0,
                Type = FileEntity.RegularFile,
                LastModified = DateTime.UtcNow,
                ContentType = MimeMapping.GetMimeMapping(_path.Name()),
                Parent = _path.BasePath()
            };

            GetBlob();
            _blob.UploadFromStream(new MemoryStream());
            Properties();
            FileTable.Execute(TableOperation.Insert(_entity));
        }

        public void CreateFile(Stream stream) //
        {
            ValidateFileNotExist();
            _entity = new FileEntity
            {
                PartitionKey = _username,
                RowKey = DateTime.UtcNow.Ticks.ToString("D") + _rnd.Next(1000, 9999).ToString("D"),
                Path = _path.Path(),
                Key = Guid.NewGuid().ToString("N"),
                Length = 0,
                Type = FileEntity.RegularFile,
                LastModified = DateTime.UtcNow,
                ContentType = MimeMapping.GetMimeMapping(_path.Name()),
                Parent = _path.BasePath()
            };

            GetBlob();
            _blob.UploadFromStream(stream);
            Properties();
            _entity.Length = _blob.Properties.Length;
            FileTable.Execute(TableOperation.Insert(_entity));
        }

        public void CreateDirectory()
        {
            ValidateFileNotExist();
            _entity = new FileEntity
            {
                PartitionKey = _username,
                RowKey = DateTime.UtcNow.Ticks.ToString("D") + _rnd.Next(1000, 9999).ToString("D"),
                Path = _path.Path(),
                Key = Guid.NewGuid().ToString("N"),
                Length = 0,
                Type = FileEntity.Directory,
                LastModified = DateTime.UtcNow,
                ContentType = MimeMapping.GetMimeMapping(_path.Name()),
                Parent = _path.BasePath()
            };
            FileTable.Execute(TableOperation.Insert(_entity));
        }

        private TableQuery<FileEntity> PrefixQuery()
        {
            return new TableQuery<FileEntity>().Where(
                TableQuery.CombineFilters(TableQuery.GenerateFilterCondition("PartitionKey", QueryComparisons.Equal, _username), TableOperators.And,
                TableQuery.CombineFilters(TableQuery.GenerateFilterCondition("Path", QueryComparisons.GreaterThan, _path.Path() + "/"), TableOperators.And,
                    TableQuery.GenerateFilterCondition("Path", QueryComparisons.LessThanOrEqual, _path.Path() + "/" + (char)255))));
        }

        public IEnumerable<BlobFile2> ListFiles()
        {
            ValidateDirectory();

            var query = new TableQuery<FileEntity>().Where(
                TableQuery.CombineFilters(TableQuery.GenerateFilterCondition("PartitionKey", QueryComparisons.Equal, _username),
                TableOperators.And,
                TableQuery.CombineFilters(TableQuery.GenerateFilterCondition("Parent", QueryComparisons.Equal, _path.Path()), TableOperators.And,
                    TableQuery.GenerateFilterCondition("Path", QueryComparisons.NotEqual, _path.Path()))
             ));
            return FileTable.ExecuteQuery(query).Select(m => new BlobFile2(m));
        }

        public int Delete()
        {
            ValidFileExist();
            var operations = new TableBatchOperation();
            if (IsDirectory())
            {
                foreach (var i in FileTable.ExecuteQuery(PrefixQuery()))
                {
                    if (i.Type != FileEntity.Directory) new BlobFile2(i).GetBlob().Delete();
                    operations.Add(TableOperation.Delete(i));
                }
            }
            else
            {
                GetBlob().Delete();
            }
            operations.Add(TableOperation.Delete(_entity));
            FileTable.ExecuteBatch(operations);
            return operations.Count;
        }

        public int Move(string p)
        {
            if (_path.Contains(p)) throw new Exception("You can't move a directory into itself");
            var target = new BlobFile2(_username, p);
            if (target.Exists())
            {
                if (target.IsDirectory())
                {
                    p += "/" + Path().Name();
                }
                else
                {
                    target.ValidateFileNotExist();
                }
            }
            new BlobFile2(_username, p).ValidateFileNotExist();

            var operations = new TableBatchOperation();
            var path = new FilePath(p);
            if (IsDirectory())
            {
                foreach (FileEntity i in FileTable.ExecuteQuery(PrefixQuery()))
                {
                    i.Path = i.Path.Replace(_path.Path(), path.Path());
                    i.Parent = i.Parent.Replace(_path.Path(), path.Path());
                    operations.Add(TableOperation.Replace(i));
                }
            }
            _entity.Path = path.Path();
            _entity.Parent = path.BasePath();
            operations.Add(TableOperation.Replace(_entity));
            this._path = path;
            FileTable.ExecuteBatch(operations);
            return operations.Count;
        }

        public int Copy(string p)
        {
            if (_path.Contains(p)) throw new Exception("You can't copy a directory into itself");
            var target = new BlobFile2(_username, p);
            if (target.Exists())
            {
                if (target.IsDirectory())
                {
                    p += "/" + Path().Name();
                }
                else
                {
                    target.ValidateFileNotExist();
                }
            }

            new BlobFile2(_username, p).ValidateFileNotExist();

            var operations = new TableBatchOperation();
            var path = new FilePath(p);
            if (IsDirectory())
            {
                foreach (FileEntity i in FileTable.ExecuteQuery(PrefixQuery()))
                {
                    var n = new FileEntity()
                    {
                        ContentType = i.ContentType,
                        Key = Guid.NewGuid().ToString("N"),
                        LastModified = DateTime.UtcNow,
                        Length = i.Length,
                        Path = i.Path.Replace(_path.Path(), path.Path()),
                        PartitionKey = i.PartitionKey,
                        Parent = i.Parent.Replace(_path.Path(), path.Path()),
                        RowKey = DateTime.UtcNow.Ticks.ToString("D") + _rnd.Next(1000, 9999).ToString("D"),
                        Type = i.Type
                    };
                    operations.Add(TableOperation.Insert(n));
                    if (i.Type != FileEntity.Directory)
                        _container.GetBlockBlobReference(n.Key)
                            .StartCopyFromBlob(_container.GetBlockBlobReference(i.Key));
                }
            }

            var m = new FileEntity()
            {
                ContentType = _entity.ContentType,
                Key = Guid.NewGuid().ToString("D"),
                LastModified = DateTime.UtcNow,
                Length = _entity.Length,
                Path = path.Path(),
                PartitionKey = _entity.PartitionKey,
                Parent = path.BasePath(),
                RowKey = DateTime.UtcNow.Ticks.ToString("N") + _rnd.Next(1000, 9999).ToString("D"),
                Type = _entity.Type

            };
            if (!IsDirectory())
            {
                _container.GetBlockBlobReference(m.Key).StartCopyFromBlob(GetBlob());
            }
            operations.Add(TableOperation.Insert(m));
            FileTable.ExecuteBatch(operations);
            return operations.Count;
        }



        public bool IsDirectory()
        {
            ValidFileExist();
            return _entity.Type == FileEntity.Directory;
        }

        public bool Exists()
        {
            return _entity != null;
        }

        public CloudBlockBlob GetBlob()
        {
            ValidateFile();
            return _blob ?? (_blob = _container.GetBlockBlobReference(_entity.Key));
        }

        public long Length()
        {
            ValidFileExist();
            return _entity.Length;
        }

        public DateTime LastModified()
        {
            ValidFileExist();
            return _entity.LastModified;
        }

        public BlobProperties Properties()
        {
            ValidateFile();
            if (_properties == null)
            {
                if (_blob == null) GetBlob();
                _blob.FetchAttributes();
                _properties = _blob.Properties;
            }
            return _properties;

        }

        public FilePath Path()
        {
            return _path;
        }

    }
}