using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Data.Objects;
using Microsoft.ApplicationServer.Caching;
using Microsoft.AspNet.SignalR.Hubs;

namespace AzurenRole.Utils
{
    public class GlobalData
    {
        private static string ObjectContextKey = "AzurenContext";

        public static AzurenEntities dbContext
        {
            get
            {
                 if (HttpContext.Current.Items.Contains(ObjectContextKey))
            {
                return ((AzurenEntities)HttpContext.Current.Items[ObjectContextKey]);
            }
            else
            {
                AzurenEntities context = new AzurenEntities();
                HttpContext.Current.Items.Add(ObjectContextKey, context);
                return context;
            }
            }
        }


        public static AzurenEntities GetDBContext(HubCallerContext ctx)
        {
            if (ctx.Request.Items.ContainsKey(ObjectContextKey))
            {
                return ((AzurenEntities)HttpContext.Current.Items[ObjectContextKey]);
            }
            else
            {
                AzurenEntities context = new AzurenEntities();
                ctx.Request.Items.Add(ObjectContextKey, context);
                return context;
            }
        }

        private static string UserKey = "user";

        public static User getUser(HubCallerContext ctx)
        {
            User user;
            if (ctx.Request.Items.ContainsKey(UserKey))
            {
                return ((User)ctx.Request.Items[UserKey]);
            }
            else
            {
                ObjectQuery<User> query = GetDBContext(ctx).Users.Where("it.username = @username", new ObjectParameter("username", ctx.User.Identity.Name));
                string sql = query.ToString();
                user = query.First();
                ctx.Request.Items.Add(UserKey, user);
                return user;
            }
        }

        public static User user
        {
            get
            {

                if (HttpContext.Current.User.Identity.IsAuthenticated)
                {
                    User _user;
                    if (HttpContext.Current.Items.Contains(UserKey))
                    {
                        return ((User)HttpContext.Current.Items[UserKey]);
                    }
                    else
                    {
                        ObjectQuery<User> query = dbContext.Users.Where("it.username = @username", new ObjectParameter("username", HttpContext.Current.User.Identity.Name));
                        string sql = query.ToString();
                        _user = query.First();
                        HttpContext.Current.Items.Add(UserKey, _user);
                        return _user;
                    }
                }
                else
                {
                    return null;
                }
            }
        }
    }
}