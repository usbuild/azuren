using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;
using System.Text;
using AzurenRole.APIService;
using Microsoft.ServiceBus;
using Microsoft.ServiceBus.Messaging;

namespace AzurenRole.APIRouters
{
    public class ServiceBusRouter : APIRouter
    {
        public override string Symbol()
        {
            return "sb";
        }

        public override string Route(string[] args)
        {
            string usage = Error("Usage: /sb [queue | topic] [delete | list | create | send | get] [name] ...");

            if (args.Length < 3)
            {
                return usage;
            }
            else
            {
                string connectionString = ConfigurationManager.ConnectionStrings["ServiceBus.ConnectionString"].ConnectionString;
                var nsManager = NamespaceManager.CreateFromConnectionString(connectionString);
                StringBuilder sb = new StringBuilder();

                if (args[1].Equals("topic"))
                {

                    string subName = "_receive_all";
                    if (args[2].Equals("list"))
                    {
                        IEnumerable<TopicDescription> queues = nsManager.GetTopics();
                        sb.Clear();
                        sb.Append("<table class=\"table table-bordered table-striped table-hover\"><tr><th>Topics</th><th>Count</th></tr>");
                        foreach (TopicDescription qd in (queues))
                        {
                            if(!nsManager.SubscriptionExists(qd.Path, subName)) nsManager.CreateSubscription(qd.Path, subName);
                            long messageCount = nsManager.GetSubscription(qd.Path, subName).MessageCount;

                            sb.Append("<tr><td>");
                            sb.Append(qd.Path);
                            sb.Append("</td><td>");
                            sb.Append(messageCount);
                            sb.Append("</td></tr>");
                        }
                        sb.Append("</table>");
                        return sb.ToString();
                    }
                    else if (args.Length > 3)
                    {
                        if (args[2].Equals("create"))
                        {
                            if (nsManager.TopicExists(args[3]))
                            {
                                return Error("Topic already exists");
                            }
                            else
                            {
                                nsManager.CreateTopic(args[3]);
                                return Success("Topic " + args[3] + " created successfully");
                            }
                        }
                        else if (args[2].Equals("delete"))
                        {
                            if (!nsManager.TopicExists(args[3]))
                            {
                                return Error("Topic doesn't exists");
                            }
                            else
                            {
                                nsManager.DeleteTopic(args[3]);
                                return Success("Topic " + args[3] + " deleted successfully");
                            }
                        }
                        else if (args[2].Equals("send"))
                        {
                            if (args.Length > 4)
                            {
                                if (!nsManager.TopicExists(args[3]))
                                {
                                    return Error("Topic " + args[3] + "doesn't exist");
                                }
                                else
                                {
                                    TopicClient client = TopicClient.CreateFromConnectionString(connectionString, args[3]);
                                    client.Send(new BrokeredMessage(String.Join(" ", args.Skip(4))));
                                    return Success("Message Already Send");
                                }
                            }
                        }
                        else if (args[2].Equals("get"))
                        {
                            if (!nsManager.TopicExists(args[3]))
                            {
                                return Error("Topic " + args[3] + "doesn't exist");
                            }
                            
                            else
                            {
                                if(!nsManager.SubscriptionExists(args[3], subName)) nsManager.CreateSubscription(args[3], subName);
                                long messageCount = nsManager.GetSubscription(args[3], subName).MessageCount;
                                if (messageCount == 0)
                                {
                                    return Error("Topic " + args[3] + " is empty");
                                }
                                SubscriptionClient client = SubscriptionClient.CreateFromConnectionString(connectionString, args[3],subName,  ReceiveMode.ReceiveAndDelete);
                                BrokeredMessage message = client.Receive(new TimeSpan(0, 0, 5));
                                string msg = message.GetBody<string>();
                                return msg;
                            }

                        }
                    }
                }
                else if (args[1].Equals("queue"))
                {
                    if (args[2].Equals("list"))
                    {
                        IEnumerable<QueueDescription> queues = nsManager.GetQueues();
                        sb.Clear();
                        sb.Append("<table class=\"table table-bordered table-striped table-hover\"><tr><th>Queues</th><th>Count</th></tr>");
                        foreach (QueueDescription qd in (queues))
                        {
                            sb.Append("<tr><td>");
                            sb.Append(qd.Path);
                            sb.Append("</td><td>");
                            sb.Append(qd.MessageCount);
                            sb.Append("</td></tr>");
                        }
                        sb.Append("</table>");
                        return sb.ToString();
                    }
                    else if (args.Length > 3)
                    {
                        if (args[2].Equals("create"))
                        {
                            if (nsManager.QueueExists(args[3]))
                            {
                                return Error("Queue already exists");
                            }
                            else
                            {
                                nsManager.CreateQueue(args[3]);
                                return Success("Queue " + args[3] + " created successfully");
                            }
                        }
                        else if (args[2].Equals("delete"))
                        {
                            if (!nsManager.QueueExists(args[3]))
                            {
                                return Error("Queue doesn't exist");
                            }
                            else
                            {
                                nsManager.DeleteQueue(args[3]);
                                return Success("Queue " + args[3] + " deleted successfully");
                            }
                        }
                        else if (args[2].Equals("send"))
                        {
                            if (args.Length > 4)
                            {
                                if (!nsManager.QueueExists(args[3]))
                                {
                                    return Error("Queue " + args[3] + "doesn't exist");
                                }
                                else
                                {
                                    QueueClient client = QueueClient.CreateFromConnectionString(connectionString, args[3]);
                                    client.Send(new BrokeredMessage(String.Join(" ", args.Skip(4))));
                                    return Success("Message Already Send");
                                }
                            }
                        }
                        else if (args[2].Equals("get"))
                        {
                            if (!nsManager.QueueExists(args[3]))
                            {
                                return Error("Queue " + args[3] + "doesn't exist");
                            }
                            else if (nsManager.GetQueue(args[3]).MessageCount == 0)
                            {
                                return Error("Queue " + args[3] + " is empty");
                            }
                            else
                            {
                                QueueClient client = QueueClient.CreateFromConnectionString(connectionString, args[3], ReceiveMode.ReceiveAndDelete);
                                BrokeredMessage message = client.Receive();
                                return message.GetBody<string>();
                            }

                        }
                    }
                }
            }
            return usage;
        }
    }
}