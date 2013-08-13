using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Data.Objects;
using Microsoft.ApplicationServer.Caching;

namespace AzurenRole.Utils
{
    public class GlobalData
    {
        public static AzurenEntities dbContext = new AzurenEntities();
        static ConcurrentDictionary<string, User> dict = new ConcurrentDictionary<string, User>();  
        //static DataCache cache = new DataCache("default");;
        public static User getUser(string name)
        {
                User user;
                dict.TryGetValue(name, out user);
                //user = (User)cache.Get(name);
             
                if (user != null) return user;
                ObjectQuery<User> query = dbContext.Users.Where("it.username = @username", new ObjectParameter("username", name));
                string sql = query.ToString();
                user = query.First();

                dict.TryAdd(name, user);
                //cache.Put(name, user);

                return user;
        }
        public static User user
        {
            get
            {

                if (HttpContext.Current.User.Identity.IsAuthenticated)
                {
                    return getUser(HttpContext.Current.User.Identity.Name);
                }
                else
                {
                    return null;
                }
            }
        }
    }
}