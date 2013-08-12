using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Web;
using Microsoft.AspNet.SignalR;
using DotNetOpenAuth.AspNet;
using Microsoft.AspNet.SignalR.Infrastructure;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Table;
using System.Configuration;
using AzurenRole.Models;
using AzurenRole.Utils;
using System.Collections;
using AzurenRole;
using System.Data.Objects;
using System.Collections.Concurrent;
using Microsoft.ApplicationServer.Caching;
using System.Text.RegularExpressions;
using AzurenRole.Utils;

namespace SinalRChat
{
    public class ChatHub : Hub
    {
        class UserGroupPair
        {
            public User user { get; set; }
            public string connectionId { set; get; }
            public string groupId { set; get; }
        }
        private static readonly HashSet<UserGroupPair> GroupMap = new HashSet<UserGroupPair>();

        private static readonly ConcurrentDictionary<string, User> users = new ConcurrentDictionary<string, User>();

        public override System.Threading.Tasks.Task OnConnected()
        {
            lock (users)
            {
                users.GetOrAdd(Context.ConnectionId, _ => GlobalData.getUser(Context.User.Identity.Name));
            }
            return base.OnConnected();
        }
        public override System.Threading.Tasks.Task OnReconnected()
        {
            User u;
            users.TryGetValue(Context.ConnectionId, out u);

            User c = GlobalData.getUser(Context.User.Identity.Name);
            if (u == null) users.TryAdd(Context.ConnectionId, c);
            else if (u.id != c.id) users.TryUpdate(Context.ConnectionId, c, u);
            return base.OnReconnected();
        }

        public void Send(string groupId, string message)
        {
            string msg = WebUtility.HtmlDecode(Regex.Replace(message, @"<[^>]*>", String.Empty)).Trim();

            RoomChatEntity entity = new RoomChatEntity();
            entity.PartitionKey = groupId;
            entity.RowKey = string.Format("{0:D19}", DateTime.MaxValue.Ticks - DateTime.UtcNow.Ticks);
            entity.Author = GlobalData.user.id;
            entity.Content = message;
            entity.RoomId = groupId;
            entity.Time = DateTimeOffset.Now;

            CloudStorageAccount storageAccount = CloudStorageAccount.Parse(ConfigurationManager.ConnectionStrings["StorageConnectionString"].ConnectionString);
            CloudTableClient tableClient = storageAccount.CreateCloudTableClient();
            CloudTable table = tableClient.GetTableReference("roomchat");
            table.CreateIfNotExists();
            TableOperation to = TableOperation.Insert(entity);
            table.Execute(to);
            Clients.Group(groupId).AddNewMessageToPage(groupId, entity);
        }

        public void AddGroup(string groupId)
        {
            Groups.Add(Context.ConnectionId, groupId);

            User u;
            lock (GroupMap)
            {
                users.TryGetValue(Context.ConnectionId, out u);
                GroupMap.Add(new UserGroupPair { connectionId = Context.ConnectionId, user = u, groupId = groupId });
            }
            u = GlobalData.getUser(Context.User.Identity.Name);
            var v = GroupMap.Where(_ => _.groupId == groupId && _.user.id == u.id);
            if (v.Count() == 1) Clients.Group(groupId, new string[] { Context.ConnectionId }).UserOnline(groupId, u);

            var t = GroupMap.Where(_ => _.groupId == groupId).Select(_ => _.user).GroupBy(_ => _.id).Select(_ => _.First());
            Clients.Caller.UpdateGroupUsers(groupId, t);
        }


        public override System.Threading.Tasks.Task OnDisconnected()
        {
            User user;
            lock (users)
            {
                users.TryRemove(Context.ConnectionId, out user);
            }
            lock (GroupMap)
            {
                IEnumerable<UserGroupPair> hs = GroupMap.Where(_ => _.connectionId == Context.ConnectionId);
                foreach (UserGroupPair ugp in hs)
                {
                    var v = GroupMap.Where(_ => _.groupId == ugp.groupId && _.user.id == user.id);
                    if (v.Count() == 1) Clients.Group(ugp.groupId).UserOffline(ugp.groupId, user);
                }
                GroupMap.RemoveWhere(_ => _.connectionId == Context.ConnectionId);
            }

            return base.OnDisconnected();
        }

        public void RemoveGroup(string groupId)
        {
            Groups.Remove(Context.ConnectionId, groupId);
            lock (GroupMap)
            {
                GroupMap.RemoveWhere(_ => _.groupId == groupId && _.connectionId == Context.ConnectionId);
            }
            User u = GlobalData.getUser(Context.User.Identity.Name);
            var v = GroupMap.Where(_ => _.groupId == groupId && _.user.id == u.id);
            if (v.Count() == 0) Clients.Group(groupId).UserOffline(groupId, u);
        }

        public void GetGroupUsers(string groupId)
        {
            lock (GroupMap)
            {

                var v = GroupMap.Where(_ => _.groupId == groupId).Select(_ => _.user).GroupBy(_ => _.id).Select(_ => _.First());
                Clients.Caller.UpdateGroupUsers(groupId, v);
            }
        }

        public void GetRecent(string groupId)
        {
            CloudStorageAccount storageAccount = CloudStorageAccount.Parse(ConfigurationManager.ConnectionStrings["StorageConnectionString"].ConnectionString);
            CloudTableClient tableClient = storageAccount.CreateCloudTableClient();
            CloudTable table = tableClient.GetTableReference("roomchat");
            table.CreateIfNotExists();
            TableQuery<RoomChatEntity> query = new TableQuery<RoomChatEntity>().Where(TableQuery.GenerateFilterCondition("RoomId", QueryComparisons.Equal, groupId)).Take(20); ;
            ArrayList entities = new ArrayList();
            foreach (RoomChatEntity en in table.ExecuteQuery(query))
            {
                entities.Add(en);
            }
            entities.Reverse();
            Clients.Caller.LoadRecent(groupId, entities);
        }

        public void GetUserInfo(int[] users)
        {
            if (users.Length > 0)
            {
                AzurenEntities context = new AzurenEntities();
                ObjectQuery<User> query = context.Users.Where("it.id IN {" + String.Join(",", users) + "}");
                IList u = new ArrayList();
                foreach (User t in query.ToList<User>())
                {
                    t.password = "";
                    u.Add(t);
                }

                Clients.Caller.UpdateUserInfo(u);
            }
        }
    }
}