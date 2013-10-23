using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Configuration;
using System.Data.Objects;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;
using System.Web.Helpers;
using System.Web.UI;
using DotNetOpenAuth.OAuth2;
using Microsoft.Ajax.Utilities;

namespace AzurenRole.Utils
{
    public class LiveConnect : WebServerClient
    {
        private static readonly AuthorizationServerDescription LiveDescription = new AuthorizationServerDescription()
        {
            TokenEndpoint = new Uri("https://login.live.com/oauth20_token.srf"),
            AuthorizationEndpoint = new Uri("https://login.live.com/oauth20_authorize.srf"),
        };

        public LiveConnect()
            : base(LiveDescription)
        {
            ClientIdentifier = ConfigurationManager.AppSettings["LiveClientId"];
            ClientCredentialApplicator =
                ClientCredentialApplicator.PostParameter(ConfigurationManager.AppSettings["LiveClientSecret"]);
        }


        public async Task<User> GetUser(IAuthorizationState state, string name = null)
        {
            if (state != null && state.AccessToken != null)
            {
                var httpClient = new HttpClient(this.CreateAuthorizingHandler(state));
                using (var response = await httpClient.GetAsync("https://apis.live.net/v5.0/me"))
                {
                    response.EnsureSuccessStatusCode();
                    using (var responseStream = await response.Content.ReadAsStreamAsync())
                    {
                        string jsonStr = new StreamReader(responseStream).ReadToEnd();
                        dynamic userInfo = Json.Decode(jsonStr);
                        string id = (string) userInfo.id;
                        User u = GlobalData.dbContext.Users.SingleOrDefault(m => m.Password == id); 

                        if (u == null)
                        {
                            if (name == null)
                            {
                                return new User
                                {
                                    Id = 0
                                };
                            }
                            else
                            {
                                var user = new User
                                {
                                    Username = name,
                                    Password = userInfo.id,
                                    Email = userInfo.emails.preferred,
                                    Status = 3
                                };
                                GlobalData.dbContext.Users.AddObject(user);
                                GlobalData.dbContext.SaveChanges();
                                GlobalData.dbContext.Refresh(RefreshMode.StoreWins, user);
                                return user;
                            }
                        }
                        u.Email = userInfo.emails.preferred;
                        return u;
                    }
                }
            }
            return null;
        }

        public static class Scopes
        {
            public const string SignIn = "wl.signin";
            public const string Basic = "wl.basic";
            public const string Emails = "wl.emails";
        }
    }
}