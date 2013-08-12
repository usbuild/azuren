using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using AzurenRole.APIService;
using Microsoft.WindowsAzure.Storage;
using System.Configuration;
using Microsoft.WindowsAzure.Diagnostics.Management;
using Microsoft.WindowsAzure.Storage.Table;
using System.Text;
using System.Collections;

namespace AzurenRole.APIRouters
{
    public class TableRouter : APIRouter
    {
        public override string Symbol()
        {
            return "table";
        }
        public override string Route(string[] args)
        {
            string usage = Error("Usage: /table [list | show] [tableName]");
            if (args.Length < 2) return usage;
            CloudStorageAccount storageAccount = CloudStorageAccount.Parse(ConfigurationManager.ConnectionStrings["StorageConnectionString"].ConnectionString);
            CloudTableClient tableClient = storageAccount.CreateCloudTableClient();
            StringBuilder sb = new StringBuilder();
            if (args[1].Equals("list"))
            {
                var a = tableClient.ListTables();
                sb.Append("<table class=\"table table-bordered table-striped table-hover\"><tr><th>Name</th></tr>");
                foreach (CloudTable t in a)
                {
                    sb.Append("<tr><td>");
                    sb.Append(t.Name);
                    sb.Append("</td></tr>");
                }
                sb.Append("</table>");
                return sb.ToString();
            }
            else if (args[1].Equals("show") && args.Length == 3)
            {
                CloudTable table = tableClient.GetTableReference(args[2]);
                if (!table.Exists())
                {
                    return Error("Table " + args[2] + " Not Exists");
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
                            res.Append("<table class=\"table table-bordered table-striped table-hover\"><tr><th>PartitionKey</th><th>RowKey</th><th>TimeStamp</th>");
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
                                    case EdmType.Binary: res.Append(x.BinaryValue); break;
                                    case EdmType.Boolean: res.Append(x.BooleanValue); break;
                                    case EdmType.DateTime: res.Append(x.DateTimeOffsetValue); break;
                                    case EdmType.Double: res.Append(x.DoubleValue); break;
                                    case EdmType.Guid: res.Append(x.GuidValue); break;
                                    case EdmType.Int32: res.Append(x.Int32Value); break;
                                    case EdmType.Int64: res.Append(x.Int64Value); break;
                                    case EdmType.String: res.Append(x.StringValue); break;
                                }
                                res.Append("</td>");
                            }
                            res.Append("</tr>");
                        }
                    }
                    if (!used) res.Append("</table>");
                    else res.Append(Error("Empty table"));

                    return res.ToString();
                }
            }
            return usage;
        }
    }
}