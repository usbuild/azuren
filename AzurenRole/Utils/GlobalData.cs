using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Web;
using System.Data.Objects;
using System.Web.Http;
using Microsoft.ApplicationServer.Caching;
using Microsoft.AspNet.SignalR.Hubs;

namespace AzurenRole.Utils
{
    public static class GlobalData
    {
        public static void SendMail(string target, string subject, string body)
        {
            var client = new SmtpClient(ConfigurationManager.AppSettings["SmtpServer"],
                Int32.Parse(ConfigurationManager.AppSettings["SmtpPort"]))
            {
                UseDefaultCredentials = false,
                Credentials =
                    new NetworkCredential(ConfigurationManager.AppSettings["MailAccount"],
                       ConfigurationManager.AppSettings["MailPassword"]),
                EnableSsl = true
            };

            var fromAddr = new MailAddress(ConfigurationManager.AppSettings["MailAccount"], "Azuren OS");
            var toAddr = new MailAddress(target);
            var message = new MailMessage(fromAddr, toAddr) {Body = body, Subject = subject, IsBodyHtml = true};
            client.Send(message);
        }

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
                ObjectQuery<User> query = GetDBContext(ctx).Users.Where("it.Username = @username", new ObjectParameter("username", ctx.User.Identity.Name));
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
                        ObjectQuery<User> query = dbContext.Users.Where("it.Username = @username", new ObjectParameter("username", HttpContext.Current.User.Identity.Name));
                        string sql = query.ToString();
                        _user = query.First();
                        if (_user.Customize == null)
                        {
                            _user.Customize = new Customize()
                            {
                                Desktop = "/Images/background.jpg",
                                App = "",
                                ThemeId = 1
                            };

                            dbContext.SaveChanges();
                            dbContext.Refresh(RefreshMode.StoreWins, _user.Customize);
                        }
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