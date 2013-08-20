using System;
using System.Globalization;
using System.Linq;
using System.Threading;
using AzurenRole.Helpers;
using AzurenRole.SDK;
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
                RowKey = string.Format("{0:D19}",task.Due.Ticks)
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

        public static void StartHandle()
        {
            var timeInterval = new TimeSpan(0, 1, 0);
            var client = new AzurenClient("1", "111111");
            var entities = new AzurenEntities();

            var thread = new Thread(()=>
            {
                while (true)
                {
                    var upper = string.Format("{0:D19}", DateTime.UtcNow.Ticks + new TimeSpan(0, 5, 30).Ticks);
                    var lowwer = string.Format("{0:D19}", DateTime.UtcNow.Ticks + new TimeSpan(0, 4, 30).Ticks);
                    var query = new TableQuery().Where(
                        TableQuery.CombineFilters(
                            TableQuery.GenerateFilterCondition("RowKey", QueryComparisons.LessThan, upper),
                            TableOperators.And,
                            TableQuery.GenerateFilterCondition("RowKey", QueryComparisons.GreaterThan, lowwer)
                            )
                        );
                    var result = TodoTaskTable.ExecuteQuery(query);
                    if (result.Any())
                    {
                        foreach (var entity in result)
                        {
                            int id = int.Parse(entity.PartitionKey);
                            ToDoTask task = entities.ToDoTasks.SingleOrDefault(m => m.Id == id);
                            if (task != null)
                            {
                                client.SendMessage(task.ToDoProject.UserName, new { content=String.Format("Task #{0} will overdue in 5 minutes.", task.Id)});
                            }
                            TodoTaskTable.Execute(TableOperation.Delete(entity));
                        }
                    }
                    Thread.Sleep(timeInterval);
                }
            });
            thread.Start();
        }

    }
}