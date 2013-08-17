using System;
using System.Globalization;
using System.Linq;
using System.Web.Services.Description;
using AzurenRole.Helpers;
using Microsoft.WindowsAzure.Storage.Table;

namespace AzurenRole.App_Start
{
    public class ToDoTaskQueue
    {
        private static readonly CloudTable TodoTaskTable = AzureServiceHelper.GetTable("ToDoTask");

        public static void AddToQueue(ToDoTask task)
        {
            var taskEntity = new TableEntity()
            {
                PartitionKey = task.Id.ToString(CultureInfo.InvariantCulture),
                RowKey = string.Format("{0:D19}", DateTime.MaxValue.Ticks - task.Due.UtcTicks)
            };
            TodoTaskTable.Execute(TableOperation.Insert(taskEntity));
        }

        public static void UpdateQueue(ToDoTask task)
        {
            DeleteQueue(task);
            AddToQueue(task);
        }

        public static void DeleteQueue(ToDoTask task)
        {
            var query = new TableQuery<TableEntity>().Where(TableQuery.GenerateFilterCondition("PartitionKey", QueryComparisons.Equal, task.Id.ToString(CultureInfo.InvariantCulture)));
            var res = TodoTaskTable.ExecuteQuery(query);
            if (res.Any())
            {
                TodoTaskTable.Execute(TableOperation.Delete(res.First()));    
            }
            
        }

    }
}