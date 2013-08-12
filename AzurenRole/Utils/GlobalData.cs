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
        //static ConcurrentDictionary<string, User> dict = new ConcurrentDictionary<string, User>();  
        public static User getUser(string name)
        {
                User user;
                //dict.TryGetValue(name, out user);
            
                DataCache cache = new DataCache("default");
                user = (User)cache.Get(name);
             
                if (user != null) return user;
                AzurenEntities context = new AzurenEntities();
                ObjectQuery<User> query = context.Users.Where("it.username = @username", new ObjectParameter("username", name));
                string sql = query.ToString();
                user = query.First();
                //dict.TryAdd(name, user);
                cache.Put(name, user);
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