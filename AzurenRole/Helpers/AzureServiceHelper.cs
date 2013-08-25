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
        private static readonly CloudBlobClient BlobClient = Account.CreateCloudBlobClient();
        private static readonly CloudTableClient TableClient = Account.CreateCloudTableClient();
        private static readonly CloudQueueClient QueueClient = Account.CreateCloudQueueClient();

        private static readonly string ServiceBusConnectionString = ConfigurationManager.ConnectionStrings["ServiceBus.ConnectionString"].ConnectionString;
        private static readonly NamespaceManager NsManager = NamespaceManager.CreateFromConnectionString(ServiceBusConnectionString);

        public static CloudStorageAccount GetStorageAccount()
        {
            return Account;
        }

        public static CloudBlobContainer GetBlobContainer(string name)
        {
            CloudBlobContainer container = BlobClient.GetContainerReference(name);
            container.CreateIfNotExists();
            return container;
        }

        public static CloudQueue GetCloudQueue(string name)
        {
            CloudQueue queue = QueueClient.GetQueueReference(name);
            queue.CreateIfNotExists();
            return queue;
        }

        public static CloudTableClient GetTableClient()
        {
            return Account.CreateCloudTableClient();
        }

        public static CloudTable GetTable(string name)
        {
            CloudTable table = TableClient.GetTableReference(name);
            table.CreateIfNotExists();
            return table;
        }

        public static QueueClient GetQueueClient(string path)
        {
            if (!NsManager.QueueExists(path))
            {
                NsManager.CreateQueue(path);
            }
            return Microsoft.ServiceBus.Messaging.QueueClient.CreateFromConnectionString(ServiceBusConnectionString, path, ReceiveMode.ReceiveAndDelete);
        }

        public static CloudBlobContainer GetUserContainer(string username)
        {
            return GetBlobContainer("user" + username);
        }

    }
}