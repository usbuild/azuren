using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.ServiceModel.Channels;
using System.Web;
using Microsoft.ServiceBus;
using Microsoft.ServiceBus.Messaging;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Blob;
using Microsoft.WindowsAzure.Storage.Queue;
using Microsoft.WindowsAzure.Storage.Table;

namespace AzurenRole.Helpers
{
    public class AzureServiceHelper
    {
        private static CloudStorageAccount _account = CloudStorageAccount.Parse(ConfigurationManager.ConnectionStrings["StorageConnectionString"].ConnectionString);

        private static string _serviceBusConnectionString = ConfigurationManager.ConnectionStrings["ServiceBus.ConnectionString"].ConnectionString;
        private static NamespaceManager _nsManager = NamespaceManager.CreateFromConnectionString(_serviceBusConnectionString);

        public static CloudStorageAccount GetStorageAccount()
        {
            return _account;
        }
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

        public static QueueClient GetQueueClient(string path)
        {
            if (!_nsManager.QueueExists(path))
            {
                _nsManager.CreateQueue(path);
            }
            return QueueClient.CreateFromConnectionString(_serviceBusConnectionString, path, ReceiveMode.ReceiveAndDelete);
        }

        public static CloudBlobContainer GetUserContainer(string username)
        {
            return GetBlobContainer("user_" + username);
        }

    }

   
}