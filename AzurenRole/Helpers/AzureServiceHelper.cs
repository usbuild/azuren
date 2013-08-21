using System.Configuration;
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
        private static readonly CloudStorageAccount Account = CloudStorageAccount.Parse(ConfigurationManager.ConnectionStrings["StorageConnectionString"].ConnectionString);

        private static readonly string ServiceBusConnectionString = ConfigurationManager.ConnectionStrings["ServiceBus.ConnectionString"].ConnectionString;
        private static readonly NamespaceManager NsManager = NamespaceManager.CreateFromConnectionString(ServiceBusConnectionString);

        public static CloudStorageAccount GetStorageAccount()
        {
            return Account;
        }
        public static CloudBlobContainer GetBlobContainer(string name)
        {
            CloudBlobContainer container = Account.CreateCloudBlobClient().GetContainerReference(name);
            container.CreateIfNotExists();
            return container;
        }

        public static CloudQueue GetCloudQueue(string name)
        {
            CloudQueue queue = Account.CreateCloudQueueClient().GetQueueReference(name);
            queue.CreateIfNotExists();
            return queue;
        }

        public static CloudTable GetTable(string name)
        {
            CloudTable table = Account.CreateCloudTableClient().GetTableReference(name);
            table.CreateIfNotExists();
            return table;
        }

        public static QueueClient GetQueueClient(string path)
        {
            if (!NsManager.QueueExists(path))
            {
                NsManager.CreateQueue(path);
            }
            return QueueClient.CreateFromConnectionString(ServiceBusConnectionString, path, ReceiveMode.ReceiveAndDelete);
        }

        public static CloudBlobContainer GetUserContainer(string username)
        {
            return GetBlobContainer("user" + username);
        }

    }
}