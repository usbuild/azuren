using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using AzurenRole.Utils;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Table;

namespace AzurenRole.Controllers
{
    class GroupInfo : TableEntity
    {
         public string group { get; set; }
      
    }
    [Authorize]
    public class ChatController : Controller
    {
        public ActionResult Index()
        {
            CloudTable table = GetTable();
            TableQuery<GroupInfo> query =
                new TableQuery<GroupInfo>().Where(TableQuery.CombineFilters(TableQuery.GenerateFilterCondition("PartitionKey",
                    QueryComparisons.Equal, GlobalData.user.id.ToString()), TableOperators.And, TableQuery.GenerateFilterCondition("PartitionKey",
                    QueryComparisons.Equal, GlobalData.user.id.ToString())));
            IEnumerable<GroupInfo> infos = table.ExecuteQuery(query);
            ViewData["roomList"] = infos.Select(_ => _.group);
            return View();
        }

        public ActionResult Chat(string name)
        {
            ViewData["name"] = name;
            return View();
        }

        private CloudTable GetTable()
        {
            CloudStorageAccount storageAccount = CloudStorageAccount.Parse(ConfigurationManager.ConnectionStrings["StorageConnectionString"].ConnectionString);
            CloudTableClient tableClient = storageAccount.CreateCloudTableClient();
            CloudTable table = tableClient.GetTableReference("rooms");
            table.CreateIfNotExists();
            return table;
        }
        public ActionResult AddGroup(string name)
        {
            CloudTable table = GetTable();
            TableQuery<GroupInfo> query =
                new TableQuery<GroupInfo>().Where(TableQuery.CombineFilters(TableQuery.GenerateFilterCondition("PartitionKey",
                    QueryComparisons.Equal, GlobalData.user.id.ToString()), TableOperators.And, TableQuery.GenerateFilterCondition("group",
                    QueryComparisons.Equal, name)));
            if (table.ExecuteQuery(query).Any())
            {
                return Json(new { code = 1 }, JsonRequestBehavior.AllowGet);
            }
            GroupInfo info = new GroupInfo();
            info.PartitionKey = GlobalData.user.id.ToString();
            info.RowKey = string.Format("{0:D19}", DateTime.MaxValue.Ticks - DateTime.UtcNow.Ticks);
            info.group = name;
            TableOperation to = TableOperation.Insert(info);
            table.Execute(to);
            return Json(new { code = 0 }, JsonRequestBehavior.AllowGet);
        }

        public ActionResult RemoveGroup(string name)
        {
            CloudTable table = GetTable();
            TableQuery<GroupInfo> query =
                new TableQuery<GroupInfo>().Where(TableQuery.CombineFilters(TableQuery.GenerateFilterCondition("PartitionKey",
                    QueryComparisons.Equal, GlobalData.user.id.ToString()), TableOperators.And, TableQuery.GenerateFilterCondition("group",
                    QueryComparisons.Equal, name)));

            var res = table.ExecuteQuery(query);
            if (!res.Any())
            {
                return Json(new { code = 1 }, JsonRequestBehavior.AllowGet);
            }
            try
            {
                table.Execute(TableOperation.Delete(res.First()));
            }
            catch (Exception ex)
            {
                return Json(new { code = 1 }, JsonRequestBehavior.AllowGet);
            }
            return Json(new { code = 0 }, JsonRequestBehavior.AllowGet);
        }

    }
}