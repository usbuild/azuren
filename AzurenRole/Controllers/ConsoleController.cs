﻿using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Text;
using System.Web;
using System.Web.Helpers;
using System.Web.Management;
using System.Web.Mvc;
using AzurenRole.Helpers;
using AzurenRole.Utils;
using Microsoft.SqlServer.Server;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Blob;
using Microsoft.WindowsAzure.Storage.Table;

namespace AzurenRole.Controllers
{
    [Authorize]
    public class ConsoleController : Controller
    {
        protected override void HandleUnknownAction(string actionName)
        {
            Json(new { code = 1, data = "Command Not Found" }, JsonRequestBehavior.AllowGet).ExecuteResult(this.ControllerContext);
        }

        private JsonResult InvalidParams()
        {
            return Json(new { code = 2 }, JsonRequestBehavior.AllowGet);
        }

        public JsonResult Error(string input)
        {
            return Json(new { code = 1, data = input },
                JsonRequestBehavior.AllowGet);
        }

        public JsonResult Success(string input)
        {
            return Json(new { code = 0, data = "<div class=\"sys-success-msg\">" + input + "</div>" },
                JsonRequestBehavior.AllowGet);
        }

        public JsonResult SuccessWrapper(string input)
        {
            return Json(new { code = 0, data = input }, JsonRequestBehavior.AllowGet);
        }


        public ActionResult Table(Dictionary<string, string> env, string[] args)
        {
            string usage = "Usage: /table [list | show] [tableName]";
            if (args.Length > 0)
            {
                CloudTableClient tableClient = AzureServiceHelper.GetStorageAccount().CreateCloudTableClient();
                var sb = new StringBuilder();
                if (args[0].Equals("list"))
                {
                    var a = tableClient.ListTables();
                    sb.Append("<table class=\"table table-bordered console-table\"><tr><th>Name</th></tr>");
                    foreach (CloudTable t in a)
                    {
                        sb.Append("<tr><td>");
                        sb.Append(t.Name);
                        sb.Append("</td></tr>");
                    }
                    sb.Append("</table>");
                    return Success(sb.ToString());

                }
                else
                {
                    if (args[0].Equals("show") && args.Length > 1)
                    {
                        CloudTable table = tableClient.GetTableReference(args[1]);
                        if (!table.Exists())
                        {
                            return Error("Table " + args[1] + " Not Exists");
                        }
                        else
                        {
                            var query = new TableQuery();

                            StringBuilder res = new StringBuilder();
                            bool used = true;
                            foreach (DynamicTableEntity o in table.ExecuteQuery(query))
                            {
                                if (used)
                                {
                                    res.Append(
                                        "<table class=\"table table-bordered console-table\"><tr><th>PartitionKey</th><th>RowKey</th><th>TimeStamp</th>");
                                    foreach (string x in o.Properties.Keys)
                                    {
                                        res.Append("<th>");
                                        res.Append(x);
                                        res.Append("</th>");
                                    }
                                    res.Append("</tr>");
                                    used = false;
                                }
                                res.Append("<tr><td>");
                                res.Append(o.PartitionKey);
                                res.Append("</td><td>");
                                res.Append(o.RowKey);
                                res.Append("</td><td>");
                                res.Append(o.Timestamp);
                                res.Append("</td>");
                                foreach (EntityProperty x in o.Properties.Values)
                                {
                                    res.Append("<td>");
                                    switch (x.PropertyType)
                                    {
                                        case EdmType.Binary:
                                            res.Append(x.BinaryValue);
                                            break;
                                        case EdmType.Boolean:
                                            res.Append(x.BooleanValue);
                                            break;
                                        case EdmType.DateTime:
                                            res.Append(x.DateTimeOffsetValue);
                                            break;
                                        case EdmType.Double:
                                            res.Append(x.DoubleValue);
                                            break;
                                        case EdmType.Guid:
                                            res.Append(x.GuidValue);
                                            break;
                                        case EdmType.Int32:
                                            res.Append(x.Int32Value);
                                            break;
                                        case EdmType.Int64:
                                            res.Append(x.Int64Value);
                                            break;
                                        case EdmType.String:
                                            res.Append(x.StringValue);
                                            break;
                                    }
                                    res.Append("</td>");
                                }
                                res.Append("</tr>");
                            }
                            if (!used) res.Append("</table>");
                            else
                                return Error("Empty table");

                            return SuccessWrapper(res.ToString());
                        }
                    }
                    else if (args[0].Equals("delete") && args.Length > 1)
                    {
                        CloudTable table = tableClient.GetTableReference(args[1]);
                        if (!table.Exists())
                        {
                            return Error("Table \"" + args[1] + "\" Not Exists");
                        }
                        table.Delete();
                        return SuccessWrapper("Table " + args[1] + " successfully deleted");
                    }
                }
            }
            return Error(usage);
        }

        [Authorize]
        public ActionResult Ls(Dictionary<string, string> env, string[] args)
        {
            return Dir(env, args);
        }

        [Authorize]
        public ActionResult Touch(Dictionary<string, string> env, string[] args)
        {
            var file = new BlobFile2(User.Identity.Name, env["path"] + args[0]);
            if (!file.Exists())
            {
                file.CreateEmptyFile();
                return SuccessWrapper(String.Format("File \"{0}\" Created", args[0]));
            }
            return SuccessWrapper(String.Format("File \"{0}\" Updated", args[0]));
        }

        [Authorize]
        public JsonResult Cd(Dictionary<string, string> env, string[] args)
        {
            if (args.Length > 0)
            {
                var file = new BlobFile2(User.Identity.Name, env["path"] + args[0]);
                if (file.IsDirectory())
                {
                    return SuccessWrapper(env["path"] + args[0] + "/");
                }
                else
                {
                    return Error("Directory \"" + args[0] + "\" doesn't exist.");
                }
            }
            return Error("Usage: cd [directory]");
        }

        [Authorize]
        public JsonResult Mkdir(Dictionary<string, string> env, string[] args)
        {
            if (args.Length > 0)
            {
                var file = new BlobFile2(User.Identity.Name, env["path"] + args[0]);
                if (file.Exists())
                {
                    return Error("Directory \"" + args[0] + "\" already exists.");
                }
                else
                {
                    file.CreateDirectory();
                    return SuccessWrapper(String.Format("Directory \"{0}\" Created", args[0]));
                }
            }
            return Error("Usage: mkdir [directory]");
        }

        [Authorize]
        public JsonResult Rm(Dictionary<string, string> env, string[] args)
        {
            if (args.Length > 0)
            {
                var file = new BlobFile2(User.Identity.Name, env["path"] + args[0]);
                if (file.Exists())
                {
                    return SuccessWrapper(String.Format("{0} file(s) deleted.", file.Delete()));
                }
                return Error("File Not Exist");
            }
            return Error("Usage: rm [file]");
        }

        [Authorize]
        public JsonResult Mv(Dictionary<string, string> env, string[] args)
        {
            if (args.Length > 1)
            {
                var file = new BlobFile2(User.Identity.Name, env["path"] + args[0]);
                if (file.Exists())
                {
                    try
                    {
                        return SuccessWrapper(String.Format("{0} file(s) moved.", file.Move(env["path"] + args[1])));
                    }
                    catch (FileExistsException ex)
                    {
                        return Error(args[1] + " Already Exists");
                    }
                }
                return Error(args[0] + " Not Exists");
            }
            return Error("Usage: mv [file1] [file2]");
        }

        [Authorize]
        public JsonResult Cp(Dictionary<string, string> env, string[] args)
        {
            if (args.Length > 1)
            {
                var file = new BlobFile2(User.Identity.Name, env["path"] + args[0]);
                if (file.Exists())
                {
                    try
                    {
                        return SuccessWrapper(String.Format("{0} file(s) copied.", file.Copy(env["path"] + args[1])));
                    }
                    catch (FileExistsException ex)
                    {
                        return Error(args[1] + " Already Exists");
                    }
                }
                return Error(args[0] + " Not Exists");
            }
            return Error("Usage: mv [file1] [file2]");
            
        }

        [Authorize]
        public JsonResult Dir(Dictionary<string, string> env, string[] args)
        {
            var blobFile = new BlobFile2(User.Identity.Name, env["path"]);
            var sb = new StringBuilder();
            foreach (var s in blobFile.ListFiles())
            {
                sb.Append(String.Format("{0}\t{1}\t{2}\t{3}\n", s.Path().Name(), s.IsDirectory() ? "D" : "-", s.Length(), s.LastModified()));
            }
            return SuccessWrapper(sb.ToString());
        }

        [HttpPost]
        [Authorize]
        public ActionResult Upload(HttpPostedFileBase file, string path, string[] args)
        {
            if (args.Length > 0)
            {
                var blob = new BlobFile2(User.Identity.Name, path + args[0]);
                if (blob.Exists()) return Error("File \"" + args[0] + "\" already exists.");
                try
                {
                    blob.CreateFile(file.InputStream);
                    return SuccessWrapper("Upload successfully");
                }
                catch (Exception ex)
                {
                    return Error("Upload file failed");
                }
            }
            return Error("Usage: upload [filename]");
        }

        [Authorize]
        public ActionResult Download(Dictionary<string, string> env, string[] args)
        {
            var file = new BlobFile2(User.Identity.Name, env["path"] + args[0]);
            if (file.Exists())
            {
                return SuccessWrapper("");
            }
            else
            {
                return Error("File Not Exist");
            }
        }
    }
}
