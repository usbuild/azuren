using System;
using System.Collections;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Mvc;
using Microsoft.WindowsAzure.Storage;
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
            return Json(new { code = 1, data = input},
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


        public ActionResult Table(string[] args)
        {
            string usage = "Usage: /table [list | show] [tableName]";
            if (args.Length > 0)
            {
                CloudStorageAccount storageAccount =
                    CloudStorageAccount.Parse(
                        ConfigurationManager.ConnectionStrings["StorageConnectionString"].ConnectionString);
                CloudTableClient tableClient = storageAccount.CreateCloudTableClient();
                StringBuilder sb = new StringBuilder();
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
                            TableQuery query = new TableQuery();

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
                                else
                                {
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
                            }
                            if (!used) res.Append("</table>");
                            else res.Append(Error("Empty table"));

                            return SuccessWrapper(res.ToString());
                        }
                    }
                }
            }
            return Error(usage);
        }
    }
}
