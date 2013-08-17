using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Blob;
using Microsoft.WindowsAzure.Storage.Queue;
using Microsoft.WindowsAzure.Storage.Table;

namespace AzurenRole.Helpers
{
    public class AzureServiceHelper
    {
        static CloudStorageAccount _account = CloudStorageAccount.Parse(ConfigurationManager.ConnectionStrings["StorageConnectionString"].ConnectionString);

        public static CloudBlobContainer GetBlobContainer(string name)
        {
            CloudBlobContainer container = _account.CreateCloudBlobClient().GetContainerReference(name);
            container.CreateIfNotExists();
            return container;
        }

        public static CloudQueue GetCloudQueue(string name)
        {
            CloudQueue queue = _account.CreateCloudQueueClient().GetQueueReference(name);
            queue.CreateIfNotExists();
            return queue;
        }

        public static CloudTable GetTable(string name)
        {
            CloudTable table = _account.CreateCloudTableClient().GetTableReference(name);
            table.CreateIfNotExists();
            return table;
        }

    }

   
}