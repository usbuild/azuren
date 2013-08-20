using System;
using System.Collections;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Threading;
using System.Web;
using System.Web.Helpers;
using System.Web.UI;
using AzurenRole;
using AzurenRole.Helpers;
using AzurenRole.Utils;
using Microsoft.AspNet.SignalR;
using Microsoft.ServiceBus.Messaging;
using SinalRChat;

namespace SignalR
{
    public class AzurenHub : Hub
    {
        private static readonly ConcurrentDictionary<string, User> Users = new ConcurrentDictionary<string, User>();

        public AzurenHub()
            : base()
        {
            new Thread(new ThreadStart(() =>
            {
                QueueClient client = AzureServiceHelper.GetQueueClient("message");
                while (true)
                {
                    BrokeredMessage message = client.Receive();
                    if (message != null)
                    {
                        try
                        {
                            foreach (var connIds in message.Properties["ConnectionIds"].ToString().Split(','))
                            {
                                Clients.Client(connIds).HandleMessage(message.Properties["Type"], Json.Decode(message.Properties["Content"].ToString()));
                            }
                        }
                        catch (Exception ex)
                        {
                        }
                    }
                }
            })).Start();
        }
        public override System.Threading.Tasks.Task OnConnected()
        {
            lock (Users)
            {
                Users.GetOrAdd(Context.ConnectionId, _ => GlobalData.getUser(Context));
            }
            return base.OnConnected();
        }
        public override System.Threading.Tasks.Task OnReconnected()
        {
            User u;
            Users.TryGetValue(Context.ConnectionId, out u);

            User c = GlobalData.getUser(Context);
            if (u == null) Users.TryAdd(Context.ConnectionId, c);
            else if (u.id != c.id) Users.TryUpdate(Context.ConnectionId, c, u);
            return base.OnReconnected();
        }

        public override System.Threading.Tasks.Task OnDisconnected()
        {
            lock (Users)
            {
                User user;
                Users.TryRemove(Context.ConnectionId, out user);
            }
            return base.OnDisconnected();
        }

        public static bool SendMessage(User user, string type, object message)
        {
            var conns = from u in Users
                        where u.Value.id == user.id
                        select u.Key;
            QueueClient client = AzureServiceHelper.GetQueueClient("message");
            var bMessage = new BrokeredMessage();
            bMessage.Properties["ConnectionIds"] = String.Join(",", conns.ToArray());
            bMessage.Properties["Type"] = type;
            bMessage.Properties["Content"] = Json.Encode(message);
            client.Send(bMessage);
            return true;
        }

    }
}